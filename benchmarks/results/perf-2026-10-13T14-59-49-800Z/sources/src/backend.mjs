import puppeteer from 'puppeteer-core';
import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {access,writeFile} from 'node:fs/promises';
import path from 'node:path';
import net from 'node:net';
import {snapshot} from './observation.mjs';

const exec=promisify(execFile);
export const profiles=['chromium-rendered','chromium-semantic','lightpanda-semantic','lightpanda-enhanced'];
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function freePort(){const s=net.createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const port=s.address().port;await new Promise(r=>s.close(r));return port}
export const chromePath=()=>process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
function browserEnv(){return Object.fromEntries(Object.entries(process.env).filter(([key])=>!/(API_KEY|TOKEN|SECRET|PASSWORD|TYPESAFE|DECISION_URL)/i.test(key)))}
export async function launch(profile,root) {
  if(!profiles.includes(profile))throw Error('Unknown profile');
  let browser,child,stderr='';
  if(profile.startsWith('chromium'))browser=await puppeteer.launch({executablePath:chromePath(),headless:true,env:browserEnv(),args:['--no-first-run','--no-default-browser-check'],timeout:15000,protocolTimeout:8000});
  else {
    const executable=process.env.LIGHTPANDA_PATH||path.join(root,'bin/lightpanda');await access(executable);
    const port=await freePort();
    child=spawn(executable,['serve','--host','127.0.0.1','--port',String(port)],{env:{...browserEnv(),LIGHTPANDA_DISABLE_TELEMETRY:'true'},stdio:['ignore','ignore','pipe']});
    child.stderr.on('data',b=>{stderr=(stderr+b.toString()).slice(-4000)});
    child.on('error',()=>{});
    const deadline=Date.now()+15000;
    while(Date.now()<deadline){if(child.exitCode!==null)break;try{browser=await puppeteer.connect({browserURL:`http://127.0.0.1:${port}`,protocolTimeout:8000});break}catch{await wait(150)}}
    if(!browser){child.kill();throw Error('Lightpanda connection failed: '+stderr.replace(/apikey_\S+/g,'[redacted]'))}
  }
  const pid=child?.pid||browser.process()?.pid;
  const sampler=sampleMemory(pid);
  return {profile,pid,browser,sampler,async page(){const p=await browser.newPage();if(profile.startsWith('chromium'))await p.setViewport({width:1000,height:700});return p},async close(){sampler.stop();try{if(child)await browser.disconnect();else await browser.close()}finally{if(child){child.kill('SIGTERM');await wait(150);if(child.exitCode===null)child.kill('SIGKILL')}}}};
}
function sampleMemory(rootPid){
  let peak=0,samples=0,stopped=false,busy=false,maxProcesses=0;
  const tick=async()=>{if(busy||stopped)return;busy=true;try{const {stdout}=await exec('ps',['-axo','pid=,ppid=,rss=']);const rows=stdout.trim().split('\n').map(l=>l.trim().split(/\s+/).map(Number));const tree=new Set([rootPid]);let changed=true;while(changed){changed=false;for(const [pid,ppid]of rows)if(tree.has(ppid)&&!tree.has(pid)){tree.add(pid);changed=true}}const bytes=rows.filter(([pid])=>tree.has(pid)).reduce((n,[,,rss])=>n+rss*1024,0);peak=Math.max(peak,bytes);maxProcesses=Math.max(maxProcesses,tree.size);samples++}catch{}finally{busy=false}};
  const timer=setInterval(tick,100);tick();
  return {stop(){stopped=true;clearInterval(timer)},get(){return {sampledBrowserTreePeakRssBytes:peak,samples,maxProcesses,intervalMs:100,method:'macOS ps RSS sum; shared pages may be double-counted; not cgroup total product memory',harnessRssBytes:process.memoryUsage().rss}}};
}
export async function observe(page,rendered,enhanced=false){
  const frames=page.frames();let observations=[];
  for(let i=0;i<frames.length;i++){try{const s=await frames[i].evaluate(snapshot,rendered,enhanced);if(s){s.candidates=s.candidates.map(c=>({...c,frame:i,key:`f${i}n${c.node}:${c.kind}:${c.kind==='select'?c.value:''}`}));observations.push(s)}}catch(e){if(i===0)throw e}}
  const root=observations[0];if(!root)throw Error('No document snapshot');
  return {...root,text:observations.map(s=>s.text).join('\n').slice(0,6000),candidates:observations.flatMap(s=>s.candidates),observedFrames:observations.length};
}
export async function act(page,candidate,rendered,{value,file,enhanced=false}={}){
  const frame=page.frames()[candidate.frame||0];if(!frame)throw Error('STALE_FRAME');
  if(candidate.kind==='scroll'){if(rendered)await page.mouse.wheel({deltaY:1100});else await frame.evaluate(()=>window.scrollBy(0,1100));return}
  if(candidate.kind==='visual'){
    if(!rendered)throw Error('UNSUPPORTED_VISUAL');
    const h=await page.$('canvas');const b=await h.boundingBox();await page.mouse.click(b.x+270,b.y+90);await h.dispose();return;
  }
  const handle=await frame.evaluateHandle(c=>{
    const e=window.__browserLab?.nodes.get(c.node);if(!e?.isConnected||e.disabled)throw Error('STALE_NODE');
    const ref=e.getAttribute('aria-labelledby');const name=(e.getAttribute('aria-label')||(ref?ref.split(/\s+/).map(id=>document.getElementById(id)?.textContent||'').join(' '):'')||Array.from(e.labels||[]).map(l=>{const copy=l.cloneNode(true);for(const c of copy.querySelectorAll('input,select,textarea'))c.remove();return copy.textContent}).join(' ')||e.textContent||e.getAttribute('placeholder')||e.getAttribute('title')||e.tagName).trim().replace(/\s+/g,' ').slice(0,160);
    if(c.kind!=='select'&&name!==c.label)throw Error('STALE_MEANING');
    if(c.kind!=='upload'&&c.kind!=='select'&&(e.value||'')!==c.value)throw Error('STALE_VALUE');
    return e;
  },candidate);
  try {
    const element=handle.asElement();if(!element)throw Error('Target is not an element');
    if(candidate.kind==='upload'){await element.uploadFile(file);return}
    if(rendered){
      if(candidate.kind==='click')await element.click();
      else if(candidate.kind==='fill'){await element.click({clickCount:3});await page.keyboard.press('Backspace');await element.type(value)}
      else if(candidate.kind==='select')await element.select(candidate.value);
    }else await frame.evaluate((e,c,v,enhance)=>{
      if(c.kind==='click'){
        if(enhance){e.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,button:0,buttons:1,pointerId:1,pointerType:'mouse',isPrimary:true}));e.dispatchEvent(new MouseEvent('mousedown',{bubbles:true,button:0,buttons:1}));e.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,button:0,buttons:0,pointerId:1,pointerType:'mouse',isPrimary:true}));e.dispatchEvent(new MouseEvent('mouseup',{bubbles:true,button:0,buttons:0}))}
        e.click();
      }
      else if(c.kind==='fill'){e.focus();const desc=Object.getOwnPropertyDescriptor(e.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value');desc.set.call(e,v);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
      else if(c.kind==='select'){e.value=c.value;e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}))}
    },element,candidate,value,enhanced);
  }finally{await handle.dispose()}
}
