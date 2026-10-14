// Read-only external compatibility probes. No screenshots, authentication or external writes.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launch} from './backend.mjs';
import {DecisionClient} from './policy.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');process.chdir(root);
for(const line of(await readFile('.env','utf8')).split('\n')){const m=line.match(/^([A-Z_]+)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2]}
const probes=[
  {id:'playwright',url:'https://playwright.dev/docs/intro',goal:'Open the Auto-waiting documentation page from the navigation links.',expected:'https://playwright.dev/docs/actionability'},
  {id:'typesafe',url:'https://docs.typesafe.ai/introduction',goal:'Open the Choice primitive documentation page from the navigation links.',expected:'https://docs.typesafe.ai/primitives/choice'},
  {id:'lightpanda',url:'https://lightpanda.io/docs/',goal:'Open the Architecture overview documentation page from the navigation links.',expected:'https://lightpanda.io/docs/core-concepts/architecture-overview'}
];
const client=new DecisionClient(0),results=[],trace=[];
const out=path.join(root,'artifacts','public-read-'+new Date().toISOString().replace(/[:.]/g,'-'));await mkdir(out,{recursive:true});
for(const probe of probes)for(const profile of ['chromium-rendered','lightpanda-enhanced']){
 let backend;const r={probe:probe.id,profile,status:'FAIL'};
 try{backend=await launch(profile,root);const page=await backend.page();await page.goto(probe.url,{waitUntil:'domcontentloaded',timeout:15000});await new Promise(resolve=>setTimeout(resolve,250));
  const state=await page.evaluate(()=>{const seen=new Set();const links=[];for(const a of document.querySelectorAll('a[href]')){const label=(a.getAttribute('aria-label')||a.textContent).trim().replace(/\s+/g,' '),url=a.href;if(!label||seen.has(url)||!url.startsWith(location.origin)||url.includes('#'))continue;seen.add(url);links.push({key:'link_'+links.length,kind:'open-observed-url',label,value:url})}return {title:document.title,text:document.body.textContent.replace(/\s+/g,' ').slice(0,2000),candidates:links.slice(0,80)}});
  const d=await client.choose({id:'public-read',goal:probe.goal},state);trace.push({probe:probe.id,profile,state,decision:{...d,action:undefined}});r.model=d.model;r.latencyMs=d.latencyMs;r.selected=d.action.value;
  if(!d.action.value||new URL(d.action.value).origin!==new URL(probe.url).origin)throw Error('No permitted observed navigation selected');
  await page.goto(d.action.value,{waitUntil:'domcontentloaded',timeout:15000});r.finalUrl=page.url();r.title=await page.title();r.status=r.selected.replace(/\/$/,'')===probe.expected&&r.finalUrl.replace(/\/$/,'')===probe.expected?'PASS':'FAIL';
 }catch(e){r.reason=String(e.message).replace(/apikey_\S+/g,'[redacted]').slice(0,1000)}finally{if(backend)await backend.close()}
 results.push(r);console.log(JSON.stringify(r));await writeFile(path.join(out,'results.json'),JSON.stringify(results,null,2));await writeFile(path.join(out,'trace.jsonl'),trace.map(t=>JSON.stringify(t)).join('\n')+'\n');
}
await writeFile(path.join(out,'manifest.json'),JSON.stringify({policy:'jev',imagesSentToModel:0,model:process.env.TYPESAFE_MODEL,apiCalls:client.calls,scope:'Three public documentation domains; observed link selection followed by direct same-origin GET navigation. Not an interaction/write benchmark.'},null,2));console.log(out);
