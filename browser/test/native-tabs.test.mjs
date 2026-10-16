import test from 'node:test';
import assert from 'node:assert/strict';
import {startWorker} from '../src/engine.mjs';
import {startFixtures} from './fixtures.mjs';

const wait = ms => new Promise(resolve=>setTimeout(resolve,ms));
async function setup(t) {
  const fixture=await startFixtures(); const worker=await startWorker();
  t.after(async()=>{await worker.stop();await fixture.close();});
  return {fixture,worker};
}

test('ten native targets coexist with independent DOM, network events and ticking JS', async t=>{
  const {fixture,worker}=await setup(t);
  const pages=[];
  for(let i=0;i<10;i++) {
    const page=await worker.browser.newPage(); pages.push(page);
    await page.goto(fixture.origin+'/work?label=tab-'+i);
    await page.evaluate(i=>{window.tabId=i;window.counter=0;setInterval(()=>window.counter++,20);},i);
  }
  const cdp=await pages[0].createCDPSession();
  const {targetInfos}=await cdp.send('Target.getTargets');
  const targets=targetInfos.filter(t=>t.type==='page');
  assert.equal(targets.length,10);assert.equal(new Set(targets.map(t=>t.targetId)).size,10);
  assert.equal(new Set(targets.map(t=>t.browserContextId)).size,1);
  for(let i=0;i<pages.length;i++) {
    const client=await pages[i].createCDPSession();
    const {result}=await client.send('Runtime.evaluate',{expression:'window.tabId',returnByValue:true});
    assert.equal(result.value,i,'raw target session must select its own default execution context');
    await client.detach();
  }
  const counts=await Promise.all(pages.map(p=>p.evaluate(()=>counter)));
  await wait(150);
  for(let i=0;i<pages.length;i++) {
    const observed=await pages[i].evaluate(()=>({id:tabId,counter,body:document.body.textContent}));
    assert.equal(observed.id,i);assert.ok(observed.counter>counts[i]);assert.ok(observed.body.includes('"label":"tab-'+i+'"'));
  }
  const siblingRequests=[];pages[1].on('request',r=>siblingRequests.push(r.url()));
  await pages[0].goto(fixture.origin+'/page?label=changed');
  assert.equal(siblingRequests.length,0,'network events from a sibling target must not leak');
  assert.equal(await pages[1].evaluate(()=>tabId),1,'navigation must preserve sibling execution context');
  await pages[0].close();
  await pages[1].reload();
  assert.ok((await pages[1].evaluate(()=>document.body.textContent)).includes('tab-1'));
  for(let i=2;i<pages.length;i++)assert.equal(await pages[i].evaluate(()=>tabId),i);
});

test('live native storage is shared only by origin/profile, sessionStorage belongs to the tab', async t=>{
  const {fixture,worker}=await setup(t);
  const a=await worker.browser.newPage(), b=await worker.browser.newPage();
  await a.goto(fixture.origin+'/page'); await b.goto(fixture.origin+'/page');
  await a.evaluate(()=>{localStorage.setItem('live','alpha');sessionStorage.setItem('private','a');document.cookie='live=alpha; path=/';});
  assert.deepEqual(await b.evaluate(()=>[localStorage.getItem('live'),sessionStorage.getItem('private'),document.cookie]),['alpha',null,'live=alpha']);
  await b.evaluate(()=>{localStorage.setItem('live','beta');sessionStorage.setItem('private','b');});
  assert.deepEqual(await a.evaluate(()=>[localStorage.getItem('live'),sessionStorage.getItem('private')]),['beta','a']);
  const parentHistoryLength=await a.evaluate(()=>history.length);
  await a.evaluate(url=>{
    const frame=document.createElement('iframe');frame.src=url;document.body.appendChild(frame);
  },fixture.origin+'/page');
  let child;const deadline=Date.now()+3000;
  do {
    child=await a.evaluate(()=>{const w=document.querySelector('iframe').contentWindow;
      return w?{url:w.location.href,ready:w.document.readyState,session:w.sessionStorage.getItem('private')}:{url:null,ready:null};});
    if(child.url===fixture.origin+'/page' && child.ready==='complete')break;
    await wait(20);
  }while(Date.now()<deadline);
  assert.equal(child.url,fixture.origin+'/page');assert.equal(child.ready,'complete');
  assert.equal(child.session,'a','same-origin iframe uses its top-level tab sessionStorage');
  assert.equal(await a.evaluate(()=>JSON.parse(document.querySelector('iframe').contentWindow.document.body.textContent).initialHistoryState),null);
  assert.equal(await a.evaluate(()=>history.length),parentHistoryLength,'iframe navigation must not overwrite the parent history');
  await a.goto(fixture.origin+'/page?label=next');
  assert.equal(await a.evaluate(()=>sessionStorage.getItem('private')),'a');
  const foreign=await worker.browser.newPage();
  const other=await startFixtures();t.after(()=>other.close());
  await foreign.goto(other.origin+'/page');
  assert.deepEqual(await foreign.evaluate(()=>[localStorage.getItem('live'),sessionStorage.getItem('private')]),[null,null]);
  await b.evaluate(()=>{localStorage.removeItem('live');document.cookie='live=; Max-Age=0; path=/';});
  assert.deepEqual(await a.evaluate(()=>[localStorage.getItem('live'),document.cookie]),[null,'']);
  await b.close();const fresh=await worker.browser.newPage();await fresh.goto(fixture.origin+'/page');
  assert.equal(await fresh.evaluate(()=>sessionStorage.getItem('private')),null);
});


test('opener sessionStorage is a snapshot; noopener starts without it', async t=>{
  const {fixture,worker}=await setup(t);
  const a=await worker.browser.newPage();await a.goto(fixture.origin+'/page');
  assert.deepEqual(await a.evaluate(()=>{
    sessionStorage.setItem('seed','parent');
    const child=window.open('about:blank','child');
    const copied=child.sessionStorage.getItem('seed');
    child.sessionStorage.setItem('seed','child');
    return [copied,sessionStorage.getItem('seed'),child.sessionStorage.getItem('seed')];
  }),['parent','parent','child']);
  assert.equal(await a.evaluate(url=>window.open(url,'isolated','noopener')===null,fixture.origin+'/page'),true);
  await wait(100);
  assert.equal(await a.evaluate(()=>window.open('','isolated').sessionStorage.getItem('seed')),null);

});

test('T01 corpus: 10 state variants × 3 repetitions across three real tabs', async t=>{
  const {fixture,worker}=await setup(t);
  for(let repeat=0;repeat<3;repeat++)for(let variant=0;variant<10;variant++){
    const value=`r${repeat}-v${variant}`;
    const tabs=[];for(let i=0;i<3;i++)tabs.push(await worker.browser.newPage());
    await tabs[0].goto(fixture.origin+'/page?write='+value);
    await tabs[1].goto(fixture.origin+'/page?label=two');
    await tabs[2].goto(fixture.origin+'/page?label=three');
    for(let i=0;i<3;i++)assert.deepEqual(await tabs[i].evaluate(()=>[
      localStorage.getItem('shared'),sessionStorage.getItem('tabOnly'),document.cookie,
    ]),[value,i===0?value:null,'sid='+value]);
    await tabs[1].goto(fixture.origin+'/page?label=next');
    await tabs[1].goBack();
    assert.ok((await tabs[1].evaluate(()=>document.body.textContent)).includes('"label":"two"'));
    assert.ok((await tabs[2].evaluate(()=>document.body.textContent)).includes('"label":"three"'));
    for(const tab of tabs)await tab.close();
  }
});
