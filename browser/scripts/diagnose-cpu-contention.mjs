import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import os from 'node:os';
import {binaryIdentity,workerEnvironment} from '../src/engine.mjs';
const root=fileURLToPath(new URL('..',import.meta.url)),out=path.resolve(process.argv[2]);await mkdir(out,{recursive:true});
const smoke=process.argv.includes('--smoke'),seconds=smoke?3:30;
const schedule=[{name:'cpu-1p16t',profiles:1,tabs:16,mode:'cpu',seconds,repeat:1},{name:'cpu-4p4t',profiles:4,tabs:4,mode:'cpu',seconds,repeat:1}];
const sources={};
for(const name of ['scripts/diagnose-cpu-contention.mjs','scripts/resource-case.mjs','scripts/resource-fixture.mjs','src/resources.mjs','src/host.mjs','src/engine.mjs','src/errors.mjs','src/memory.mjs','native/resource-probe.c','engine/manifest.json','package.json','package-lock.json']){
 const data=await readFile(path.join(root,name));sources[name]=createHash('sha256').update(data).digest('hex');const dest=path.join(out,'sources',name);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,data);
}
await writeFile(out+'/manifest.json',JSON.stringify({startedAt:new Date().toISOString(),smoke,schedule,sources,binary:await binaryIdentity(),machine:{node:process.version,platform:process.platform,cpu:os.cpus()[0]?.model,logicalCores:os.cpus().length},methodology:'16 CPU-active native tabs in one profile vs four profiles; same 10ms/100ms fixture workload. Fresh host per condition, measured by unchanged main resource-case driver. One repetition per condition; a diagnostic comparison, not confidence interval or all-machine saturation.'},null,2)+'\n');
const results=[];
let stopping=false,current;
for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>{stopping=true;current?.kill('SIGTERM')});
for(const config of schedule){
 if(stopping)break;
 console.log(JSON.stringify({starting:config.name,seconds}));const dir=path.join(out,config.name);
 const child=spawn(process.execPath,[root+'/scripts/resource-case.mjs',JSON.stringify(config),dir],{env:workerEnvironment(),stdio:['ignore','pipe','pipe']});
 current=child;
 let stdout='',stderr='';child.stdout.on('data',b=>stdout+=b);child.stderr.on('data',b=>stderr+=b);
 const code=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',resolve)});
 current=null;
 await writeFile(dir+'/stdout.txt',stdout);if(stderr)await writeFile(dir+'/stderr.txt',stderr);
 const result=JSON.parse(await readFile(dir+'/result.json','utf8'));results.push(result);
 console.log(JSON.stringify({name:config.name,status:result.status,cpuOneCorePercent:result.phases.sustained.product.cpuTimeWeightedPercent,inspectP95Ms:result.latencies.inspect?.p95,errors:result.errors}));
 if(code!==0||result.status!=='PASS')break;
}
await writeFile(out+'/results.json',JSON.stringify(results,null,2)+'\n');
const status=results.length===2&&results.every(r=>r.status==='PASS')?'PASS':'FAIL';
await writeFile(out+'/summary.json',JSON.stringify({status,smoke,completedAt:new Date().toISOString()},null,2)+'\n');if(status!=='PASS')process.exitCode=2;
