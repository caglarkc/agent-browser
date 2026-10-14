import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fork,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {launch,observe,act} from './backend.mjs';
import {tasks} from './tasks.mjs';
import {makeVariant} from './variants.mjs';
import {DecisionClient} from './policy.mjs';
import {OCRClient,ocrState,safeEnvironment} from './ocr-client.mjs';
import {sampler,distribution,readRss} from './metrics.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);
for(const line of(await readFile('.env','utf8')).split('\n')){const m=line.match(/^([A-Z_]+)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2]}
const args=process.argv.slice(2),option=(key,fallback)=>{const i=args.indexOf('--'+key);return i<0?fallback:args[i+1]};
const repeat=Number(option('repeat','5')),offset=Number(option('variant-offset','61'));
const selected=option('modes','chromium-dom,chromium-ocr,lightpanda-dom').split(',');
const taskIds=option('tasks','read,menu,records,css-hidden,pointer,overlay').split(',');
const phases=option('phases','cold,warm').split(',');
if(!Number.isInteger(repeat)||repeat<1||repeat>20||selected.some(m=>!['chromium-dom','chromium-ocr','lightpanda-dom'].includes(m))||taskIds.some(id=>!tasks.some(t=>t.id===id))||phases.some(p=>!['cold','warm'].includes(p)))throw Error('Invalid benchmark options');
const wait=ms=>new Promise(r=>setTimeout(r,ms)),exec=promisify(execFile),client=new DecisionClient(0);
const runId='perf-'+new Date().toISOString().replace(/[:.]/g,'-'),out=path.join(root,'artifacts',runId);await mkdir(out,{recursive:true});
let counter=0;const pending=new Map();
const worker=fork(path.join(root,'src/fixture-worker.mjs'),[],{env:safeEnvironment(),stdio:['ignore','ignore','ignore','ipc']});
const ready=new Promise(resolve=>worker.once('message',resolve));await ready;
worker.on('message',m=>{const p=pending.get(m.id);if(!p)return;pending.delete(m.id);clearTimeout(p.timer);if(m.error)p.reject(Error(m.error));else p.resolve(m.value)});
const fixture=(operation,extra={})=>new Promise((resolve,reject)=>{const id=++counter,timer=setTimeout(()=>{pending.delete(id);reject(Error('Fixture IPC timeout'))},10000);pending.set(id,{resolve,reject,timer});worker.send({id,operation,...extra})});
const results=[],decisions=[];
const sourceFiles=['src/perf.mjs','src/metrics.mjs','src/memprobe.c','src/ocr-client.mjs','src/ocr.swift','src/fixture-worker.mjs','src/backend.mjs','src/observation.mjs','src/policy.mjs','src/tasks.mjs','src/variants.mjs','src/fixtures.mjs'];
const hashes={};for(const f of sourceFiles){const b=await readFile(f);hashes[f]=createHash('sha256').update(b).digest('hex');await mkdir(path.join(out,'sources',path.dirname(f)),{recursive:true});await writeFile(path.join(out,'sources',f),b)}
const manifest={runId,repeat,offset,modes:selected,tasks:taskIds,phases,node:process.version,platform:process.platform,arch:process.arch,model:process.env.TYPESAFE_MODEL,imagesSentToJev:0,sourceHashes:hashes,lightpandaVersion:(await exec('bin/lightpanda',['version'])).stdout.trim(),ocrEngine:'Apple Vision VNRecognizeTextRequest accurate/en-US, local persistent worker',memory:'100 ms sampled RSS sum of selected browser process tree, local OCR tree if used, and driver itself. Fixture worker excluded. Shared pages may be double-counted; GPU/system service memory excluded. Not physical footprint/cgroup total.',isolation:'Cases sequential; a single benchmark browser and optional OCR worker active. User applications remain uncontrolled.',semantics:'Chromium DOM and OCR use browser-native input; Lightpanda uses enhanced semantic input. OCR input is screenshot only: no DOM/HTML for reading or target mapping. Not a vision LLM benchmark.'};
await writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
async function open(mode){const begin=performance.now(),backend=await launch(mode==='lightpanda-dom'?'lightpanda-enhanced':'chromium-rendered',root),ocr=mode==='chromium-ocr'?new OCRClient(root):null;return {backend,ocr,startupMs:performance.now()-begin}}
async function close(session){if(session.ocr)await session.ocr.close();await session.backend.close()}
async function caseRun(mode,phase,iteration,task,session,startupMs=0){
  const id=`${phase}-${mode}-${task.id}-${iteration}`,record={id,mode,phase,iteration,variant:task.variant,task:task.id,status:'FAIL',startupMs,modelCalls:0,modelMs:0,observeMs:0,captureMs:0,ocrMs:0,ocrRecognitionMs:0,actionMs:0,settleMs:0,verifyMs:0,navigationMs:0};
  const start=performance.now(),roots=[session.backend.pid,session.ocr?.process.pid].filter(Boolean),memory=sampler(roots);
  const callsBefore=client.calls;let page,extracted,lastState;const history=[];
  try{
    const run=await fixture('create',{task}),p0=performance.now();page=await session.backend.page();record.pageCreateMs=performance.now()-p0;
    const nav=performance.now();await page.goto(run.url,{waitUntil:'domcontentloaded',timeout:10000});record.navigationMs=performance.now()-nav;
    await memory.sample();const deadline=Date.now()+20000;
    for(let step=0;step<12&&Date.now()<deadline;step++){
      const v0=performance.now(),check=await fixture('verify',{token:run.token,extracted});record.verifyMs+=performance.now()-v0;if(task.id!=='read'&&check.commits>0){record.verification=check;break}
      let state;
      if(session.ocr){
        const file=path.join(out,id+'-'+step+'.png'),c0=performance.now();const bytes=await page.screenshot({path:file,type:'png'});record.captureMs+=performance.now()-c0;record.screenshotBytes=(record.screenshotBytes||0)+bytes.length;
        const o0=performance.now(),data=await session.ocr.recognize(file);record.ocrMs+=performance.now()-o0;record.ocrRecognitionMs+=data.recognitionMs;state=ocrState(data,1000,700);
      }else{const o0=performance.now();state=await observe(page,mode==='chromium-dom',mode==='lightpanda-dom');record.observeMs+=performance.now()-o0}
      state.recentActions=history.slice(-6);lastState=state;
      const decision=await client.choose(task,state);record.modelMs+=decision.latencyMs;decisions.push({id,step,model:decision.model,latencyMs:decision.latencyMs,inputBytes:decision.inputBytes,choice:decision.choice,usage:decision.usage,observation:state});
      const action=decision.action;
      if(action.kind==='report'){extracted={price:action.value};break}
      if(action.kind==='done'||action.kind==='blocked'){record.stop=action.kind;break}
      if(action.kind==='wait'){const t=performance.now();await wait(80);record.settleMs+=performance.now()-t;continue}
      const a0=performance.now();
      if(action.kind==='ocr-click')await page.mouse.click(action.x,action.y);
      else if(action.kind==='scroll'&&session.ocr)await page.mouse.wheel({deltaY:1100});
      else await act(page,action,mode==='chromium-dom',{value:task.values?.[action.label],file:path.join(root,'fixtures/sample.txt'),enhanced:mode==='lightpanda-dom'});
      record.actionMs+=performance.now()-a0;history.push({kind:action.kind,target:action.label,value:action.value});
      const settle=performance.now();await wait(150);record.settleMs+=performance.now()-settle;
    }
    const v0=performance.now();record.verification=await fixture('verify',{token:run.token,extracted});record.verifyMs+=performance.now()-v0;
    record.status=record.verification.passed?'PASS':'FAIL';record.lastObservation=lastState;record.backendVersion=await session.backend.browser.version();
  }catch(e){record.reason=String(e.message).replace(/apikey_\S+/g,'[redacted]').slice(0,1000)}finally{
    record.activeMs=performance.now()-start;record.totalMs=record.activeMs+startupMs;record.modelCalls=client.calls-callsBefore;
    const samples=await memory.stop();record.memorySamples=samples;
    const browserValues=samples.map(s=>s.components[session.backend.pid]?.rssBytes||0),ocrValues=samples.map(s=>s.components[session.ocr?.process.pid]?.rssBytes||0);
    record.memory={browserTreeRss:distribution(browserValues),ocrTreeRss:distribution(ocrValues),driverRss:distribution(samples.map(s=>s.driverRssBytes)),pipelineRss:distribution(samples.map(s=>s.pipelineRssBytes)),samples:samples.length};
    record.memory.browserFootprint=distribution(samples.map(s=>s.components[session.backend.pid]?.footprintBytes));
    record.memory.ocrFootprint=distribution(samples.map(s=>s.components[session.ocr?.process.pid]?.footprintBytes));
    record.memory.pipelineFootprint=distribution(samples.map(s=>s.pipelineFootprintBytes));
    if(page)try{await page.close()}catch{};
  }
  results.push(record);console.log(`${record.status} ${id} ${Math.round(record.totalMs)}ms browserRSS=${Math.round(record.memory.browserTreeRss.max/1e6)}MB pipelineRSS=${Math.round(record.memory.pipelineRss.max/1e6)}MB`);
  await writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));await writeFile(path.join(out,'decisions.jsonl'),decisions.map(d=>JSON.stringify(d)).join('\n')+'\n');
}
try{
  // Rotation balances case order. At most one mode's browser/worker is alive.
  if(phases.includes('cold'))for(let n=0;n<repeat;n++)for(const base of tasks.filter(t=>taskIds.includes(t.id)))for(let i=0;i<selected.length;i++){
    const mode=selected[(i+n)%selected.length],session=await open(mode);try{await caseRun(mode,'cold',n+1,makeVariant(base,offset+n),session,session.startupMs)}finally{await close(session)}
  }
  if(phases.includes('warm'))for(let n=0;n<repeat;n++)for(let i=0;i<selected.length;i++){
    const mode=selected[(i+n)%selected.length],session=await open(mode);
    try{
      // Separate, unmeasured model-free warm-up; keeps OCR caches comparable.
      const page=await session.backend.page(),run=await fixture('create',{task:makeVariant(tasks.find(t=>t.id==='read'),offset+n)});await page.goto(run.url);if(session.ocr){const f=path.join(out,`warmup-${mode}-${n}.png`);await page.screenshot({path:f});await session.ocr.recognize(f)}else await observe(page,mode==='chromium-dom',mode==='lightpanda-dom');await page.close();
      for(const base of tasks.filter(t=>taskIds.includes(t.id)))await caseRun(mode,'warm',n+1,makeVariant(base,offset+repeat+n),session,0);
    }finally{await close(session)}
  }
}finally{await fixture('close');if(worker.connected)worker.disconnect();await writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2))}
manifest.apiCalls=client.calls;manifest.finished=true;await writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
const summary={runId,groups:{}};
for(const phase of phases)for(const mode of selected){const all=results.filter(r=>r.phase===phase&&r.mode===mode),passed=all.filter(r=>r.status==='PASS');const group={n:all.length,passed:passed.length,failed:all.length-passed.length};for(const metric of ['totalMs','activeMs','startupMs','pageCreateMs','navigationMs','modelMs','observeMs','captureMs','ocrMs','actionMs','settleMs','verifyMs','modelCalls'])group[metric]=distribution(passed.map(r=>r[metric]));group.penalizedMs=distribution(all.map(r=>r.status==='PASS'?r.totalMs:20000));for(const component of ['browserTreeRss','ocrTreeRss','driverRss','pipelineRss','browserFootprint','ocrFootprint','pipelineFootprint'])group[component]=distribution(all.map(r=>r.memory[component]?.max));summary.groups[phase+'-'+mode]=group}
await writeFile(path.join(out,'summary.json'),JSON.stringify(summary,null,2));console.log(`Evidence: ${out}`);
