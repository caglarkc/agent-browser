import http from 'node:http';

export async function startFixtures() {
  const requests = [];
  const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://fixture');
    requests.push({path: u.pathname, cookie: req.headers.cookie || ''});
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    const label = u.searchParams.get('label') || 'fixture';
    const write = u.searchParams.get('write');
    if (u.pathname === '/payload') { res.end('fixture-payload'); return; }
    const script = `
      ${write ? `localStorage.setItem('shared', ${JSON.stringify(write)}); sessionStorage.setItem('tabOnly',${JSON.stringify(write)});document.cookie='sid='+${JSON.stringify(write)}+'; path=/';` : ''}
      ${u.pathname === '/logout' ? "localStorage.removeItem('shared');document.cookie='sid=; Max-Age=0; path=/';" : ''}
      const state = {label:${JSON.stringify(label)},local:localStorage.getItem('shared'),session:sessionStorage.getItem('tabOnly'),cookie:document.cookie};
      document.body.textContent = JSON.stringify(state);
      ${u.pathname === '/work' ? "const list=document.createElement('ul');for(let i=0;i<200;i++){const e=document.createElement('li');e.textContent='Row '+i;list.appendChild(e)}document.body.appendChild(list);let tick=0;setInterval(()=>{list.firstChild.textContent='Tick '+(++tick)},500);setInterval(()=>fetch('/payload').catch(()=>{}),15000);" : ''}
    `;
    res.end('<!doctype html><title>A1 fixture</title><body><script>' + script.replaceAll('</script', '<\\/script') + '</script>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return {origin: `http://127.0.0.1:${server.address().port}`, requests,
    close: async () => { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }};
}
