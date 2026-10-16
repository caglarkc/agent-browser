import {spawn} from 'node:child_process';
import {mkdir,readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {binaryIdentity} from '../src/engine.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const out=path.resolve(process.argv[2]||path.join(root,'artifacts','tests-'+new Date().toISOString().replace(/[:.]/g,'-')));
await mkdir(out,{recursive:true});
const tests=(await readdir(path.join(root,'test'))).filter(name=>name.endsWith('.test.mjs')).sort().map(name=>'test/'+name);
const names=[...tests,'test/fixtures.mjs','src/cli.mjs','src/fixture-progress.mjs','src/host.mjs','src/engine.mjs','src/errors.mjs','src/memory.mjs','engine/source.json','engine/manifest.json','engine/multitab.patch','package.json','package-lock.json'];
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const testSourceHashes={};
for(const name of names){const bytes=await readFile(path.join(root,name));testSourceHashes[name]=hash(bytes);const dest=path.join(out,'sources',name);await mkdir(path.dirname(dest),{recursive:true});await writeFile(dest,bytes);}
const startedAt=new Date().toISOString(),binary=await binaryIdentity();
const args=['--test','--test-concurrency=1','--test-reporter=tap',...tests];
const child=spawn(process.execPath,args,{cwd:root,stdio:['ignore','pipe','pipe']});
let tap='',errors='';child.stdout.on('data',data=>tap+=data);child.stderr.on('data',data=>errors+=data);
const exitCode=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve);});
await writeFile(path.join(out,'test.tap'),tap);if(errors)await writeFile(path.join(out,'test.stderr.txt'),errors);
const count=key=>Number(tap.match(new RegExp('^# '+key+' (\\d+)$','m'))?.[1]??NaN);
const manifest={startedAt,recordedAt:new Date().toISOString(),command:[process.execPath,...args],exitCode,
 tests:count('tests'),passed:count('pass'),failed:count('fail'),binary,testSourceHashes,tapSha256:hash(tap),
 corpus:{T01:{variants:10,repetitions:3,tabsPerCase:3}},note:'Native real targets, shared profile state, independent tab/frame history, opener/noopener storage, profile isolation, lifecycle/kill, quotas and CLI. No JEV calls.'};
await writeFile(path.join(out,'test-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({out,tests:manifest.tests,passed:manifest.passed,failed:manifest.failed,exitCode}));
if(exitCode!==0||manifest.tests!==manifest.passed)process.exitCode=1;
