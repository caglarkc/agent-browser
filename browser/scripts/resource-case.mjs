import {fork} from 'node:child_process';
import {once} from 'node:events';
import {mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {monitorEventLoopDelay,performance} from 'node:perf_hooks';
import {BrowserHost} from '../src/host.mjs';
import {workerEnvironment} from '../src/engine.mjs';
import {readResources} from '../src/resources.mjs';
import {distribution} from '../src/memory.mjs';

const config=JSON.parse(process.argv[2]),out=process.argv[3];
await mkdir(out,{recursive:true});
const fixture=fork(fileURLToPath(new URL('./resource-fixture.mjs',import.meta.url)),[],{env:workerEnvironment(),stdio:['ignore','ignore','inherit','ipc']});
const fixtureExit=once(fixture,'exit');const [{origin}]=await once(fixture,'message');
const fixtureStats=()=>new Promise((resolve,reject)=>{
  const id=String(Math.random()),timer=setTimeout(()=>{fixture.off('message',handler);reject(Error('fixture stats timeout'))},3000);
  const handler=m=>{if(m.id===id){clearTimeout(timer);fixture.off('message',handler);resolve(m)}};
  fixture.on('message',handler);fixture.send({method:'stats',id});
});
const dir=await mkdtemp(path.join(os.tmpdir(),'browser-resource-'));
const host=new BrowserHost({stateDir:dir,limits:{maxWorkers:Math.max(4,config.profiles),maxTabs:Math.max(32,config.profiles*config.tabs+1),maxTabsPerProfile:Math.max(8,config.tabs+1)}});
const samples=[],checks=[],operations=[],events=[];
host.on('event',e=>events.push(e));
const lag=monitorEventLoopDelay({resolution:20});lag.enable();let elu=performance.eventLoopUtilization();
let phase='baseline',previous,busy=false,samplingError,stopping=false;
process.once('SIGTERM',()=>stopping=true);process.once('SIGINT',()=>stopping=true);
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const sample=async()=>{
  if(busy)return;busy=true;
  try{
    const s=await readResources(host.profiles().filter(p=>p.pid).map(p=>p.pid),fixture.pid,previous);
    previous=s;
    const now=performance.eventLoopUtilization();const interval=performance.eventLoopUtilization(now,elu);elu=now;
    samples.push({...s,phase,driverHeap:process.memoryUsage(),eventLoop:{utilization:interval.utilization,p99Ms:lag.count?lag.percentile(99)/1e6:null,maxMs:lag.count?lag.max/1e6:null}});lag.reset();
    if(s.product.footprintBytes===null||s.product.cpuOneCorePercent===null&&samples.length>1&&phase==='sustained')throw Error('INCOMPLETE_RESOURCE_SAMPLE');
    if(s.product.footprintBytes>2*1024**3)throw Error('PRODUCT_MEMORY_GUARD');
    if(s.system.pressureLevel>=4)throw Error('SYSTEM_PRESSURE_GUARD');
  }catch(e){samplingError=e;}finally{busy=false;}
};
const timer=setInterval(()=>void sample(),1000);
const op=async(name,fn)=>{const t=performance.now();try{const value=await fn();operations.push({at:Date.now(),phase,name,ms:performance.now()-t,ok:true});return value;}catch(e){operations.push({at:Date.now(),phase,name,ms:performance.now()-t,ok:false,error:e.code||e.message});throw e;}};
const tabs=[],result={config,status:'FAIL',errors:[],workerPids:[],checks:0,startedAt:new Date().toISOString()};
let netStart,netEnd;
try{
  await sample();await wait(3000);
  phase='setup';
  for(let i=0;i<config.profiles;i++){
    const profileId='resource-'+i;host.defineProfile({id:profileId,principalId:'synthetic-'+i,policyId:'local-fixture'});
    await op('openProfile',()=>host.openProfile(profileId));
    for(let j=0;j<config.tabs;j++){
      const tab=await op('newTab',()=>host.newTab(profileId));const label=`p${i}-t${j}`;
      await op('navigate',()=>host.navigate(tab.id,origin+`/?mode=${config.mode}&label=${label}`));tabs.push({...tab,label,lastTick:null,lastFetches:null});
    }
  }
  result.workerPids=host.profiles().map(p=>p.pid);await wait(1500);
  // Prime counters after topology is complete. Interval crossing setup is not pooled into sustained CPU.
  await sample();while(busy)await wait(5);
  netStart=await fixtureStats();phase='sustained';const start=performance.now();let nextReload=start+30000,nextAction=start;
  while(performance.now()-start<config.seconds*1000){
    if(stopping)throw Error('INTERRUPTED');if(samplingError)throw samplingError;
    if(performance.now()>=nextAction){
      await Promise.all(Array.from({length:config.profiles},async(_,i)=>{
        for(const tab of tabs.filter(t=>t.profileId==='resource-'+i)){
          const observed=await op('inspect',()=>host.inspect(tab.id));
          const text=observed.text.match(/^\{"label"[^\n]*?\}/)?.[0];
          const state=text?JSON.parse(text):null;
          const passed=!!state&&state.label===tab.label&&state.rows===(config.mode==='dom'?5000:200)
            &&(config.mode==='idle'||tab.lastTick===null||state.tick>tab.lastTick)
            &&(config.mode!=='network'||tab.lastFetches===null||state.fetches>tab.lastFetches)
            &&(config.mode!=='cpu'||state.ops>0);
          checks.push({at:Date.now(),tabId:tab.id,passed,state});result.checks++;
          if(!passed)throw Error('FIXTURE_PROGRESS_OR_CONTENT');tab.lastTick=state.tick;tab.lastFetches=state.fetches;
        }
      }));
      if(config.mode==='churn')for(let n=0;n<5;n++){
        const t=await op('churnNewTab',()=>host.newTab('resource-0'));
        await op('churnNavigate',()=>host.navigate(t.id,origin+'/?mode=active&label=churn'));
        await op('churnCloseTab',()=>host.closeTab(t.id));
      }
      nextAction=performance.now()+(config.mode==='churn'?2000:5000);
    }
    if(config.mode!=='idle'&&performance.now()>=nextReload){
      for(const tab of tabs){await op('reload',()=>host.reload(tab.id));tab.lastTick=null;tab.lastFetches=null;}
      nextReload=performance.now()+30000;
    }
    await wait(Math.min(100,Math.max(1,config.seconds*1000-(performance.now()-start))));
  }
  result.sustainedSeconds=(performance.now()-start)/1000;netEnd=await fixtureStats();result.status='PASS';
}catch(e){result.errors.push({code:e.code||'EXPERIMENT_FAILED',message:e.message});}
finally{
  phase='teardown';
  result.workerPids=[...new Set([...result.workerPids,...host.profiles().filter(p=>p.pid).map(p=>p.pid)])];
  try{await op('closeHost',()=>host.close());}catch(e){result.status='FAIL';result.errors.push({message:e.message});}
  result.leakedWorkerPids=result.workerPids.filter(pid=>{try{process.kill(pid,0);return true}catch{return false;}});
  if(result.leakedWorkerPids.length){result.status='FAIL';result.errors.push({message:'WORKER_LEAK'});}
  phase='recovery';await wait(5000);clearInterval(timer);while(busy)await wait(5);await sample();lag.disable();
  if(samplingError){result.status='FAIL';result.errors.push({message:samplingError.message});}
  fixture.send('close');await fixtureExit;await rm(dir,{recursive:true,force:true});
  const stats=items=>{
    const metrics={};
    for(const group of ['product','workers','driver','fixture']){
      metrics[group]={};
      for(const key of ['footprintBytes','rssBytes','lifetimePeakBytes','cpuOneCorePercent','cpuMachinePercent','threads','fds','sockets','processes'])metrics[group][key]=distribution(items.map(s=>s[group][key]));
      const cpu=items.filter(s=>Number.isFinite(s[group].cpuOneCorePercent)&&s.elapsedMs>0);
      metrics[group].cpuTimeWeightedPercent=cpu.length?cpu.reduce((n,s)=>n+s[group].cpuOneCorePercent*s.elapsedMs,0)/cpu.reduce((n,s)=>n+s.elapsedMs,0):null;
      for(const key of ['diskReadBytes','diskWriteBytes','logicalWriteBytes','pageins','faults','contextSwitches','idleWakeups','interruptWakeups']){
        const valid=items.filter(s=>Number.isFinite(s[group][key+'Delta']));
        metrics[group][key+'DeltaTotal']=valid.length?valid.reduce((n,s)=>n+s[group][key+'Delta'],0):null;
      }
    }
    return {samples:items.length,...metrics,probeMs:distribution(items.map(s=>s.probeMs)),eventLoopP99Ms:distribution(items.map(s=>s.eventLoop.p99Ms)),systemCpuBusyPercent:distribution(items.map(s=>s.system.systemCpuBusyPercent))};
  };
  result.phases=Object.fromEntries(['baseline','setup','sustained','teardown','recovery'].map(p=>[p,stats(samples.filter(s=>s.phase===p))]));
  result.latencies=Object.fromEntries([...new Set(operations.map(o=>o.name))].map(name=>[name,distribution(operations.filter(o=>o.name===name&&o.ok).map(o=>o.ms))]));
  result.network=netStart&&netEnd?{requests:netEnd.requests-netStart.requests,responseBodyBytes:netEnd.responseBodyBytes-netStart.responseBodyBytes,requestBodyBytes:netEnd.requestBodyBytes-netStart.requestBodyBytes,scope:'Fixture HTTP body bytes; excludes headers, CDP/WebSocket, TLS and external traffic'}:null;
  result.probeFailures=result.errors.filter(e=>e.message?.includes('RESOURCE_SAMPLE')).length;
  for(const [name,data] of Object.entries({result,samples,checks,operations,events}))await writeFile(path.join(out,name+'.json'),JSON.stringify(data,null,name==='result'?2:0)+'\n');
  console.log(JSON.stringify({case:config.name,repeat:config.repeat,status:result.status,checks:result.checks,product:result.phases.sustained.product,errors:result.errors}));
  if(result.status!=='PASS')process.exitCode=2;
}
