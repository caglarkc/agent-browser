import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
import os from 'node:os';
const exec = promisify(execFile);
export const RESOURCE_PROBE = fileURLToPath(new URL('../bin/resource-probe', import.meta.url));
export function processUnion(rows, roots) {
  const ids = new Set(roots);
  let changed = true;
  while (changed) {
    changed = false;
    for (const [pid, ppid] of rows) if (ids.has(ppid) && !ids.has(pid)) { ids.add(pid); changed = true; }
  }
  return rows.filter(([pid]) => ids.has(pid)).map(([pid]) => pid);
}
export function sumMetric(processes, ids, key) {
  const values = ids.map(id => processes[id]?.[key]);
  return values.every(v => Number.isFinite(v) && v >= 0) ? values.reduce((a,b) => a+b, 0) : null;
}
export function counterDelta(current, previous, ids, key) {
  if (!previous) return null;
  let sum = 0;
  for (const id of ids) {
    const a = current[id], b = previous[id];
    if (!a || !b || a.startId !== b.startId || !Number.isFinite(a[key]) || !Number.isFinite(b[key]) || a[key] < b[key] || b[key] < 0) return null;
    sum += a[key] - b[key];
  }
  return sum;
}
export function groupMetrics(current, previous, ids, elapsedMs, cores = os.cpus().length) {
  const d = key => counterDelta(current, previous, ids, key);
  const user = d('userNs'), system = d('systemNs');
  const cpuOneCorePercent = user !== null && system !== null && elapsedMs > 0 ? (user + system) / (elapsedMs * 1e4) : null;
  return {pids:ids,processes:ids.length,
    ...Object.fromEntries(['footprintBytes','rssBytes','threads','fds','sockets','lifetimePeakBytes'].map(key => [key,sumMetric(current,ids,key)])),
    cpuOneCorePercent,cpuMachinePercent:cpuOneCorePercent === null ? null : cpuOneCorePercent / cores,
    ...Object.fromEntries(['diskReadBytes','diskWriteBytes','logicalWriteBytes','pageins','faults','contextSwitches','idleWakeups','interruptWakeups'].map(key => [key+'Delta',d(key)]))};
}
export async function readResources(workerPids, fixturePid, previous, {driverPid=process.pid, probe=RESOURCE_PROBE}={}) {
  if (process.platform !== 'darwin') throw Error('This probe requires macOS; no fabricated Linux metrics');
  const begin=performance.now();
  const rows=(await exec('ps',['-axo','pid=,ppid='])).stdout.trim().split('\n').map(s=>s.trim().split(/\s+/).map(Number));
  const workerIds=processUnion(rows,workerPids),productIds=[...new Set([driverPid,...workerIds])];
  const raw=JSON.parse((await exec(probe,[...new Set([...productIds,...(fixturePid?[fixturePid]:[])])].map(String))).stdout);
  const monotonicMs=performance.now(),elapsedMs=previous ? monotonicMs-previous.monotonicMs : null;
  const group=ids=>groupMetrics(raw.processes,previous?.raw.processes,ids,elapsedMs);
  const ticks=raw.system.cpuTicks,oldTicks=previous?.raw.system.cpuTicks;
  let systemCpuBusyPercent=null;
  if (ticks && oldTicks) {
    const diffs=ticks.map((v,i)=>v-oldTicks[i]),total=diffs.reduce((a,b)=>a+b,0);
    if(total>0&&diffs.every(v=>v>=0))systemCpuBusyPercent=100*(total-diffs[2])/total;
  }
  return {at:Date.now(),monotonicMs,elapsedMs,probeMs:monotonicMs-begin,
    product:group(productIds),driver:group([driverPid]),workers:group(workerIds),fixture:group(fixturePid?[fixturePid]:[]),
    system:{...raw.system,systemCpuBusyPercent,loadAverage:os.loadavg(),thermalState:'UNAVAILABLE',powerWatts:null},raw};
}
