import test from 'node:test';
import assert from 'node:assert/strict';
import {processUnion,groupMetrics,counterDelta,sumMetric,readResources} from '../src/resources.mjs';

test('resource tree union deduplicates overlapping roots and excludes fixture/sampler siblings', () => {
  assert.deepEqual(processUnion([[1,0],[2,1],[3,2],[4,1],[5,0]], [2,3,2]), [2,3]);
});
test('CPU uses cumulative nanosecond deltas, elapsed wall time and explicit core normalization', () => {
  const old={1:{startId:'a',userNs:1e9,systemNs:1e9},2:{startId:'b',userNs:0,systemNs:0}};
  const current={1:{startId:'a',userNs:2e9,systemNs:1.5e9},2:{startId:'b',userNs:.5e9,systemNs:0}};
  const result=groupMetrics(current,old,[1,2],1000,10);
  assert.equal(result.cpuOneCorePercent,200);assert.equal(result.cpuMachinePercent,20);
  assert.equal(result.footprintBytes,null);assert.equal(result.diskReadBytesDelta,null);
});
test('PID reuse, missing counters, warmup and counter resets do not manufacture zero usage', () => {
  const old={1:{startId:'a',userNs:10}};
  for(const current of [{1:{startId:'b',userNs:20}},{1:{startId:'a',userNs:9}},{}, {1:{startId:'a'}}])
    assert.equal(counterDelta(current,old,[1],'userNs'),null);
  assert.equal(counterDelta(old,undefined,[1],'userNs'),null);
  assert.equal(sumMetric({1:{fds:-1}},[1],'fds'),null);
  assert.equal(counterDelta({1:{startId:'a',userNs:10}},old,[1],'userNs'),0);
});
test('native probe observes current process with a stable identity and increasing CPU counters', {skip:process.platform!=='darwin'}, async () => {
  const a=await readResources([],null);
  const usage=process.cpuUsage();
  const until=performance.now()+50;while(performance.now()<until)Math.sqrt(Math.random());
  const b=await readResources([],null,a);
  assert.equal(a.raw.processes[process.pid].startId,b.raw.processes[process.pid].startId);
  assert.ok(b.product.footprintBytes>0);assert.ok(b.product.cpuOneCorePercent>0);
  assert.ok(b.product.threads>0);assert.ok(b.product.fds>0);
  assert.equal(b.product.processes,1);assert.equal(b.workers.footprintBytes,0);
  assert.equal(b.fixture.processes,0);assert.ok(b.elapsedMs>=50);
  const actual=process.cpuUsage(usage);
  const native=counterDelta(b.raw.processes,a.raw.processes,[process.pid],'userNs')+counterDelta(b.raw.processes,a.raw.processes,[process.pid],'systemNs');
  // Independent getrusage-backed Node counter catches Mach-ticks/ns confusion on Apple Silicon.
  const ratio=native/((actual.user+actual.system)*1000);
  assert.ok(ratio>.5&&ratio<2,`native/Node CPU ratio ${ratio}`);
});
