// Follow-up to the fixed A1 matrix. Isolates native engine capture policy with the same workload.
import {fork,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import {startWorker,binaryIdentity,workerEnvironment} from '../src/engine.mjs';
import {readResources,RESOURCE_PROBE} from '../src/resources.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const out=path.resolve(process.argv[2]);await mkdir(out,{recursive:true});
const smoke=process.argv.includes('--smoke');
const option=name=>process.argv.find(arg=>arg.startsWith(name+'='))?.slice(name.length+1);
const seconds=smoke?3:Number(option('--seconds')??120);
if(!Number.isInteger(seconds)||seconds<1||seconds>1800)throw Error('Invalid diagnostic duration');
const only=option('--case');
const hash=b=>createHash('sha256').update(b).digest('hex');
const sources={};
for(const name of ['scripts/diagnose-network-memory.mjs','scripts/resource-fixture.mjs','src/resources.mjs','src/engine.mjs','src/errors.mjs','native/resource-probe.c','engine/manifest.json','engine/source.json','engine/multitab.patch','package.json','package-lock.json']){
 const data=await readFile(path.join(root,name));sources[name]=hash(data);const dest=path.join(out,'sources',name);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,data);
}
const cases=[{name:'default-reload',capture:'default',reloadMs:30000},{name:'default-continuous',capture:'default',reloadMs:0},{name:'zero-capture-continuous',capture:'zero',reloadMs:0}];
if(only&&!cases.some(c=>c.name===only))throw Error('Invalid diagnostic case');
const schedule=only?cases.filter(c=>c.name===only):cases;
await writeFile(out+'/manifest.json',JSON.stringify({startedAt:new Date().toISOString(),smoke,seconds,schedule,sources,machine:{platform:process.platform,arch:process.arch,node:process.version,cpu:os.cpus()[0]?.model,logicalCores:os.cpus().length,ramBytes:os.totalmem()},probeSha256:hash(await readFile(RESOURCE_PROBE)),binary:await binaryIdentity(),commit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),methodology:'Separate post-matrix engine diagnostic: one fresh native worker and fixture per condition, ten native pages. Same verified engine, Puppeteer, fixture and resource sampler. Default vs zero Network capture budgets, with/without 30 s reload. No capture override in default cases; worker behavior is pinned by the recorded engine source/patch. Optional --seconds and --case select a longer run without changing workload logic. Shared diagnostic Node survives conditions; compare worker metrics, not driver memory as fresh-process equivalents.'},null,2)+'\n');
const results=[];let stopping=false;
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>stopping=true);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
for(const config of schedule){
 if(stopping)break;
 console.log(JSON.stringify({starting:config.name,seconds}));
 const fixture=fork(root+'/scripts/resource-fixture.mjs',[],{env:workerEnvironment(),stdio:['ignore','ignore','inherit','ipc']});
 const fixtureExit=once(fixture,'exit');const [{origin}]=await once(fixture,'message');
 const stats=()=>new Promise((resolve,reject)=>{
   const id=String(Math.random()),timer=setTimeout(()=>{fixture.off('message',handler);reject(Error('fixture stats timeout'))},3000);
   const handler=m=>{if(m.id===id){clearTimeout(timer);fixture.off('message',handler);resolve(m)}};fixture.on('message',handler);fixture.send({method:'stats',id});
 });
 let worker,previous,busy=false,error;const samples=[],checks=[],result={config,status:'FAIL',errors:[]};
 const sample=async()=>{if(busy)return;busy=true;try{const s=await readResources(worker?[worker.pid]:[],fixture.pid,previous);previous=s;samples.push(s);if(s.elapsedMs>3000)throw Error('OBSERVATION_GAP');if(s.workers.footprintBytes===null||s.product.footprintBytes>2*1024**3||s.system.pressureLevel>=4)throw Error('RESOURCE_GUARD');}catch(e){error=e;}finally{busy=false;}};
 let timer;
 try{
  worker=await startWorker();result.workerPid=worker.pid;
  const tabs=[];
  for(let i=0;i<10;i++){
   const page=await worker.browser.newPage();
   if(config.capture==='zero'){
    const cdp=await page.createCDPSession();await cdp.send('Network.enable',{maxTotalBufferSize:0,maxResourceBufferSize:0});
   }
   await page.goto(origin+'/?mode=network&label=t'+i,{waitUntil:'domcontentloaded'});tabs.push({page,label:'t'+i,lastTick:null,lastFetches:null});
  }
  await wait(1500);await sample();const netStart=await stats();
  timer=setInterval(()=>void sample(),1000);
  const start=performance.now();let nextCheck=start,nextReload=start+config.reloadMs,nextLog=start;
  while(performance.now()-start<seconds*1000){
   if(stopping)throw Error('INTERRUPTED');if(error)throw error;
   if(performance.now()>=nextCheck){
    for(const tab of tabs){
     const state=await tab.page.evaluate(()=>JSON.parse(document.getElementById('state').textContent));
     const passed=state.label===tab.label&&(tab.lastTick===null||state.tick>tab.lastTick)&&(tab.lastFetches===null||state.fetches>tab.lastFetches);
     checks.push({at:Date.now(),passed,state});if(!passed)throw Error('FIXTURE_PROGRESS');tab.lastTick=state.tick;tab.lastFetches=state.fetches;
    }
    nextCheck=performance.now()+5000;
   }
   if(config.reloadMs&&performance.now()>=nextReload){for(const tab of tabs){await tab.page.reload({waitUntil:'domcontentloaded'});tab.lastTick=null;tab.lastFetches=null;}nextReload=performance.now()+config.reloadMs;}
   if(performance.now()>=nextLog){console.log(JSON.stringify({name:config.name,seconds:Math.round((performance.now()-start)/1000),workerMiB:samples.at(-1).workers.footprintBytes/1024**2}));nextLog=performance.now()+30000;}
   await wait(Math.min(100,Math.max(1,seconds*1000-(performance.now()-start))));
  }
  result.seconds=(performance.now()-start)/1000;if(result.seconds>seconds+5)throw Error('DURATION_OVERRUN');const netEnd=await stats();result.network={requests:netEnd.requests-netStart.requests,responseBodyBytes:netEnd.responseBodyBytes-netStart.responseBodyBytes};result.status='PASS';
 }catch(e){result.errors.push({message:e.message,code:e.code});}
 finally{
  clearInterval(timer);while(busy)await wait(5);await sample();
  if(worker&&result.status==='PASS'){
   const before=await readResources([worker.pid],fixture.pid);
   try{
    const session=await worker.browser.pages().then(pages=>pages[0].createCDPSession());
    const start=performance.now();await session.send('HeapProfiler.collectGarbage');await wait(250);
    const after=await readResources([worker.pid],fixture.pid);
    result.gcProbe={status:'SUPPORTED',ms:performance.now()-start,beforeWorkerBytes:before.workers.footprintBytes,afterWorkerBytes:after.workers.footprintBytes,note:'Explicit diagnostic GC after the measured interval; ongoing fixture fetches are not paused. Not a production optimization.'};
   }catch(e){result.gcProbe={status:'UNAVAILABLE',message:e.message};}
  }
  await worker?.stop();fixture.send('close');await fixtureExit;
  result.leakedWorkerPids=worker?[worker.pid].filter(pid=>{try{process.kill(pid,0);return true}catch{return false}}):[];
  if(error||result.leakedWorkerPids.length){result.status='FAIL';result.errors.push({message:error?.message||'WORKER_LEAK'});}
  const steady=samples.slice(1),window=Math.min(30,seconds/2)*1000;
  const first=steady.filter(s=>s.at<=steady[0]?.at+window),last=steady.filter(s=>s.at>=steady.at(-1)?.at-window);
  const median=a=>{const v=a.map(s=>s.workers.footprintBytes).sort((a,b)=>a-b);return v[Math.floor((v.length-1)/2)]??null;};
  result.checks=checks.length;result.workerFootprint={firstWindowMedianBytes:median(first),lastWindowMedianBytes:median(last),lastBytes:samples.at(-1)?.workers.footprintBytes,maxBytes:Math.max(...samples.map(s=>s.workers.footprintBytes))};
  result.workerCpuTimeWeightedPercent=steady.length?steady.reduce((n,s)=>n+(s.workers.cpuOneCorePercent??0)*s.elapsedMs,0)/steady.reduce((n,s)=>n+s.elapsedMs,0):null;
  for(const [name,data]of Object.entries({result,samples,checks}))await writeFile(path.join(out,config.name+'-'+name+'.json'),JSON.stringify(data,null,name==='result'?2:0)+'\n');
  results.push(result);await writeFile(out+'/results.json',JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify(result));
 }
 if(result.status!=='PASS')break;
}
const status=results.length===schedule.length&&results.every(r=>r.status==='PASS')?'PASS':'FAIL';
await writeFile(out+'/summary.json',JSON.stringify({status,smoke,completedAt:new Date().toISOString()},null,2)+'\n');
if(status!=='PASS')process.exitCode=2;
