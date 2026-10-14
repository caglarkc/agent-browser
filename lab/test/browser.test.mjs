import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {launch,observe,act} from '../src/backend.mjs';
import {startFixtures} from '../src/fixtures.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');

test('Freshness rejects a replaced or renamed target before dispatch',async()=>{
  const fixtures=await startFixtures();let backend;
  try{
    backend=await launch('chromium-semantic',root);const page=await backend.page();const run=fixtures.create('menu');await page.goto(run.url);
    let state=await observe(page,false);const candidate=state.candidates[0];await page.evaluate(()=>{document.querySelector('button').textContent='Different action'});
    await assert.rejects(act(page,candidate,false),/STALE_MEANING/);
    state=await observe(page,false);await page.evaluate(()=>document.querySelector('button').remove());
    await assert.rejects(act(page,state.candidates[0],false),/STALE_NODE/);
    assert.equal(fixtures.verify(run.token).commits,0);
  }finally{if(backend)await backend.close();await fixtures.close()}
});
test('Rendered observation excludes covered and CSS-hidden controls; semantic visibility remains unknown',async()=>{
  const fixtures=await startFixtures();let backend;
  try{
    backend=await launch('chromium-rendered',root);const page=await backend.page();await page.goto(fixtures.create('overlay').url);
    const rendered=await observe(page,true);assert.equal(rendered.candidates.some(c=>c.label==='Continue'),false);
    const semantic=await observe(page,false);assert.equal(semantic.candidates.find(c=>c.label==='Continue').visibility,'unknown-without-layout');
    await page.goto(fixtures.create('css-hidden').url);assert.equal((await observe(page,true)).candidates.length,1);assert.equal((await observe(page,false)).candidates.length,2);
  }finally{if(backend)await backend.close();await fixtures.close()}
});
