import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve(process.argv[2]);
const read=p=>readFile(path.join(root,p),'utf8').then(JSON.parse);
const main=await read('manifest.json'),network=await read('followups/network/manifest.json'),cpu=await read('followups/cpu/manifest.json');
const hash=b=>createHash('sha256').update(b).digest('hex');
for(const [dir,manifest]of [['network',network],['cpu',cpu]]){
 if(manifest.smoke||manifest.binary.sha256!==main.binary.sha256)throw Error('Follow-up binary/scope differs: '+dir);
 const summary=await read('followups/'+dir+'/summary.json');if(summary.status!=='PASS')throw Error('Follow-up gate failed: '+dir);
 for(const [name,want]of Object.entries(manifest.sources)){
  if(hash(await readFile(path.join(root,'followups',dir,'sources',name)))!==want)throw Error('Follow-up source differs: '+name);
  if(main.sourceHashes[name]&&main.sourceHashes[name]!==want)throw Error('Measured runtime changed since matrix: '+name);
 }
}
if(network.seconds!==120||network.probeSha256!==main.probeSha256)throw Error('Follow-up duration/probe differs');
const nr=await read('followups/network/results.json'),cr=await read('followups/cpu/results.json');
if(nr.length!==3||cr.length!==2)throw Error('Missing follow-up cases');
for(const r of nr){
 if(r.status!=='PASS'||r.seconds<120||r.seconds>125||r.leakedWorkerPids.length||r.checks<200)throw Error('Incomplete network condition or duration overrun');
 const samples=await read('followups/network/'+r.config.name+'-samples.json');
 if(samples.length<115||samples.some(s=>s.elapsedMs>3000||s.workers.footprintBytes===null))throw Error('Invalid network observation gap/coverage');
 const checks=await read('followups/network/'+r.config.name+'-checks.json');
 if(checks.length!==r.checks||checks.some(c=>!c.passed)||new Set(checks.map(c=>c.state.label)).size!==10)throw Error('Network progress invalid');
}
for(const r of cr){
 if(r.status!=='PASS'||r.sustainedSeconds<30||r.sustainedSeconds>35||r.leakedWorkerPids.length)throw Error('Incomplete CPU condition');
 const checks=await read('followups/cpu/'+r.config.name+'/checks.json');
 const samples=await read('followups/cpu/'+r.config.name+'/samples.json');
 if(samples.some(s=>s.elapsedMs>3000)||samples.filter(s=>s.phase==='sustained').length<25)throw Error('Invalid CPU observation gap/coverage');
 if(checks.length!==r.checks||checks.some(c=>!c.passed)||new Set(checks.map(c=>c.tabId)).size!==16)throw Error('CPU progress invalid');
 // Each sweep is deliberately slower under one saturated worker; require repeated observations per tab,
 // rather than assuming a sweep itself takes zero time in addition to the five-second delay.
 for(const id of new Set(checks.map(c=>c.tabId)))if(checks.filter(c=>c.tabId===id).length<3)throw Error('Insufficient per-tab CPU progress observations');
}
await writeFile(path.join(root,'followups/verification.json'),JSON.stringify({status:'PASS',binarySha256:main.binary.sha256,conditions:5,verifiedAt:new Date().toISOString(),checks:nr.reduce((n,r)=>n+r.checks,0)+cr.reduce((n,r)=>n+r.checks,0),note:'Functional/progress and evidence checks passed; this does not assert bounded/acceptable memory usage.'},null,2)+'\n');
console.log('Five follow-up conditions verified against the unchanged measured runtime and binary.');
