import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import path from 'node:path';
const exec=promisify(execFile);
export async function readRss(roots,selfPid=process.pid){
  const {stdout}=await exec('ps',['-axo','pid=,ppid=,rss=']);
  const rows=stdout.trim().split('\n').map(line=>line.trim().split(/\s+/).map(Number));
  const trees=new Map();
  for(const root of roots.filter(Boolean)){
    const ids=new Set([root]);let changed=true;
    while(changed){changed=false;for(const [pid,ppid]of rows)if(ids.has(ppid)&&!ids.has(pid)){ids.add(pid);changed=true}}
    trees.set(root,ids);
  }
  const union=new Set([selfPid]);for(const ids of trees.values())for(const pid of ids)union.add(pid);
  const sum=ids=>rows.filter(([pid])=>ids.has(pid)).reduce((n,[,,rss])=>n+rss*1024,0);
  let usage={};
  try{const {stdout}=await exec(path.resolve('bin/browser-lab-memprobe'),[...union].map(String),{env:Object.fromEntries(Object.entries(process.env).filter(([k])=>!/(API_KEY|TOKEN|SECRET|PASSWORD)/i.test(k)))});usage=JSON.parse(stdout)}catch{}
  const footprint=ids=>{const values=[...ids].map(pid=>usage[pid]?.footprintBytes).filter(Number.isFinite);return values.length?values.reduce((a,b)=>a+b,0):null};
  return {at:performance.now(),components:Object.fromEntries([...trees].map(([root,ids])=>[root,{rssBytes:sum(ids),footprintBytes:footprint(ids),processes:ids.size,footprintProcessesMeasured:[...ids].filter(pid=>Number.isFinite(usage[pid]?.footprintBytes)).length}])),driverRssBytes:sum(new Set([selfPid])),pipelineRssBytes:sum(union),driverFootprintBytes:footprint(new Set([selfPid])),pipelineFootprintBytes:footprint(union),pipelineProcessesObserved:union.size,pipelineFootprintProcessesMeasured:[...union].filter(pid=>Number.isFinite(usage[pid]?.footprintBytes)).length};
}
export function sampler(roots,intervalMs=100){
  const samples=[];let busy=false;
  const tick=async()=>{if(busy)return;busy=true;try{samples.push(await readRss(roots))}finally{busy=false}};
  const timer=setInterval(()=>tick().catch(()=>{}),intervalMs);tick().catch(()=>{});
  return {async stop(){clearInterval(timer);while(busy)await new Promise(r=>setTimeout(r,5));return samples},async sample(){await tick();return samples.at(-1)}};
}
export function distribution(values){const a=values.filter(Number.isFinite).sort((a,b)=>a-b);const q=p=>a[Math.max(0,Math.ceil(a.length*p)-1)]??null;return {n:a.length,median:q(.5),p95:q(.95),max:a.at(-1)??null,mean:a.length?a.reduce((s,n)=>s+n,0)/a.length:null}}
