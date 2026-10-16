import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {BrowserHost} from '../src/host.mjs';
import {workerEnvironment, startWorker, LEGACY_BINARY} from '../src/engine.mjs';
import {startFixtures} from './fixtures.mjs';

const code = expected => error => error.code === expected;
async function setup(t, limits = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'browser-a1-test-'));
  const host = new BrowserHost({stateDir: dir, limits});
  const fixture = await startFixtures();
  t.after(async () => { await host.close(); await fixture.close(); await rm(dir, {recursive: true, force: true}); });
  return {host, fixture, dir};
}
async function profile(host, id = 'one') {
  host.defineProfile({id, principalId: id, policyId: 'fixtures-only'});
  return host.openProfile(id);
}
function state(result) { return JSON.parse(result.text); }
async function until(fn) {
  const deadline = Date.now() + 3000;
  while (!fn()) { assert.ok(Date.now() < deadline, 'event did not arrive'); await new Promise(r => setTimeout(r, 10)); }
}

test('profile bindings, positive limits and engine environment are bounded', () => {
  const host = new BrowserHost();
  assert.throws(() => host.defineProfile({id: '../escape', principalId:'a',policyId:'b'}), code('INVALID_PROFILE_ID'));
  assert.throws(() => new BrowserHost({limits:{maxWorkers:0}}), code('INVALID_LIMIT'));
  assert.throws(() => new BrowserHost({limits:{typo:1}}), code('INVALID_LIMIT'));
  host.defineProfile({id:'one',principalId:'a',policyId:'b'});
  assert.throws(() => host.defineProfile({id:'one',principalId:'a',policyId:'different'}), code('PROFILE_EXISTS'));
  assert.ok(Object.keys(workerEnvironment()).every(key => ['PATH','TMPDIR','TMP','TEMP','LANG','LC_ALL','SYSTEMROOT','LIGHTPANDA_DISABLE_TELEMETRY'].includes(key)));
});

test('real Lightpanda page: JS, independent epoch and native back/forward/reload', async t => {
  const {host, fixture} = await setup(t);
  const p = await profile(host);
  const tab = await host.newTab(p.id);
  await host.navigate(tab.id, fixture.origin + '/page?label=first');
  const first = await host.inspect(tab.id);
  assert.equal(state(first).label,'first');
  await host.navigate(tab.id, fixture.origin + '/page?label=second');
  const second = await host.inspect(tab.id);
  assert.ok(second.documentEpoch > first.documentEpoch);
  await host.back(tab.id);
  assert.equal(state(await host.inspect(tab.id)).label,'first');
  await host.forward(tab.id);
  assert.equal(state(await host.inspect(tab.id)).label,'second');
  await host.reload(tab.id);
  assert.equal(state(await host.inspect(tab.id)).label,'second');
  await assert.rejects(host.navigate(tab.id, 'https://example.com'), code('A1_FIXTURE_ONLY'));
  await assert.rejects(host.suspend(tab.id), code('UNSUPPORTED_CAPABILITY'));
});

test('native same-profile tabs share cookies/localStorage, isolate sessionStorage and history', async t => {
  const {host, fixture} = await setup(t);
  await profile(host);
  const a = await host.newTab('one'), b = await host.newTab('one');
  assert.equal(a.workerId,b.workerId); assert.equal(a.sessionId,b.sessionId);
  await host.navigate(a.id, fixture.origin+'/page?label=a&write=alpha');
  const epochA = (await host.inspect(a.id)).documentEpoch;
  await host.navigate(b.id, fixture.origin+'/page?label=b');
  let observed = state(await host.inspect(b.id));
  assert.equal(observed.local,'alpha'); assert.equal(observed.cookie,'sid=alpha'); assert.equal(observed.session,null);
  assert.equal(fixture.requests.at(-1).cookie,'sid=alpha');
  assert.equal((await host.inspect(a.id)).documentEpoch,epochA,'sibling navigation cannot change epoch');
  await host.navigate(b.id, fixture.origin+'/page?label=b2&write=beta');
  await host.navigate(a.id, fixture.origin+'/page?label=a');
  observed=state(await host.inspect(a.id));
  assert.equal(observed.local,'beta'); assert.equal(observed.cookie,'sid=beta'); assert.equal(observed.session,'alpha');
  await host.back(b.id); assert.equal(state(await host.inspect(b.id)).label,'b');
  assert.equal(state(await host.inspect(a.id)).label,'a');
  await host.forward(b.id); assert.equal(state(await host.inspect(b.id)).label,'b2');
  const beforeLogout=host.events().events.at(-1).sequence;
  await host.navigate(b.id, fixture.origin+'/logout');
  assert.ok(host.events(beforeLogout).events.some(e=>e.type==='PROFILE_STATE_CHANGED' && e.kind==='cookies'));
  await host.reload(a.id);
  observed=state(await host.inspect(a.id));
  assert.equal(observed.local,null); assert.equal(observed.cookie,''); assert.equal(observed.session,'alpha');
  await host.closeTab(a.id);
  await host.reload(b.id); assert.equal(state(await host.inspect(b.id)).label,'fixture');
  const c=await host.newTab('one'); await host.navigate(c.id,fixture.origin+'/page');
  assert.equal(state(await host.inspect(c.id)).session,null);
  assert.equal(host.tabs('one').length,2);
  assert.equal(host.capabilities().multipleTabsPerSession,true);
});

test('raw pinned-engine probe reproduces TargetAlreadyLoaded without host policy', async t => {
  const worker = await startWorker({binary:LEGACY_BINARY,allowLegacyProbe:true}); t.after(()=>worker.stop());
  const page=await worker.browser.newPage();
  assert.equal(page.url(),'about:blank');
  await assert.rejects(worker.browser.newPage(), /TargetAlreadyLoaded/);
});

test('two profile workers have distinct PIDs and no cookie/local/session storage leakage', async t => {
  const {host, fixture} = await setup(t);
  const a = await profile(host,'alpha'); const b = await profile(host,'beta');
  assert.notEqual(a.pid,b.pid); assert.notEqual(a.workerId,b.workerId); assert.notEqual(a.sessionId,b.sessionId);
  const ta=await host.newTab('alpha'),tb=await host.newTab('beta');
  await host.navigate(ta.id,fixture.origin+'/page?write=alpha');
  await host.navigate(tb.id,fixture.origin+'/page');
  const clean=state(await host.inspect(tb.id));
  assert.equal(clean.local,null); assert.equal(clean.session,null); assert.equal(clean.cookie,'');
  await host.navigate(tb.id,fixture.origin+'/page?write=beta');
  await host.navigate(ta.id,fixture.origin+'/page');
  const own=state(await host.inspect(ta.id));
  assert.equal(own.local,'alpha'); assert.equal(own.session,'alpha'); assert.equal(own.cookie,'sid=alpha');
  assert.equal(fixture.requests.at(-1).cookie,'sid=alpha','fixture server must also see the correct native cookie jar');
  await host.navigate(tb.id,fixture.origin+'/logout');
  await host.navigate(ta.id,fixture.origin+'/page');
  assert.equal(state(await host.inspect(ta.id)).cookie,'sid=alpha');
  assert.equal(fixture.requests.at(-1).cookie,'sid=alpha');
});

test('cross-host profile lock survives collision, releases only after worker exit', async t => {
  const {host, fixture, dir} = await setup(t);
  const other = new BrowserHost({stateDir:dir}); t.after(()=>other.close());
  const p=await profile(host);
  other.defineProfile({id:'one',principalId:'one',policyId:'fixtures-only'});
  await assert.rejects(other.openProfile('one'),code('PROFILE_LOCKED'));
  const tab=await host.newTab('one');await host.navigate(tab.id,fixture.origin+'/page');
  await host.closeProfile('one');
  assert.throws(()=>process.kill(p.pid,0));
  const reopened=await other.openProfile('one');
  assert.notEqual(reopened.sessionId,p.sessionId);
});

test('worker kill marks its tab lost, preserves other profile and invalidates old IDs', async t => {
  const {host, fixture} = await setup(t);
  const a=await profile(host,'alpha');await profile(host,'beta');
  const ta=await host.newTab('alpha'),ta2=await host.newTab('alpha'),ta3=await host.newTab('alpha'),tb=await host.newTab('beta');
  await host.navigate(tb.id,fixture.origin+'/page?label=survivor');
  process.kill(a.pid,'SIGKILL');
  await until(()=>host.events().events.some(e=>e.type==='WORKER_LOST' && e.workerId===a.workerId));
  assert.equal(host.tabs('alpha').length,3);
  assert.ok(host.tabs('alpha').every(t=>t.state==='LOST'));
  for (const tab of [ta2,ta3]) await assert.rejects(host.inspect(tab.id),code('WORKER_LOST'));
  await assert.rejects(host.inspect(ta.id),code('WORKER_LOST'));
  await assert.rejects(host.openProfile('alpha'),code('PROFILE_BUSY'));
  assert.equal(state(await host.inspect(tb.id)).label,'survivor');
  await host.closeProfile('alpha');
  const next=await host.openProfile('alpha');assert.notEqual(next.sessionId,a.sessionId);
  const nextTab=await host.newTab('alpha');assert.notEqual(nextTab.id,ta.id);
  await assert.rejects(host.inspect(ta.id),code('TAB_CLOSED'));
});

test('worker and tab quotas reserve admission under concurrent creation; events are bounded', async t => {
  const {host} = await setup(t,{maxWorkers:1,maxTabs:1,maxEvents:3});
  host.defineProfile({id:'a',principalId:'a',policyId:'p'});
  host.defineProfile({id:'b',principalId:'b',policyId:'p'});
  const starts=await Promise.allSettled([host.openProfile('a'),host.openProfile('b')]);
  assert.equal(starts.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(starts.find(r=>r.status==='rejected').reason.code,'RESOURCE_LIMIT');
  const p=host.profiles().find(p=>p.state==='READY');
  const tabs=await Promise.allSettled([host.newTab(p.id),host.newTab(p.id)]);
  assert.equal(tabs.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(tabs.find(r=>r.status==='rejected').reason.code,'RESOURCE_LIMIT');
  const tab=tabs.find(r=>r.status==='fulfilled').value;
  await host.closeTab(tab.id);
  await assert.rejects(host.inspect(tab.id),code('TAB_CLOSED'));
  const fresh=await host.newTab(p.id);assert.notEqual(fresh.id,tab.id);
  assert.equal(host.events().events.length,3);assert.equal(host.events().gap,true);
});

test('failed startup releases owned profile lock and closed host rejects new work', async t => {
  const {host,dir} = await setup(t);
  const broken=new BrowserHost({stateDir:dir,binary:'/nonexistent/lightpanda'});
  broken.defineProfile({id:'failed',principalId:'a',policyId:'b'});
  await assert.rejects(broken.openProfile('failed'));
  await broken.close();
  await assert.rejects(broken.openProfile('failed'),code('HOST_CLOSED'));
  host.defineProfile({id:'failed',principalId:'a',policyId:'b'});
  const recovered=await host.openProfile('failed');
  assert.equal(recovered.state,'READY');
});

test('closing during worker startup joins pending work and leaves no engine process', async t => {
  const {host}=await setup(t);
  host.defineProfile({id:'starting',principalId:'a',policyId:'p'});
  const opening=host.openProfile('starting');
  await new Promise(r=>setTimeout(r,20));
  const closing=host.close();
  const opened=await opening;
  await Promise.all([closing,host.close()]);
  assert.equal(host.profiles()[0].state,'CLOSED');
  assert.throws(()=>process.kill(opened.pid,0));
});

test('global tab reservation also applies across different profile queues', async t => {
  const {host} = await setup(t,{maxTabs:1});
  await profile(host,'a');await profile(host,'b');
  const results=await Promise.allSettled([host.newTab('a'),host.newTab('b')]);
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(results.find(r=>r.status==='rejected').reason.code,'RESOURCE_LIMIT');
});
