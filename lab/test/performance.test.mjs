import test from 'node:test';
import assert from 'node:assert/strict';
import {ocrState} from '../src/ocr-client.mjs';
import {distribution,readRss} from '../src/metrics.mjs';
test('OCR keeps record context and maps image boxes to viewport coordinates',()=>{
  const s=ocrState({items:[{text:'Case 104',confidence:.99,x:.03,y:.2,width:.12,height:.03},{text:'Open',confidence:.99,x:.2,y:.2,width:.06,height:.03},{text:'Case 105',confidence:.99,x:.03,y:.3,width:.12,height:.03}]},1000,700);
  const open=s.candidates.find(c=>c.label==='Open');assert.equal(open.x,230);assert.ok(Math.abs(open.y-150.5)<.01);assert.ok(open.context.includes('Case 104'));assert.ok(!open.context.includes('Case 105'));
});
test('Percentiles retain all supplied trials and overlapping roots do not double count the driver',async()=>{
  assert.deepEqual(distribution([1,2,3,4,100]),{n:5,median:3,p95:100,max:100,mean:22});
  const s=await readRss([process.pid,process.pid]);assert.ok(s.driverRssBytes>0);assert.equal(Object.keys(s.components).length,1);assert.ok(s.pipelineRssBytes>=s.driverRssBytes);
});
