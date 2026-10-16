import readline from 'node:readline';
import {BrowserHost} from './host.mjs';

// Machine JSON-lines transport. It is not an authenticated A2 agent API or a human UI.
const host = new BrowserHost();
const commands = new Map(['defineProfile','openProfile','profiles','tabs','newTab','navigate',
  'back','forward','reload','inspect','closeTab','closeProfile','capabilities','events','suspend']
  .map(name => [name, (...args) => host[name](...args)]));
const input = readline.createInterface({input:process.stdin, crlfDelay:Infinity});
let stopping;
const stop = () => stopping ||= host.close();
process.once('SIGINT',()=>{input.close();void stop();});
process.once('SIGTERM',()=>{input.close();void stop();});
try {
  for await (const line of input) {
    if (!line.trim()) continue;
    let request;
    try {
      if (Buffer.byteLength(line)>1024*1024) throw Error('REQUEST_TOO_LARGE');
      request=JSON.parse(line);
      if (!commands.has(request.method) || !Array.isArray(request.args)) throw Error('INVALID_REQUEST');
      const result=await commands.get(request.method)(...request.args);
      process.stdout.write(JSON.stringify({id:request.id,result:result??null})+'\n');
    } catch(error) { process.stdout.write(JSON.stringify({id:request?.id??null,error:{code:error.code||'COMMAND_FAILED',message:error.code?error.message:'Command failed'}})+'\n'); }
  }
} finally { await stop(); }
