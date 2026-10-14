import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
import {tasks} from './tasks.mjs';
import {startFixtures} from './fixtures.mjs';
import {launch,profiles,observe,act,chromePath} from './backend.mjs';
import {scriptedChoice,DecisionClient} from './policy.mjs';
import {makeVariant} from './variants.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
try{for(const line of(await readFile('.env','utf8')).split('\n')){const m=line.match(/^([A-Z_]+)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2]}}catch{}
const args=process.argv.slice(2),command=args.shift()||'doctor';
function option(name,fallback){const i=args.indexOf('--'+name);return i<0?fallback:args[i+1]}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const sanitize=s=>String(s).replace(/apikey_[A-Za-z0-9_]+/g,'[redacted]').slice(0,1200);
if(command==='serve'){
  const fixtures=await startFixtures(Number(option('port','8767')));console.log(fixtures.origin);
  for(const task of tasks)console.log(task.id,fixtures.create(task.id).url);
  process.on('SIGINT',async()=>{await fixtures.close();process.exit(0)});
}else if(command==='doctor'){
  const report={node:process.version,platform:process.platform,arch:process.arch,credentialPresent:Boolean(process.env.TYPESAFE_API_KEY),liveCallMade:false,backendChecks:{}};
  for(const profile of ['chromium-rendered','lightpanda-semantic']){let b;try{b=await launch(profile,root);const page=await b.page();await page.goto('data:text/html,<title>Doctor</title><button>Ready</button>');const s=await observe(page,profile.endsWith('rendered'));report.backendChecks[profile]={status:s.candidates.some(c=>c.label==='Ready')?'PASS':'FAIL',version:await b.browser.version()};await page.close()}catch(e){report.backendChecks[profile]={status:'FAIL',error:sanitize(e.message)}}finally{if(b)await b.close()}}
  console.log(JSON.stringify(report,null,2));if(Object.values(report.backendChecks).some(c=>c.status!=='PASS'))process.exitCode=1;
}else if(command==='run'){
  const policy=option('policy','scripted'),repeat=Number(option('repeat','1')),selected=option('profiles',profiles.join(',')).split(','),taskIds=option('tasks',tasks.map(t=>t.id).join(',')).split(',');
  const variantOffset=Number(option('variant-offset','0')),vary=args.includes('--vary');
  const verifyEachStep=args.includes('--verify-each-step');
  if(!Number.isInteger(variantOffset)||variantOffset<0)throw Error('Invalid variant offset');
  if(!['scripted','jev'].includes(policy)||!Number.isInteger(repeat)||repeat<1||repeat>20||selected.some(p=>!profiles.includes(p))||taskIds.some(id=>!tasks.some(t=>t.id===id)))throw Error('Invalid run configuration');
  const client=policy==='jev'?new DecisionClient(Number(option('max-calls','30'))):null;
  const runId=new Date().toISOString().replace(/[:.]/g,'-'),out=path.join(root,'artifacts',runId);await mkdir(out,{recursive:true});
  const fixtures=await startFixtures();const results=[],traces=[];
  const order=[];for(let n=0;n<repeat;n++)for(const baseTask of tasks.filter(t=>taskIds.includes(t.id)))for(let i=0;i<selected.length;i++)order.push({task:makeVariant(baseTask,vary?n+variantOffset:0),profile:selected[(i+n)%selected.length],iteration:n+1});
  const sourceFiles=['src/backend.mjs','src/observation.mjs','src/policy.mjs','src/tasks.mjs','src/variants.mjs','src/fixtures.mjs','src/cli.mjs'];
  const sourceContents=await Promise.all(sourceFiles.map(async f=>[f,await readFile(f)]));
  const sourceHashes=Object.fromEntries(sourceContents.map(([f,bytes])=>[f,createHash('sha256').update(bytes).digest('hex')]));
  for(const [f,bytes] of sourceContents){await mkdir(path.join(out,'sources',path.dirname(f)),{recursive:true});await writeFile(path.join(out,'sources',f),bytes)}
  const binary=process.env.LIGHTPANDA_PATH||'bin/lightpanda';
  const lightpanda={sha256:createHash('sha256').update(await readFile(binary)).digest('hex'),version:(await promisify(execFile)(binary,['version'])).stdout.trim()};
  const manifest={schemaVersion:1,runId,policy,repeat,profiles:selected,tasks:taskIds,order:order.map(({task,profile,iteration})=>({task:task.id,profile,iteration})),node:process.version,platform:process.platform,arch:process.arch,decisionModel:policy==='jev'?process.env.TYPESAFE_MODEL:null,endpoint:policy==='jev'?(process.env.DECISION_URL?'local-configured':'typesafe'):null,maxCalls:client?.maxCalls===Infinity?'unlimited':client?.maxCalls||0,imagesSentToModel:0,measurement:'Fresh browser per case; startup/navigation included in total; RSS samples are browser tree only, not capacity proof; action settling fixed at 150 ms in all profiles',visualMode:'Scripted canvas probe has fixture-defined coordinates; Jev has no vision fallback',sourceHashes,lightpanda,dependencies:JSON.parse(await readFile('package-lock.json','utf8')).packages['node_modules/puppeteer-core'].version};
  await writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
  manifest.verifyEachStep=verifyEachStep;await writeFile(path.join(out,'manifest.json'),JSON.stringify(manifest,null,2));
  try{for(const {task,profile,iteration}of order){
    const started=performance.now(),callsBefore=client?.calls||0,id=`${task.id}-${profile}-${iteration}`,run=fixtures.create(task.id,task),rendered=profile==='chromium-rendered',enhanced=profile==='lightpanda-enhanced';
    const result={id,task:task.id,variant:task.variant,profile,policy,iteration,status:'FAIL',steps:0,modelCalls:0,modelLatencyMs:0,observeMs:0,actionMs:0,totalMs:0};
    let backend,page,extracted,cursor=0,decisions=0;const errors=[],recentActions=[];
    try{
      const t=performance.now();backend=await launch(profile,root);result.startupMs=performance.now()-t;result.backendVersion=await backend.browser.version();page=await backend.page();page.on('pageerror',e=>errors.push(sanitize(e.message)));page.on('console',m=>{if(m.type()==='error')errors.push(sanitize(m.text()))});
      const nav=performance.now();await page.goto(run.url,{waitUntil:'domcontentloaded',timeout:10000});result.navigationMs=performance.now()-nav;
      if(task.visual&&(!rendered||policy==='jev')){result.status='UNSUPPORTED';result.reason='Pixel-dependent task; this profile/policy has no visual execution path'}
      else{
        const deadline=Date.now()+20000;
        while(result.steps<12&&decisions<12&&Date.now()<deadline){
          if(verifyEachStep&&task.id!=='read'){const check=fixtures.verify(run.token);if(check.commits>0){result.stoppedByVerifier=true;break}}
          const t0=performance.now(),state=await observe(page,rendered,enhanced);state.recentActions=recentActions.slice(-6);result.observeMs+=performance.now()-t0;result.lastObservation={text:state.text,candidates:state.candidates,observedFrames:state.observedFrames,declaredFrames:state.frameCount,excludedCandidates:state.excludedCandidates};
          if(task.id==='read'&&policy==='scripted'){const price=state.text.match(/\b(\d+) TRY\b/);extracted=price?{price:price[0]}:null;break}
          let action;
          if(policy==='scripted')action=scriptedChoice(task,state,cursor);
          else{decisions++;result.modelCalls++;const decision=await client.choose(task,state);action=decision.action;result.modelLatencyMs+=decision.latencyMs;traces.push({id,step:result.steps,decision:{...decision,action:undefined},observation:state})}
          if(action.kind==='report'){result.declaredReport=true;extracted={price:action.value};break}
          if(action.kind==='done'){result.declaredDone=true;break}
          if(action.kind==='blocked'){result.reason='Policy returned BLOCKED';break}
          if(action.kind==='wait'){await sleep(80);if(policy==='scripted'&&Date.now()>deadline-15000)throw Error('Expected control did not appear');continue}
          // Record dispatch before mutation. No automatic action retries.
          traces.push({id,step:result.steps,dispatch:{kind:action.kind,label:action.label,key:action.key}});
          const a0=performance.now();await act(page,action,rendered,{value:task.values?.[action.label],file:path.join(root,'fixtures/sample.txt'),enhanced});
          if(action.kind==='fill'&&action.role==='combobox'){try{await page.frames()[action.frame||0].waitForFunction(()=>Boolean(document.querySelector('[role="option"]')),{polling:50,timeout:800})}catch{/* bounded readiness wait; next snapshot retains actual state */}}
          result.actionMs+=performance.now()-a0;recentActions.push({kind:action.kind,target:action.label,value:task.values?.[action.label]||action.value});result.steps++;cursor++;await sleep(150);
        }
        await sleep(100);const verified=fixtures.verify(run.token,extracted);result.verification=verified;result.status=verified.passed?'PASS':'FAIL';result.falseSuccess=Boolean((result.declaredDone||result.declaredReport)&&!verified.passed);
        if(!verified.passed&&!result.reason)result.reason='Independent fixture oracle did not confirm exactly one correct result';
      }
      result.finalTitle=await page.title();result.finalUrl=page.url();
      result.totalMs=performance.now()-started;
      result.memory=backend.sampler.get();backend.sampler.stop();
      if(rendered){const evidenceStarted=performance.now(),screenshot=path.join(out,id+'.png');await page.screenshot({path:screenshot});result.screenshot=path.basename(screenshot);result.evidenceMs=performance.now()-evidenceStarted}
    }catch(e){result.status=e.message.includes('CALL_BUDGET')?'BUDGET_EXHAUSTED':'FAIL';result.reason=sanitize(e.message);result.verification=fixtures.verify(run.token,extracted)}finally{
      result.totalMs ||= performance.now()-started;result.modelCalls=(client?.calls||0)-callsBefore;result.pageErrors=errors;if(backend){result.memory ||= backend.sampler.get();try{await backend.close()}catch(e){result.cleanupError=sanitize(e.message)}}
    }
    results.push(result);console.log(`${result.status.padEnd(16)} ${id} ${Math.round(result.totalMs)}ms ${result.reason||''}`);
    await writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));await writeFile(path.join(out,'trace.jsonl'),traces.map(t=>JSON.stringify(t)).join('\n')+'\n');
    if(client&&client.calls>=client.maxCalls){console.log('Global call budget reached; remaining cases are NOT_RUN.');for(const next of order.slice(results.length))results.push({task:next.task.id,profile:next.profile,iteration:next.iteration,status:'NOT_RUN',reason:'Global call budget reached'});break}
  }}finally{await fixtures.close();await writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2))}
  const lines=['# Browser lab run',`Policy: ${policy}. Paid API calls: ${client?.calls||0}.`,`Results: ${results.filter(r=>r.status==='PASS').length} PASS, ${results.filter(r=>r.status==='FAIL').length} FAIL, ${results.filter(r=>r.status==='UNSUPPORTED').length} UNSUPPORTED.`, '', '| Task | Profile | Status | Total ms | Calls | Reason |','|---|---|---|---:|---:|---|',...results.map(r=>`| ${r.task} | ${r.profile} | ${r.status} | ${Math.round(r.totalMs||0)} | ${r.modelCalls||0} | ${r.reason||''} |`),'','Fresh startup included. Scripted success measures driver/fixture compatibility, not model intelligence. Canvas PASS uses fixture-defined coordinates, not AI vision. macOS sampled browser RSS is not Linux cgroup memory or a 60-session capacity result.'];
  await writeFile(path.join(out,'REPORT.md'),lines.join('\n'));console.log(`Evidence: ${out}`);
  if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
}else throw Error('Unknown command');
