import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {access} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import net from 'node:net';
import {fileURLToPath} from 'node:url';
import puppeteer from 'puppeteer-core';
import {BrowserError} from './errors.mjs';

export const DEFAULT_BINARY = fileURLToPath(new URL('../../lab/bin/lightpanda', import.meta.url));
export const PINNED_SHA256 = '955440053a84754dd64c62f970449a56a2b350cdf43ea5f2e809a73047b8173d';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
export function workerEnvironment() {
  // Positive allowlist. No API key, token, proxy credentials or Node options inherited.
  const env = {LIGHTPANDA_DISABLE_TELEMETRY: 'true'};
  for (const key of ['PATH', 'TMPDIR', 'TMP', 'TEMP', 'LANG', 'LC_ALL', 'SYSTEMROOT']) {
    if (process.env[key]) env[key] = process.env[key];
  }
  return env;
}
async function freePort() {
  const server = net.createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}
export async function binaryIdentity(binary = DEFAULT_BINARY) {
  await access(binary);
  const digest = createHash('sha256');
  for await (const chunk of createReadStream(binary, {highWaterMark: 64 * 1024})) digest.update(chunk);
  return {sha256: digest.digest('hex')};
}
export async function startWorker({binary = DEFAULT_BINARY, startupMs = 15000, operationMs = 5000} = {}) {
  const identity = await binaryIdentity(binary);
  if (identity.sha256 !== PINNED_SHA256) {
    throw new BrowserError('UNVERIFIED_ENGINE', 'A1 supports only the lab-pinned Lightpanda binary');
  }
  const port = await freePort();
  const child = spawn(binary, ['serve', '--host', '127.0.0.1', '--port', String(port),
    '--v8-max-heap-mb', '64', '--http-max-concurrent', '16', '--http-max-host-open', '4',
    '--ws-max-concurrent', '4', '--http-max-response-size', String(16 * 1024 * 1024),
    '--http-timeout', '15000', '--disable-metrics'],
  {env: workerEnvironment(), stdio: ['ignore', 'ignore', 'ignore']});
  let spawnError;
  child.on('error', error => { spawnError = error; });
  const exited = new Promise(resolve => child.once('exit', (code, signal) => resolve({code, signal})));
  let browser;
  const stop = async () => {
    try { await browser?.disconnect(); } catch { /* already disconnected */ }
    if (child.exitCode !== null || child.signalCode !== null || spawnError) return;
    child.kill('SIGTERM');
    let timer;
    const timeout = new Promise(resolve => { timer = setTimeout(() => resolve(false), 5000); });
    const finished = await Promise.race([exited.then(() => true), timeout]);
    clearTimeout(timer);
    if (!finished) { child.kill('SIGKILL'); await exited; }
  };
  try {
    const deadline = performance.now() + startupMs;
    while (performance.now() < deadline) {
      if (spawnError || child.exitCode !== null || child.signalCode !== null) {
        throw new BrowserError('ENGINE_START_FAILED');
      }
      try {
        const response = await fetch(`http://127.0.0.1:${port}/json/version`,
          {signal: AbortSignal.timeout(Math.min(500, Math.max(1, deadline - performance.now())))});
        if (response.ok) {
          const data = await response.json();
          browser = await puppeteer.connect({browserWSEndpoint: data.webSocketDebuggerUrl, protocolTimeout: operationMs});
          break;
        }
      } catch { /* retry only startup discovery, never an action */ }
      await delay(30);
    }
    if (!browser) throw new BrowserError('ENGINE_START_TIMEOUT');
    const version = await browser.version();
    return {child, browser, exited, stop, identity: {...identity, version}, pid: child.pid};
  } catch (error) { await stop(); throw error; }
}
