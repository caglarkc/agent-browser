import test from 'node:test';
import assert from 'node:assert/strict';
import {checkFixtureProgress} from '../src/fixture-progress.mjs';

test('soak rejects frozen JS and wrong tabs; reload explicitly starts a fresh counter baseline',()=>{
  const snapshot=counter=>' {"label":"tab-1"}'+(counter===0?'Row 0':'Tick '+counter)+'Row 1Row 199';
  assert.equal(checkFixtureProgress(snapshot(0),'tab-1').passed,true);
  assert.equal(checkFixtureProgress(snapshot(5),'tab-1',0).passed,true);
  assert.equal(checkFixtureProgress(snapshot(5),'tab-1',5).reason,'TIMER_STALLED');
  assert.equal(checkFixtureProgress(snapshot(0),'tab-1',5).reason,'TIMER_STALLED');
  assert.equal(checkFixtureProgress(snapshot(0),'tab-1').passed,true);
  assert.equal(checkFixtureProgress(snapshot(10),'different-tab',5).reason,'WRONG_FIXTURE');
  assert.equal(checkFixtureProgress('{"label":"tab-1"}Row 199','tab-1').reason,'TIMER_MISSING');
});
