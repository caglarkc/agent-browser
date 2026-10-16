// Fixed, pre-recorded memory regression protocol; never rewrites historical data.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve(process.argv[2]);
const baseline=path.resolve(process.argv[3]);
const json=async p=>JSON.parse(await readFile(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const protocol=await json(root+'/protocol.json'),g=protocol.gates;
const baseManifest=await json(baseline+'/manifest.json');
const median=a=>{a=[...a].sort((x,y)=>x-y);assert(a.length>0,'Empty measurement window');return a[Math.floor((a.length-1)/2)];};
const sameWorkload=['scripts/resource-fixture.mjs','src/resources.mjs','src/engine.mjs','src/errors.mjs','native/resource-probe.c','package.json','package-lock.json'];
const rows=[];let measuredEngine;
for(const batch of protocol.schedule){
 const dir=path.join(root,batch.directory),manifest=await json(dir+'/manifest.json');
 assert(Date.parse(protocol.recordedAt)<Date.parse(manifest.startedAt),'Protocol was not recorded before measurement');
 assert.equal(manifest.smoke,false,'Smoke is not acceptance');assert.equal(manifest.seconds,batch.seconds);
 assert.deepEqual(manifest.schedule.map(c=>c.name),batch.cases);
 assert.equal(manifest.probeSha256,baseManifest.probeSha256,'Different resource probe');
 assert.equal(manifest.machine.platform,baseManifest.machine.platform);assert.equal(manifest.machine.arch,baseManifest.machine.arch);
 assert.equal(manifest.machine.node,baseManifest.machine.node);assert.equal(manifest.machine.logicalCores,baseManifest.machine.logicalCores);
 assert.equal(manifest.machine.cpu,baseManifest.machine.cpu);assert.equal(manifest.machine.ramBytes,baseManifest.machine.ramBytes);
 for(const [name,expected]of Object.entries(manifest.sources))assert.equal(hash(await readFile(dir+'/sources/'+name)),expected,'Snapshot hash: '+name);
 for(const name of sameWorkload)assert.equal(manifest.sources[name],baseManifest.sources[name],'Workload changed: '+name);
 const engine=await json(dir+'/sources/engine/manifest.json');
 const spec=await json(dir+'/sources/engine/source.json');
 assert.equal(manifest.binary.sha256,engine.binarySha256);
 if(measuredEngine)assert.equal(engine.binarySha256,measuredEngine);else measuredEngine=engine.binarySha256;
 assert.equal(engine.patchSha256,spec.patchSha256);assert.equal(engine.sourceTreeSha256,spec.sourceTreeSha256);
 assert.equal(hash(await readFile(dir+'/sources/engine/multitab.patch')),spec.patchSha256);
 const summary=await json(dir+'/summary.json');assert.equal(summary.status,'PASS');
 for(const name of batch.cases){
  const r=await json(dir+'/'+name+'-result.json'),s=await json(dir+'/'+name+'-samples.json'),checks=await json(dir+'/'+name+'-checks.json');
  assert.deepEqual(r.config,manifest.schedule.find(c=>c.name===name));
  assert.equal(r.status,'PASS');assert.deepEqual(r.errors,[]);assert.deepEqual(r.leakedWorkerPids,[]);
  assert(r.seconds>=batch.seconds&&r.seconds<=batch.seconds+g.durationOverrunMaxSeconds,'Invalid measured duration');
  assert.equal(r.checks,checks.length);assert(checks.every(c=>c.passed),'Progress failure');
  const labels=new Set(checks.map(c=>c.state.label));assert.equal(labels.size,10,'Missing tab');
  // The producer waits 5 s AFTER each observation batch; it is fixed-delay,
  // not a 5 s fixed-rate clock. Verify temporal coverage instead of 1200 ticks.
  for(const label of labels){
   const events=checks.filter(c=>c.state.label===label);
   assert(events.length>=2,'Missing progress coverage');
   assert(events[0].at<=s[0].at+10000&&events.at(-1).at>=s.at(-1).at-10000,'Progress coverage does not span run');
   for(let i=1;i<events.length;i++)assert(events[i].at>events[i-1].at&&events[i].at-events[i-1].at<=10000,'Progress observation gap');
  }
  assert(s.length>=2,'Missing samples');
  // Busy sampler ticks can be skipped; full duration plus every <=3 s gap
  // proves coverage without inventing an exact 1 Hz sample count.
  assert(Math.abs((s.at(-1).monotonicMs-s[0].monotonicMs)/1000-r.seconds)<2,'Sample duration differs');
  const steady=s.slice(1);
  for(let i=0;i<s.length;i++){
   assert(Number.isFinite(s[i].workers.footprintBytes)&&s[i].workers.footprintBytes>0);
   assert.equal(s[i].workers.processes,1);
   if(i){assert(s[i].elapsedMs>0&&s[i].elapsedMs<=g.sampleGapMaxMs,'Observation gap');assert(s[i].monotonicMs>s[i-1].monotonicMs);assert(Number.isFinite(s[i].workers.cpuOneCorePercent));}
  }
  const first=median(steady.filter(v=>v.at<=steady[0].at+30000).map(v=>v.workers.footprintBytes));
  const last=median(steady.filter(v=>v.at>=steady.at(-1).at-30000).map(v=>v.workers.footprintBytes));
  const peak=Math.max(...s.map(v=>v.workers.footprintBytes));
  assert.equal(first,r.workerFootprint.firstWindowMedianBytes);assert.equal(last,r.workerFootprint.lastWindowMedianBytes);assert.equal(peak,r.workerFootprint.maxBytes);
  assert(peak<=g.workerPeakMaxMiB*2**20,'Worker peak memory regression');
  assert(last-first<=g.lastMinusFirst30SecondMedianMaxMiB*2**20,'Window growth regression');
  assert(r.network.requests>=batch.seconds*38,'Insufficient offered network work');
  assert(r.network.responseBodyBytes>=r.network.requests*63*1024,'Missing response payload');
  const cpu=steady.reduce((n,v)=>n+v.workers.cpuOneCorePercent*v.elapsedMs,0)/steady.reduce((n,v)=>n+v.elapsedMs,0);
  assert(Math.abs(cpu-r.workerCpuTimeWeightedPercent)<1e-9,'CPU aggregate differs');
  const old=await json(baseline+'/'+name+'-result.json');
  const row={batch:batch.directory,name,seconds:r.seconds,checks:checks.length,requests:r.network.requests,responseBodyMiB:r.network.responseBodyBytes/2**20,
   firstMiB:first/2**20,lastMiB:last/2**20,peakMiB:peak/2**20,baselinePeakMiB:old.workerFootprint.maxBytes/2**20,baselineSeconds:old.seconds,
   cpuOneCorePercent:r.workerCpuTimeWeightedPercent,rssPeakMiB:Math.max(...s.map(v=>v.workers.rssBytes))/2**20,lifetimePeakMiB:Math.max(...s.map(v=>v.workers.lifetimePeakBytes))/2**20,fdPeak:Math.max(...s.map(v=>v.workers.fds)),threadPeak:Math.max(...s.map(v=>v.workers.threads)),sampleGapMaxMs:Math.max(...steady.map(v=>v.elapsedMs)),
   diskReadBytes:steady.reduce((n,v)=>n+v.workers.diskReadBytesDelta,0),diskWriteBytes:steady.reduce((n,v)=>n+v.workers.diskWriteBytesDelta,0),gcProbe:r.gcProbe};
  if(batch.seconds>=600){
   const end=steady.at(-1).at;
   const previous=median(steady.filter(v=>v.at>=end-240000&&v.at<end-120000).map(v=>v.workers.footprintBytes));
   const final=median(steady.filter(v=>v.at>=end-120000).map(v=>v.workers.footprintBytes));
   row.previous120MiB=previous/2**20;row.last120MiB=final/2**20;
   assert(final-previous<=g.longRunLastMinusPrevious120SecondMedianMaxMiB*2**20,'Late long-run growth');
  }
  rows.push(row);
 }
}
const result={status:'PASS',verifiedAt:new Date().toISOString(),protocolSha256:hash(await readFile(root+'/protocol.json')),baseline:path.relative(root,baseline),rows,
 note:'Same local workload/probe/dependencies; engine and diagnostic selection differ. Runs are sequential and single repetitions. This is a regression guard, not a whole-process cap or A7 acceptance.'};
await writeFile(root+'/verification.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
