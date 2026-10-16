import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {fileURLToPath} from 'node:url';
const exec = promisify(execFile);
export const DEFAULT_MEMPROBE = fileURLToPath(new URL('../../lab/bin/browser-lab-memprobe', import.meta.url));
export async function readMemory(workerPids, {memprobe = DEFAULT_MEMPROBE, driverPid = process.pid} = {}) {
  const {stdout} = await exec('ps', ['-axo', 'pid=,ppid=,rss=']);
  const rows = stdout.trim().split('\n').map(line => line.trim().split(/\s+/).map(Number));
  const trees = new Map();
  for (const root of new Set(workerPids)) {
    const ids = new Set([root]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const [pid, ppid] of rows) if (ids.has(ppid) && !ids.has(pid)) { ids.add(pid); changed = true; }
    }
    trees.set(root, ids);
  }
  const union = new Set([driverPid]);
  for (const ids of trees.values()) for (const pid of ids) union.add(pid);
  let usage = {};
  if (process.platform === 'darwin') {
    try { usage = JSON.parse((await exec(memprobe, [...union].map(String))).stdout); }
    catch { /* explicit unavailable footprint, never replace it with RSS */ }
  }
  const present = ids => rows.filter(([pid]) => ids.has(pid));
  const rss = ids => present(ids).reduce((sum, [,,kb]) => sum + kb*1024, 0);
  const footprint = ids => {
    const pids = present(ids).map(([pid]) => pid);
    return pids.length && pids.every(pid => Number.isFinite(usage[pid]?.footprintBytes))
      ? pids.reduce((sum,pid) => sum+usage[pid].footprintBytes,0) : null;
  };
  return {at:Date.now(),driverRssBytes:rss(new Set([driverPid])),driverFootprintBytes:footprint(new Set([driverPid])),
    productRssBytes:rss(union),productFootprintBytes:footprint(union),processes:present(union).length,
    workers:Object.fromEntries([...trees].map(([pid,ids]) => [pid,{rssBytes:rss(ids),footprintBytes:footprint(ids),processes:present(ids).length}]))};
}
export function distribution(values) {
  const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b);
  const quantile=p=>sorted[Math.max(0,Math.ceil(p*sorted.length)-1)]??null;
  return {n:sorted.length,median:quantile(.5),p95:quantile(.95),max:sorted.at(-1)??null};
}
