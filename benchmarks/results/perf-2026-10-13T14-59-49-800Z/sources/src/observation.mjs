// This function is serialized into the page. No application source is sent to the model.
export function snapshot(rendered,enhanced=false) {
  const registry=window.__browserLab ||= {nodes:new Map(),ids:new WeakMap(),next:1};
  const idFor=e=>{if(!registry.ids.has(e))registry.ids.set(e,registry.next++);const id=String(registry.ids.get(e));registry.nodes.set(id,e);return id};
  for(const [id,e] of registry.nodes)if(!e.isConnected)registry.nodes.delete(id);
  const elements=[];
  function walk(root){for(const e of root.querySelectorAll('*')){if(e.matches('button,a[href],input,textarea,select,[role="button"],[role="option"]'))elements.push(e);if(e.shadowRoot)walk(e.shadowRoot)}}
  walk(document);
  function label(e){const ref=e.getAttribute('aria-labelledby');return e.getAttribute('aria-label')||(ref?ref.split(/\s+/).map(id=>document.getElementById(id)?.textContent||'').join(' '):'')||Array.from(e.labels||[]).map(l=>{const copy=l.cloneNode(true);for(const c of copy.querySelectorAll('input,select,textarea'))c.remove();return copy.textContent}).join(' ')||e.textContent||e.getAttribute('placeholder')||e.getAttribute('title')||e.tagName}
  const candidates=[];
  let excluded=0;
  for(const e of elements){
    if(e.type==='hidden'||e.closest('[hidden],[inert],[aria-hidden="true"]')||e.disabled||e.getAttribute('aria-disabled')==='true')continue;
    if(enhanced){let hidden=false;for(let p=e;p;p=p.parentElement){const s=getComputedStyle(p);if(s.display==='none'||s.visibility==='hidden'||s.visibility==='collapse'||s.opacity==='0'){hidden=true;break}}if(hidden)continue}
    if(rendered){const r=e.getBoundingClientRect();if(!r.width||!r.height||getComputedStyle(e).visibility==='hidden')continue;const x=Math.max(0,Math.min(innerWidth-1,r.x+r.width/2)),y=Math.max(0,Math.min(innerHeight-1,r.y+r.height/2));let hit=document.elementFromPoint(x,y);while(hit?.shadowRoot){const inner=hit.shadowRoot.elementFromPoint(x,y);if(!inner||inner===hit)break;hit=inner}if(r.bottom>0&&r.top<innerHeight&&!e.contains(hit))continue}
    const node=idFor(e),name=label(e).trim().replace(/\s+/g,' ').slice(0,160);
    const base={node,label:name,context:e.closest('tr,li,article,form,dialog')?.textContent?.replace(/\s+/g,' ').trim().slice(0,300)||'',role:e.getAttribute('role')||'',tag:e.tagName.toLowerCase(),value:e.value||'',checked:Boolean(e.checked),visibility:rendered?'layout-checked':enhanced?'style-checked-no-layout':'unknown-without-layout'};
    if(e.tagName==='SELECT'){for(const o of e.options)if(!o.disabled&&!o.selected)candidates.push({...base,kind:'select',label:name+' → '+o.textContent,value:o.value,currentValue:e.value,currentLabel:Array.from(e.selectedOptions).map(o=>o.textContent).join(', '),optionLabel:o.textContent})}
    else if(e.type==='file')candidates.push({...base,kind:'upload',value:Array.from(e.files||[]).map(f=>f.name).join(',')});
    else if(['INPUT','TEXTAREA'].includes(e.tagName)&&!['checkbox','radio','submit','button'].includes(e.type)&&!e.readOnly)candidates.push({...base,kind:'fill'});
    else candidates.push({...base,kind:'click'});
  }
  if(candidates.length>80){excluded=candidates.length-80;candidates.splice(80)}
  const copy=document.body.cloneNode(true);for(const e of copy.querySelectorAll('script,style,template,noscript'))e.remove();
  const walker=document.createTreeWalker(copy,NodeFilter.SHOW_TEXT),words=[];let n;while((n=walker.nextNode()))words.push(n.textContent);
  const raw=words.join(' ').replace(/\s+/g,' ').trim();
  return {url:location.href,title:document.title,text:raw.slice(0,4000),textTruncated:raw.length>4000,candidates,excludedCandidates:excluded,canvas:!!document.querySelector('canvas'),frameCount:document.querySelectorAll('iframe').length};
}
