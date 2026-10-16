import http from 'node:http';
let requests=0,responseBodyBytes=0,requestBodyBytes=0;
const payload=Buffer.alloc(64*1024,120);
const server=http.createServer((req,res)=>{
  requests++;req.on('data',chunk=>requestBodyBytes+=chunk.length);
  const u=new URL(req.url,'http://fixture');
  res.setHeader('Cache-Control','no-store');
  const send=body=>{responseBodyBytes+=Buffer.byteLength(body);res.end(body);};
  if(u.pathname==='/payload'){res.setHeader('Content-Type','text/plain');send(payload);return;}
  res.setHeader('Content-Type','text/html');
  const mode=u.searchParams.get('mode')||'idle',label=u.searchParams.get('label')||'fixture';
  const rows=mode==='dom'?5000:200;
  send(`<!doctype html><title>A1 resources</title><body><div id="state"></div><script>
    const mode=${JSON.stringify(mode)},label=${JSON.stringify(label)};
    let tick=0,ops=0,fetches=0,pending=0,checksum=0;
    const state=document.getElementById('state');
    const render=()=>{state.textContent=JSON.stringify({label,tick,ops,fetches,pending,checksum,rows:${rows}})};
    render();
    const list=document.createElement('ul');for(let i=0;i<${rows};i++){const e=document.createElement('li');e.textContent='Row '+i;list.appendChild(e)}document.body.appendChild(list);
    if(mode!=='idle')setInterval(()=>{tick++;if(mode==='dom'){for(let i=0;i<250;i++)list.children[i].textContent='Changed '+tick+' '+i;ops+=250}if(mode==='cpu'){const until=Date.now()+10;while(Date.now()<until){checksum=(checksum+Math.sqrt(ops%1000))%100000;ops++}}render()},mode==='cpu'?100:500);
    if(mode==='network'||mode==='active'||mode==='dom')setInterval(()=>{if(pending<2){pending++;fetch('/payload').then(r=>r.text()).then(t=>{if(t.length!==65536)throw Error('payload size');fetches++;pending--;render()}).catch(()=>{pending--;render()})}},mode==='network'?250:15000);
    </script>`);
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
process.send({origin:'http://127.0.0.1:'+server.address().port});
let closing;
const close=()=>closing||=new Promise(resolve=>{server.closeAllConnections();server.close(resolve)}).then(()=>process.disconnect?.());
process.on('message',m=>{if(m==='close')void close();else if(m?.method==='stats')process.send({id:m.id,requests,responseBodyBytes,requestBodyBytes})});
process.on('disconnect',()=>void close());process.on('SIGTERM',()=>void close());
