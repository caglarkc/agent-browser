import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';

test('machine CLI uses explicit methods and EOF closes its worker', async () => {
  const child=spawn(process.execPath,[fileURLToPath(new URL('../src/cli.mjs',import.meta.url))],{stdio:['pipe','pipe','pipe']});
  const exited=once(child,'exit');let stdout='',stderr='';
  child.stdout.on('data',data=>{stdout+=data});child.stderr.on('data',data=>{stderr+=data});
  const id='cli-'+randomUUID();
  const requests=[{id:1,method:'defineProfile',args:[{id,principalId:'synthetic',policyId:'fixture'}]},
    {id:2,method:'openProfile',args:[id]},{id:3,method:'newTab',args:[id]},
    {id:4,method:'evaluate',args:[]}];
  child.stdin.end(requests.map(request=>JSON.stringify(request)).join('\n')+'\n');
  const [code]=await exited;
  assert.equal(code,0,stderr);
  const replies=stdout.trim().split('\n').map(line=>JSON.parse(line));
  assert.equal(replies.length,4);
  assert.equal(replies[2].result.profileId,id);
  assert.equal(replies[3].error.code,'COMMAND_FAILED');
  assert.throws(()=>process.kill(replies[1].result.pid,0));
});
