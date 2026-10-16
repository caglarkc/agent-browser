import test from 'node:test';
import assert from 'node:assert/strict';
import {distribution,readMemory} from '../src/memory.mjs';

test('memory union counts a shared driver once and unavailable footprint is null', async () => {
  const sample=await readMemory([process.pid,process.pid],{memprobe:'/nonexistent/memprobe'});
  assert.equal(Object.keys(sample.workers).length,1);
  assert.equal(sample.productRssBytes,sample.workers[process.pid].rssBytes);
  assert.ok(sample.productRssBytes>=sample.driverRssBytes);
  assert.equal(sample.productFootprintBytes,null);
});
test('memory distributions keep maxima and never turn missing values into zero', () => {
  assert.deepEqual(distribution([null,NaN]),{n:0,median:null,p95:null,max:null});
  assert.deepEqual(distribution([1,2,3,100]),{n:4,median:2,p95:100,max:100});
});
