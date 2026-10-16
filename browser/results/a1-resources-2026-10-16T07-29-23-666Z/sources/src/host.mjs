import {EventEmitter} from 'node:events';
import {randomUUID} from 'node:crypto';
import {mkdir, writeFile, rm} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {BrowserError, requireValue} from './errors.mjs';
import {startWorker} from './engine.mjs';

export const DEFAULT_LIMITS = Object.freeze({maxWorkers: 4, maxTabsPerProfile: 8, maxTabs: 32,
  maxProfiles: 64, startupMs: 15000, navigationMs: 20000, operationMs: 5000, maxEvents: 256});
export const CAPABILITIES = Object.freeze({multipleTabsPerSession: true, sharedProfileStorageAcrossTabs: true,
  nativeSessionStorage: 'per-tab', navigation: true, history: true,
  suspend: false, persistentProfiles: false, agentAuthentication: false, osSandbox: false, enforcedEgress: false});
const publicProfile = p => ({id: p.id, principalId: p.principalId, policyId: p.policyId, state: p.state,
  sessionId: p.sessionId, workerId: p.workerId, pid: p.worker?.pid ?? null});
const publicTab = t => ({id: t.id, profileId: t.profileId, sessionId: t.sessionId,
  workerId: t.workerId, state: t.state, documentEpoch: t.documentEpoch, url: t.url});

// Trusted local SDK only in A1. No HTTP server, raw evaluate, cookie or credential API.
export class BrowserHost extends EventEmitter {
  #profiles = new Map();
  #tabs = new Map();
  #closedTabs = new Set();
  #events = [];
  #sequence = 0;
  #state = 'OPEN';
  #creatingTabs = 0;
  #closing;
  constructor({stateDir = path.join(os.tmpdir(), 'agent-browser-a1'), limits = {}, binary} = {}) {
    super();
    this.id = randomUUID();
    this.stateDir = path.resolve(stateDir);
    this.binary = binary;
    const combined = {...DEFAULT_LIMITS, ...limits};
    for (const [key, value] of Object.entries(combined)) {
      requireValue(key in DEFAULT_LIMITS && Number.isSafeInteger(value) && value > 0, 'INVALID_LIMIT', key);
    }
    this.limits = Object.freeze(combined);
  }
  capabilities() { return {...CAPABILITIES}; }
  #event(type, details = {}) {
    const event = {sequence: ++this.#sequence, type, hostId: this.id, at: Date.now(), ...details};
    this.#events.push(event);
    if (this.#events.length > this.limits.maxEvents) this.#events.shift();
    this.emit('event', structuredClone(event));
  }
  events(afterSequence = 0) {
    return {gap: this.#events.length > 0 && afterSequence < this.#events[0].sequence - 1,
      events: structuredClone(this.#events.filter(event => event.sequence > afterSequence))};
  }
  #profile(id) {
    const p = this.#profiles.get(id);
    requireValue(p, 'UNKNOWN_PROFILE');
    return p;
  }
  #serialize(p, fn) {
    const task = p.queue.then(fn);
    p.queue = task.catch(() => {});
    return task;
  }
  defineProfile({id, principalId, policyId}) {
    requireValue(this.#state === 'OPEN', 'HOST_CLOSED');
    requireValue(typeof id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(id), 'INVALID_PROFILE_ID');
    for (const v of [principalId, policyId]) requireValue(typeof v === 'string' && v.length > 0 && v.length <= 128, 'INVALID_PROFILE_BINDING');
    requireValue(!this.#profiles.has(id), 'PROFILE_EXISTS');
    requireValue(this.#profiles.size < this.limits.maxProfiles, 'RESOURCE_LIMIT');
    const p = {id, principalId, policyId, state: 'DEFINED', queue: Promise.resolve()};
    this.#profiles.set(id, p);
    return publicProfile(p);
  }
  profiles() { return [...this.#profiles.values()].map(publicProfile); }
  tabs(profileId) { return [...this.#tabs.values()].filter(t => t.profileId === profileId).map(publicTab); }
  async openProfile(id) {
    const p = this.#profile(id);
    return this.#serialize(p, async () => {
      requireValue(this.#state === 'OPEN', 'HOST_CLOSED');
      requireValue(['DEFINED', 'CLOSED'].includes(p.state), 'PROFILE_BUSY');
      const active = [...this.#profiles.values()].filter(p => ['STARTING', 'READY', 'LOST', 'CLOSING'].includes(p.state));
      requireValue(active.length < this.limits.maxWorkers, 'RESOURCE_LIMIT');
      p.state = 'STARTING';
      p.lock = path.join(this.stateDir, `${id}.lock`);
      try {
        await mkdir(this.stateDir, {recursive: true, mode: 0o700});
        try { await mkdir(p.lock, {mode: 0o700}); }
        catch (error) { if (error.code === 'EEXIST') throw new BrowserError('PROFILE_LOCKED'); throw error; }
        p.ownsLock = true;
        await writeFile(path.join(p.lock, 'owner.json'), JSON.stringify({hostId: this.id, pid: process.pid}), {mode: 0o600});
        p.worker = await startWorker({binary: this.binary, startupMs: this.limits.startupMs, operationMs: this.limits.operationMs});
        p.workerId = randomUUID();
        p.sessionId = randomUUID();
        const current = p.worker;
        current.browser.on('disconnected', () => this.#lost(p, current, 'CDP_DISCONNECTED'));
        current.exited.then(result => this.#lost(p, current, 'PROCESS_EXIT', result));
        p.state = 'READY';
        this.#event('PROFILE_READY', publicProfile(p));
        return publicProfile(p);
      } catch (error) {
        p.state = 'CLOSED';
        await this.#releaseLock(p);
        throw error;
      }
    });
  }
  #lost(p, worker, reason, exit) {
    if (p.worker !== worker || p.state !== 'READY') return;
    p.state = 'LOST';
    for (const t of this.#tabs.values()) {
      if (t.workerId !== p.workerId || t.state !== 'OPEN') continue;
      t.state = 'LOST';
      this.#event('TAB_LOST', {...publicTab(t), reason});
    }
    this.#event('WORKER_LOST', {...publicProfile(p), reason, exit});
    // Keep the profile lock until process termination is confirmed by closeProfile.
    void worker.stop().catch(() => {});
  }
  async #releaseLock(p) {
    if (p.ownsLock) { await rm(p.lock, {recursive: true, force: true}); p.ownsLock = false; }
  }
  #ready(p) {
    requireValue(this.#state === 'OPEN', 'HOST_CLOSED');
    requireValue(p.state === 'READY', p.state === 'LOST' ? 'WORKER_LOST' : 'SESSION_NOT_READY');
  }
  async newTab(profileId) {
    const p = this.#profile(profileId);
    return this.#serialize(p, async () => {
      this.#ready(p);
      const profileCount = this.tabs(profileId).filter(t => t.state === 'OPEN').length;
      const total = [...this.#tabs.values()].filter(t => t.state === 'OPEN').length;
      requireValue(profileCount < this.limits.maxTabsPerProfile && total + this.#creatingTabs < this.limits.maxTabs, 'RESOURCE_LIMIT');
      this.#creatingTabs++;
      let page;
      try { page = await p.worker.browser.newPage(); }
      finally { this.#creatingTabs--; }
      const t = {id: randomUUID(), profileId, sessionId: p.sessionId, workerId: p.workerId,
        page, state: 'OPEN', documentEpoch: 0, url: page.url()};
      this.#tabs.set(t.id, t);
      page.setDefaultNavigationTimeout(this.limits.navigationMs);
      page.setDefaultTimeout(this.limits.operationMs);
      page.on('framenavigated', frame => {
        if (frame !== page.mainFrame() || t.state !== 'OPEN') return;
        t.documentEpoch++;
        t.url = frame.url();
        this.#event('TAB_NAVIGATED', publicTab(t));
      });
      page.on('close', () => {
        if (t.state !== 'OPEN') return;
        t.state = 'CLOSED';
        this.#event('TAB_CLOSED', publicTab(t));
        this.#forgetTab(t);
      });
      try {
        const events = await page.createCDPSession();
        events.on('Browser.profileStateChanged', event => {
          if (p.state !== 'READY' || event.generation <= (p.storageGeneration ?? 0)) return;
          p.storageGeneration = event.generation;
          this.#event('PROFILE_STATE_CHANGED', {profileId:p.id, sessionId:p.sessionId,
            generation:event.generation, kind:'cookies'});
        });
        await events.send('Browser.watchProfileState');
      } catch (error) {
        try { await page.close(); } catch {}
        this.#forgetTab(t);
        throw error;
      }
      this.#event('TAB_OPENED', publicTab(t));
      return publicTab(t);
    });
  }
  #tab(id) {
    const t = this.#tabs.get(id);
    requireValue(t, this.#closedTabs.has(id) ? 'TAB_CLOSED' : 'UNKNOWN_TAB');
    requireValue(t.state === 'OPEN', t.state === 'LOST' ? 'WORKER_LOST' : 'TAB_CLOSED');
    this.#ready(this.#profile(t.profileId));
    return t;
  }
  #forgetTab(t) {
    this.#tabs.delete(t.id);
    this.#closedTabs.add(t.id);
    if (this.#closedTabs.size > 256) this.#closedTabs.delete(this.#closedTabs.values().next().value);
  }
  #url(url) {
    let u;
    try { u = new URL(url); } catch { throw new BrowserError('INVALID_URL'); }
    requireValue(u.protocol === 'http:' && ['127.0.0.1', '[::1]'].includes(u.hostname) && !u.username && !u.password,
      'A1_FIXTURE_ONLY', 'Only loopback HTTP fixture URLs are accepted before A2');
    return u.href;
  }
  async #operation(id, fn) {
    const initial = this.#tab(id);
    return this.#serialize(this.#profile(initial.profileId), async () => {
      const t = this.#tab(id);
      try { return await fn(t); }
      catch (error) {
        if (this.#profile(t.profileId).state === 'LOST') throw new BrowserError('WORKER_LOST');
        throw error;
      }
    });
  }
  async navigate(id, url) {
    const target = this.#url(url);
    return this.#operation(id, async t => {
      const response = await t.page.goto(target, {waitUntil: 'domcontentloaded'});
      t.url = t.page.url();
      return {...publicTab(t), httpStatus: response?.status() ?? null};
    });
  }
  back(id) { return this.#operation(id, async t => { await t.page.goBack({waitUntil: 'domcontentloaded'}); t.url = t.page.url(); return publicTab(t); }); }
  forward(id) { return this.#operation(id, async t => { await t.page.goForward({waitUntil: 'domcontentloaded'}); t.url = t.page.url(); return publicTab(t); }); }
  reload(id) { return this.#operation(id, async t => { await t.page.reload({waitUntil: 'domcontentloaded'}); return publicTab(t); }); }
  inspect(id) {
    return this.#operation(id, async t => ({...publicTab(t), ...await t.page.evaluate(() => ({
      url: location.href, title: document.title, text: (document.body?.textContent || '').slice(0,8192),
      readyState: document.readyState,
    }))}));
  }
  async suspend(id) { this.#tab(id); throw new BrowserError('UNSUPPORTED_CAPABILITY', 'Native suspend is not implemented'); }
  closeTab(id) {
    return this.#operation(id, async t => {
      await t.page.close();
      if (t.state === 'OPEN') { t.state = 'CLOSED'; this.#event('TAB_CLOSED', publicTab(t)); this.#forgetTab(t); }
    });
  }
  async closeProfile(id) {
    const p = this.#profile(id);
    return this.#serialize(p, async () => {
      p.state = 'CLOSING';
      await p.worker?.stop();
      for (const t of [...this.#tabs.values()]) {
        if (t.profileId !== id) continue;
        t.state = 'CLOSED'; this.#event('TAB_CLOSED', publicTab(t)); this.#forgetTab(t);
      }
      p.storageGeneration = 0;
      p.worker = null;
      await this.#releaseLock(p);
      p.state = 'CLOSED';
      this.#event('PROFILE_CLOSED', publicProfile(p));
    });
  }
  async close() {
    if (this.#closing) return this.#closing;
    this.#state = 'CLOSING';
    this.#closing = Promise.all([...this.#profiles.keys()].map(id => this.closeProfile(id)))
      .then(() => { this.#state = 'CLOSED'; });
    return this.#closing;
  }
}
