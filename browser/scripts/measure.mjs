import {fork, execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {mkdir, readFile, writeFile, mkdtemp, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {BrowserHost} from '../src/host.mjs';
import {binaryIdentity, DEFAULT_BINARY, workerEnvironment} from '../src/engine.mjs';
import {readMemory, distribution, DEFAULT_MEMPROBE} from '../src/memory.mjs';
import {checkFixtureProgress} from '../src/fixture-progress.mjs';

const root=fileURLToPath(new URL('..',import.meta.url));
const secondsArg=process.argv.indexOf('--seconds');
const seconds=secondsArg<0?600:Number(process.argv[secondsArg+1]);
if(!Number.isSafeInteger(seconds)||seconds<1||seconds>3600)throw Error('Invalid duration');
const runId='a1-'+new Date().toISOString().replace(/[:.]/g,'-');
const out=path.join(root,'artifacts',runId);await mkdir(out,{recursive:true});
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const sourceFiles=['src/host.mjs','src/fixture-progress.mjs','src/engine.mjs','src/errors.mjs','src/memory.mjs','test/fixtures.mjs','scripts/fixture-worker.mjs','scripts/measure.mjs','package.json','package-lock.json','engine/source.json','engine/manifest.json','engine/multitab.patch','scripts/build-engine.mjs'];
const sources={};
for(const name of sourceFiles){const bytes=await readFile(path.join(root,name));sources[name]=hash(bytes);const dest=path.join(out,'sources',name);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,bytes);}
const repo=path.resolve(root,'..');
const manifest={schemaVersion:1,runId,startedAt:new Date().toISOString(),platform:process.platform,arch:process.arch,
  osRelease:os.release(),node:process.version,commit:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),
  sourceHashes:sources,binary:await binaryIdentity(),binaryVersion:execFileSync(DEFAULT_BINARY,['version'],{env:workerEnvironment(),encoding:'utf8'}).trim(),
  memprobeSha256:await readFile(DEFAULT_MEMPROBE).then(hash).catch(()=>null),secondsPerSupportedTopology:seconds,
  sampleIntervalMs:1000,actionIntervalMs:5000,reloadIntervalMs:30000,
  progressRule:'Each tab must advance its native 500ms DOM timer between sustained inspections; native reload explicitly starts a fresh baseline. Frozen/stalled JS is FAIL even with intact DOM.',
  topologyOrder:[{profiles:1,tabsPerProfile:1},{profiles:1,tabsPerProfile:10},{profiles:4,tabsPerProfile:1}],
  scope:'A1 local synthetic fixtures only. No JEV, credentials, Chrome, OCR or external sites. No A2 sandbox/egress guarantee.',
  measurement:'macOS physical footprint primary when complete; RSS separate. Product=one shared Node host/measurement driver + unique worker process trees. Separate fixture child excluded. Setup sampled; sustained phase reported separately. Memory sampler overhead in driver included.',
  guard:'2 GiB sampled footprint (RSS if footprint unavailable), not an OS hard limit. 500MB capacity is not this test.'};
await writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
const fixtureProcess=fork(fileURLToPath(new URL('./fixture-worker.mjs',import.meta.url)),[],{env:workerEnvironment(),stdio:['ignore','ignore','ignore','ipc']});
const fixtureExit=once(fixtureProcess,'exit');
const [fixture]=await once(fixtureProcess,'message');
const results=[];
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let stopping=false;
process.once('SIGINT',()=>{stopping=true;});process.once('SIGTERM',()=>{stopping=true;});
try {
 for(const topology of manifest.topologyOrder){
  if(stopping)break;
  const name=`${topology.profiles}p-${topology.tabsPerProfile}t`;
  const dir=await mkdtemp(path.join(os.tmpdir(),'browser-a1-measure-'));
  const host=new BrowserHost({stateDir:dir,limits:{maxTabsPerProfile:10}});
  const samples=[],checks=[];let sampleBusy=false,sampleError,phase='setup';
  const tick=async()=>{if(sampleBusy)return;sampleBusy=true;try{
    const pids=host.profiles().filter(p=>p.pid).map(p=>p.pid);
    const memory=await readMemory(pids);samples.push({...memory,phase});
    if((memory.productFootprintBytes??memory.productRssBytes)>2*1024**3)sampleError=Error('RESOURCE_GUARD');
  }catch(e){sampleError=e}finally{sampleBusy=false}};
  const timer=setInterval(()=>void tick(),1000);await tick();
  const result={name,topology,status:'FAIL',checks:0,errors:[],secondsRequested:seconds};
  const start=performance.now();const tabs=[];let workerPids=[];
  try{
   for(let i=0;i<topology.profiles;i++){
    const id=`profile-${i}`;host.defineProfile({id,principalId:`synthetic-${i}`,policyId:'local-fixture'});
    await host.openProfile(id);
    for(let j=0;j<topology.tabsPerProfile;j++){
     const tab=await host.newTab(id);const label=`profile-${i}-tab-${j}`;
     await host.navigate(tab.id,fixture.origin+'/work?label='+label);tabs.push({id:tab.id,label});
    }
   }
   workerPids=host.profiles().map(p=>p.pid);
   result.workerPids=workerPids;result.workerCount=workerPids.length;result.tabCount=tabs.length;
   phase='sustained';const runStart=performance.now();let nextReload=runStart+30000,nextProgress=runStart;
   while(performance.now()-runStart<seconds*1000){
    if(stopping)throw Error('INTERRUPTED');if(sampleError)throw sampleError;
    for(const tab of tabs){
     const state=await host.inspect(tab.id);const check=checkFixtureProgress(state.text,tab.label,tab.lastTick);
     checks.push({at:Date.now(),tabId:tab.id,...check});result.checks++;
     if(!check.passed)throw Error(check.reason);
     tab.lastTick=check.tick;
    }
    if(performance.now()>=nextReload){for(const tab of tabs){await host.reload(tab.id);tab.lastTick=undefined;}nextReload=performance.now()+30000;}
    if(performance.now()>=nextProgress){console.log(JSON.stringify({name,elapsedSeconds:Math.round((performance.now()-runStart)/1000),checks:result.checks}));nextProgress=performance.now()+45000;}
    await delay(Math.min(5000,Math.max(1,seconds*1000-(performance.now()-runStart))));
   }
   result.sustainedSeconds=(performance.now()-runStart)/1000;
   result.status='PASS';
  }catch(error){result.status=error.code==='UNSUPPORTED_CAPABILITY'?'BLOCKED_ENGINE':'FAIL';result.errors.push({code:error.code||'MEASUREMENT_FAILED',message:error.message});}
  finally{
   clearInterval(timer);while(sampleBusy)await delay(5);await tick();
   result.elapsedMs=performance.now()-start;
   workerPids=host.profiles().filter(p=>p.pid).map(p=>p.pid);
   await host.close();
   result.leakedWorkerPids=workerPids.filter(pid=>{try{process.kill(pid,0);return true}catch{return false}});
   if(result.leakedWorkerPids.length){result.status='FAIL';result.errors.push({code:'WORKER_LEAK'});}
   const sustained=samples.filter(s=>s.phase==='sustained');
   const stats=items=>({samples:items.length,productFootprintBytes:distribution(items.map(s=>s.productFootprintBytes)),
    productRssBytes:distribution(items.map(s=>s.productRssBytes)),driverFootprintBytes:distribution(items.map(s=>s.driverFootprintBytes)),
    workerFootprintBytes:distribution(items.map(s=>{const a=Object.values(s.workers);return a.length&&a.every(w=>Number.isFinite(w.footprintBytes))?a.reduce((n,w)=>n+w.footprintBytes,0):null})),processes:distribution(items.map(s=>s.processes))});
   result.allPhases=stats(samples);result.sustained=stats(sustained);
   await writeFile(path.join(out,name+'-samples.json'),JSON.stringify(samples));
   await writeFile(path.join(out,name+'-checks.json'),JSON.stringify(checks));
   await writeFile(path.join(out,name+'-events.json'),JSON.stringify(host.events(),null,2));
   await rm(dir,{recursive:true,force:true});
  }
  results.push(result);await writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));
  console.log(JSON.stringify({name,status:result.status,checks:result.checks,summary:result.sustained}));
 }
}finally{
 fixtureProcess.send('close');await fixtureExit;
 const status=results.length===3&&results.every(r=>r.status==='PASS')?'PASS':'BLOCKED';
 await writeFile(path.join(out,'summary.json'),JSON.stringify({status,runId,results,reason:status==='PASS'?null:'A1 multi-tab gate remains open; inspect per-topology results'},null,2));
 console.log(JSON.stringify({out,status}));
 if(status!=='PASS')process.exitCode=2;
}
