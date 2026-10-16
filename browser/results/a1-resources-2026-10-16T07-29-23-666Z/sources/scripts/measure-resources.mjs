import {spawn,execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {binaryIdentity,workerEnvironment} from '../src/engine.mjs';
import {RESOURCE_PROBE} from '../src/resources.mjs';
const root=fileURLToPath(new URL('..',import.meta.url)),repo=path.resolve(root,'..');
const smoke=process.argv.includes('--smoke');
const runId='a1-resources-'+new Date().toISOString().replace(/[:.]/g,'-');
const out=path.join(root,'artifacts',runId);await mkdir(out,{recursive:true});
const matrix=[
  {name:'host-only',profiles:0,tabs:0,mode:'idle'},
  {name:'idle-1p1t',profiles:1,tabs:1,mode:'idle'},
  {name:'active-1p1t',profiles:1,tabs:1,mode:'active'},
  {name:'active-1p10t',profiles:1,tabs:10,mode:'active'},
  {name:'active-1p32t',profiles:1,tabs:32,mode:'active'},
  {name:'active-4p1t',profiles:4,tabs:1,mode:'active'},
  {name:'active-4p8t',profiles:4,tabs:8,mode:'active'},
  {name:'active-8p4t',profiles:8,tabs:4,mode:'active'},
  {name:'dom-1p10t',profiles:1,tabs:10,mode:'dom'},
  {name:'cpu-1p4t',profiles:1,tabs:4,mode:'cpu'},
  {name:'network-1p10t',profiles:1,tabs:10,mode:'network'},
  {name:'churn-1p4t',profiles:1,tabs:4,mode:'churn'},
];
const schedule=[];
for(let repeat=1;repeat<=(smoke?1:2);repeat++)for(const c of repeat===1?matrix:[...matrix].reverse())schedule.push({...c,repeat,seconds:smoke?2:30});
schedule.push({name:'soak-4p8t',profiles:4,tabs:8,mode:'active',repeat:1,seconds:smoke?5:600});
const hash=b=>createHash('sha256').update(b).digest('hex');
const sourceFiles=['package.json','package-lock.json','engine/manifest.json','engine/source.json','engine/multitab.patch',
  'native/resource-probe.c',...(await readdir(root+'/src')).filter(n=>n.endsWith('.mjs')).map(n=>'src/'+n),
  ...(await readdir(root+'/scripts')).filter(n=>n.endsWith('.mjs')).map(n=>'scripts/'+n),
  ...(await readdir(root+'/test')).filter(n=>n.endsWith('.mjs')).map(n=>'test/'+n)];
const sourceHashes={};
for(const name of sourceFiles){const b=await readFile(path.join(root,name));sourceHashes[name]=hash(b);const p=path.join(out,'sources',name);await mkdir(path.dirname(p),{recursive:true});await writeFile(p,b);}
const manifest={schemaVersion:1,runId,smoke,startedAt:new Date().toISOString(),commit:execFileSync('git',['rev-parse','HEAD'],{cwd:repo,encoding:'utf8'}).trim(),
  workingDiffSha256:hash(execFileSync('git',['diff','HEAD'],{cwd:repo})),sourceHashes,binary:await binaryIdentity(),probeSha256:hash(await readFile(RESOURCE_PROBE)),
  machine:{platform:process.platform,arch:process.arch,release:os.release(),cpu:os.cpus()[0]?.model,logicalCores:os.cpus().length,ramBytes:os.totalmem(),node:process.version,
    osVersion:execFileSync('sw_vers',[],{encoding:'utf8'}).trim(),compiler:execFileSync('cc',['--version'],{encoding:'utf8'}).split('\n')[0]},
  schedule,sampleIntervalMs:1000,baselineSeconds:3,recoverySeconds:5,
  methodology:'Fresh Node host per case; serial cases, repeat 2 reversed order. Product = host + unique worker descendants; fixture excluded and measured separately. Probe and ps short-lived children excluded; their latency recorded, host overhead included. CPU from native cumulative ns / actual elapsed monotonic time, 100% = one logical core. Machine CPU = core-percent / logical cores. RSS separate from physical footprint. Disk counters = kernel physical I/O, logical writes separate. Fixture body bytes exclude headers/CDP/TLS; no claim of per-process wire accounting. Counter deltas can miss work between process birth/death and sample, especially teardown. No watts/temperature estimate. Exact topologies/limits are diagnostic overrides, not changed production limits or A7 acceptance.',
  workloads:{idle:'200 DOM nodes; no timer/fetch',active:'200 nodes, 500ms counter, 64KiB fetch/15s; inspect/5s; reload/30s',dom:'5000 nodes/tab, 250 mutations/500ms, 64KiB fetch/15s',cpu:'4 tabs each ~10ms synchronous compute/100ms timer; checksum and operation counter verified',network:'10 tabs each 64KiB fetch/250ms, max 2 pending per tab; progress verified',churn:'4 persistent active tabs plus batches of 5 new/navigate/close tabs every >=2s; native process retained',soak:'4 profiles ×8 active tabs, 600s; reload/30s'},
  guard:'Stop on sampled product physical footprint >2GiB, system pressure >=4, sampler errors, content/progress failure, worker death or leaks. No hard OS sandbox/cap.'};
await writeFile(out+'/manifest.json',JSON.stringify(manifest,null,2)+'\n');
let stopping=false,current;
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{stopping=true;current?.kill('SIGTERM')});
const results=[];
for(const config of schedule){
  if(stopping)break;
  const dest=path.join(out,config.name+'-r'+config.repeat);
  console.log(JSON.stringify({starting:config.name,repeat:config.repeat,seconds:config.seconds,out}));
  current=spawn(process.execPath,[root+'/scripts/resource-case.mjs',JSON.stringify(config),dest],{env:workerEnvironment(),stdio:['ignore','pipe','pipe']});
  let stdout='',stderr='';current.stdout.on('data',b=>stdout+=b);current.stderr.on('data',b=>stderr+=b);
  const exit=await new Promise((resolve,reject)=>{current.once('error',reject);current.once('exit',(code,signal)=>resolve({code,signal}))});current=null;
  await writeFile(dest+'/stdout.txt',stdout);if(stderr)await writeFile(dest+'/stderr.txt',stderr);
  const result=await readFile(dest+'/result.json','utf8').then(JSON.parse).catch(()=>({config,status:'FAIL',errors:[{message:'Missing case result'}]}));
  results.push({...result,exit});await writeFile(out+'/results.json',JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify({finished:config.name,repeat:config.repeat,status:result.status,errors:result.errors}));
  if(result.status!=='PASS'||exit.code!==0){stopping=true;break;}
}
const status=results.length===schedule.length&&results.every(r=>r.status==='PASS'&&r.exit.code===0)?'PASS':'FAIL';
await writeFile(out+'/summary.json',JSON.stringify({runId,status,smoke,completedAt:new Date().toISOString(),cases:results.length,scheduled:schedule.length},null,2)+'\n');
console.log(JSON.stringify({out,status}));if(status!=='PASS')process.exitCode=2;
