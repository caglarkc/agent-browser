import test from 'node:test';
import assert from 'node:assert/strict';
import {validateAnswer,buildRequest} from '../src/policy.mjs';
import {startFixtures} from '../src/fixtures.mjs';
import {tasks} from '../src/tasks.mjs';
import {makeVariant} from '../src/variants.mjs';

test('Decision output cannot name unobserved actions or invalid probabilities',()=>{
  assert.equal(validateAnswer({choice:'a',probabilities:{a:.8,b:.2},confidence:.9},['a','b']),'a');
  for(const answer of[{choice:'shell',probabilities:{a:1},confidence:1},{choice:'a',probabilities:{a:NaN},confidence:1},{choice:'a',probabilities:{a:.2,b:.8},confidence:1},{choice:'a',probabilities:{a:1},confidence:2}])assert.throws(()=>validateAnswer(answer,['a','b']));
});
test('Model sees bounded observed action identities and supplied values',()=>{
  const {actions,body}=buildRequest(tasks.find(t=>t.id==='form'),{title:'Form',text:'Name',candidates:[{key:'f0n1:fill:',kind:'fill',label:'Name',value:''}]});
  assert.equal(actions.size,5);assert.equal(body.questions.next_action.criteria['f0n1:fill:'].suppliedValue,'Ada');assert.equal(JSON.stringify(body).includes('apikey_'),false);
});
test('Read decisions use visible candidates, never the oracle answer or goal leakage',()=>{
  const task=makeVariant(tasks.find(t=>t.id==='read'),7);
  assert.equal(task.goal.includes(task.expected.price),false);
  const {body}=buildRequest(task,{title:'Products',text:'Pen 39 TRY Notebook 352 TRY',candidates:[]});
  assert.equal(body.questions.next_action.criteria.price_1.target,'352 TRY');
  assert.equal(JSON.stringify(body).includes('expected'),false);
});
test('Variant contracts change values and preconditions while remaining paired across engines',()=>{
  const base=tasks.find(t=>t.id==='form'),a=makeVariant(base,3),b=makeVariant(base,4);
  assert.notDeepEqual(a.expected,b.expected);assert.equal(a.config.prefilled,true);assert.equal(b.config.termsChecked,true);assert.deepEqual(a,makeVariant(base,3));
});
test('Dropdown candidates distinguish current selection from the proposed option',()=>{
  const {body}=buildRequest(tasks.find(t=>t.id==='form'),{title:'Form',text:'Category',candidates:[{key:'s',kind:'select',label:'Category → Research',value:'research',currentValue:'general',currentLabel:'General',optionLabel:'Research'}]});
  assert.equal(body.questions.next_action.criteria.s.currentlySelectedValue,'general');assert.equal(body.questions.next_action.criteria.s.newOptionValue,'research');
});
test('Oracle rejects fake UI success, wrong payload and duplicate commits',async()=>{
  const f=await startFixtures();try{
    const task=tasks.find(t=>t.id==='menu');const run=f.create(task.id);assert.equal(f.verify(run.token).passed,false);
    await fetch(f.origin+'/commit/'+run.token,{method:'POST',body:JSON.stringify(task.expected)});assert.equal(f.verify(run.token).passed,true);
    await fetch(f.origin+'/commit/'+run.token,{method:'POST',body:JSON.stringify(task.expected)});assert.equal(f.verify(run.token).passed,false);
    const wrong=f.create(task.id);await fetch(f.origin+'/commit/'+wrong.token,{method:'POST',body:JSON.stringify({selected:'wrong'})});assert.equal(f.verify(wrong.token).passed,false);
  }finally{await f.close()}
});
