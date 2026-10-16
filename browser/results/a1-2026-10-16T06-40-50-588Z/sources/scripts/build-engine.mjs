import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile, writeFile, mkdir, access, mkdtemp, rm, copyFile, chmod} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('..',import.meta.url));
const spec=JSON.parse(await readFile(path.join(root,'engine/source.json'),'utf8'));
const sha=async file=>{const h=createHash('sha256');for await(const bytes of createReadStream(file))h.update(bytes);return h.digest('hex');};
const work=path.join(root,'engine-work');await mkdir(work,{recursive:true});
const env={...process.env};
const tools=path.join(work,'tools');
const bundledZig=path.join(tools,`zig-${process.arch==='arm64'?'aarch64':'x86_64'}-${process.platform==='darwin'?'macos':'linux'}-${spec.zigVersion}`);
try{await access(bundledZig);env.PATH=bundledZig+path.delimiter+env.PATH;}catch{}
try{await access(path.join(tools,'cargo/bin/rustc'));env.CARGO_HOME=path.join(tools,'cargo');env.RUSTUP_HOME=path.join(tools,'rustup');env.PATH=path.join(tools,'cargo/bin')+path.delimiter+env.PATH;}catch{}
function run(command,args,cwd=root,capture=false){return new Promise((resolve,reject)=>{
 const child=spawn(command,args,{cwd,env,stdio:capture?['ignore','pipe','inherit']:'inherit'});let output='';child.stdout?.on('data',bytes=>output+=bytes);
 child.on('error',reject);child.on('exit',(code,signal)=>code===0?resolve(output.trim()):reject(Error(`${command} failed (${code??signal})`)));
});}
const archive=path.join(work,'upstream.tar.gz');
try{await access(archive);}catch{await run('curl',['-fL','--retry','2','--output',archive,`${spec.upstream}/archive/${spec.commit}.tar.gz`]);}
if(await sha(archive)!==spec.archiveSha256)throw Error('Upstream archive checksum mismatch');
const patch=path.join(root,'engine/multitab.patch');
if(await sha(patch)!==spec.patchSha256)throw Error('Native patch checksum mismatch');
const verifyOnly=process.argv.includes('--verify-patch');
const source=verifyOnly?await mkdtemp(path.join(work,'verify-')):path.join(work,'source');
const receipt=path.join(source,'.agent-browser-source.json');
try{
 let exists=false;try{await access(source);exists=true;}catch{}
 if(!exists||verifyOnly){
  await mkdir(source,{recursive:true});
  await run('tar',['-xzf',archive,'--strip-components=1','-C',source]);
  await run('patch',['--batch','--forward','-p1','-i',patch],source);
  await writeFile(receipt,JSON.stringify({archiveSha256:spec.archiveSha256,patchSha256:spec.patchSha256})+'\n');
 }else{
  const saved=JSON.parse(await readFile(receipt,'utf8'));
  if(saved.archiveSha256!==spec.archiveSha256||saved.patchSha256!==spec.patchSha256)throw Error('Existing source differs; preserve it and use a fresh engine-work/source directory');
 }
 for(const [name,expected]of Object.entries(spec.patchedSourceHashes))if(await sha(path.join(source,name))!==expected)throw Error('Patched source differs: '+name);
 const listing=await run('tar',['-tzf',archive],root,true);
 const sourceNames=listing.split('\n').filter(name=>name&&!name.endsWith('/')).map(name=>name.slice(name.indexOf('/')+1)).sort();
 const tree=createHash('sha256');
 for(const name of sourceNames)tree.update(name+'\0'+await sha(path.join(source,name))+'\n');
 if(sourceNames.length!==spec.sourceFileCount||tree.digest('hex')!==spec.sourceTreeSha256)throw Error('Full native source tree differs from pinned archive + patch');

 if(verifyOnly){console.log('Pinned archive + native patch verified in a fresh source tree');}
 else{
  const zig=await run('zig',['version'],root,true);const rust=await run('rustc',['--version'],root,true);
  if(zig!==spec.zigVersion||!rust.startsWith('rustc '+spec.rustVersion+' '))throw Error(`Expected Zig ${spec.zigVersion}, Rust ${spec.rustVersion}; got ${zig}, ${rust}`);
  await run('make',['download-v8'],source);
  const v8=spec.prebuiltV8[process.platform+'-'+process.arch];
  if(v8 && await sha(path.join(source,v8.path))!==v8.sha256)throw Error('Prebuilt V8 checksum mismatch');
  await run('make',['build',`ZIGFLAGS=-Dversion=${spec.version}`],source);
  const binary=path.join(root,'bin/lightpanda');await mkdir(path.dirname(binary),{recursive:true});
  await copyFile(path.join(source,'zig-out/bin/lightpanda'),binary);await chmod(binary,0o755);
  const manifest={schemaVersion:1,upstreamCommit:spec.commit,archiveSha256:spec.archiveSha256,patchSha256:spec.patchSha256,sourceTreeSha256:spec.sourceTreeSha256,
   binarySha256:await sha(binary),buildMode:'ReleaseFast',snapshot:true,version:spec.version,zig,rust,
   platform:process.platform,arch:process.arch,builtAt:new Date().toISOString()};
  await writeFile(path.join(root,'engine/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify(manifest));
 }
}finally{if(verifyOnly)await rm(source,{recursive:true,force:true});}
