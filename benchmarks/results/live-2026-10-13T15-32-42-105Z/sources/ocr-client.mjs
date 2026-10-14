import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';
import path from 'node:path';
export function safeEnvironment(){return Object.fromEntries(Object.entries(process.env).filter(([key])=>!/(API_KEY|TOKEN|SECRET|PASSWORD|TYPESAFE|DECISION_URL)/i.test(key)))}
export class OCRClient {
  constructor(root){
    this.process=spawn(path.join(root,'bin/browser-lab-ocr'),[],{env:safeEnvironment(),stdio:['pipe','pipe','ignore']});this.pending=[];
    createInterface({input:this.process.stdout}).on('line',line=>{const next=this.pending.shift();if(!next)return;clearTimeout(next.timer);try{const data=JSON.parse(line);if(data.error)next.reject(Error(data.error));else next.resolve(data)}catch{next.reject(Error('Invalid local OCR response'))}});
    this.process.on('error',()=>{for(const p of this.pending)p.reject(Error('Local OCR executable unavailable'));this.pending=[]});
    this.process.on('exit',()=>{for(const p of this.pending)p.reject(Error('Local OCR worker exited'));this.pending=[]});
  }
  recognize(file){return new Promise((resolve,reject)=>{const p={resolve,reject};p.timer=setTimeout(()=>{this.process.kill();reject(Error('Local OCR timeout'))},15000);this.pending.push(p);this.process.stdin.write(JSON.stringify({path:file})+'\n')})}
  async close(){this.process.stdin.end();await new Promise(resolve=>{if(this.process.exitCode!==null)resolve();else this.process.once('exit',resolve)})}
}
export function ocrState(data,width,height){
  const items=data.items.sort((a,b)=>Math.abs(a.y-b.y)<.012?a.x-b.x:a.y-b.y);
  const text=items.map(i=>i.text).join('\n').replace(/(\d+)TRY/g,'$1 TRY');
  const candidates=items.filter(i=>i.confidence>=.5).map((i,n)=>({key:'ocr_'+n,kind:'ocr-click',label:i.text,context:items.filter(j=>Math.abs((j.y+j.height/2)-(i.y+i.height/2))<.02).map(j=>j.text).join(' '),x:(i.x+i.width/2)*width,y:(i.y+i.height/2)*height,visibility:'screenshot-ocr'}));
  return {title:'Screenshot OCR observation',text:text.slice(0,6000),candidates:candidates.slice(0,80),source:'pixels-only OCR; no DOM or HTML'};
}
