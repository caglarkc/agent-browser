import {readFile,writeFile,mkdir,cp,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {distribution} from '../src/memory.mjs';
const root=fileURLToPath(new URL('..',import.meta.url)),source=path.resolve(process.argv[2]||'');
const read=name=>readFile(path.join(source,name),'utf8').then(JSON.parse);
const manifest=await read('manifest.json'),summary=await read('summary.json'),results=await read('results.json');
const hash=b=>createHash('sha256').update(b).digest('hex');
if(manifest.smoke||summary.status!=='PASS'||results.length!==25||manifest.schedule.length!==25)throw Error('Full 25-case experiment required');
for(const [name,expected] of Object.entries(manifest.sourceHashes))if(hash(await readFile(path.join(source,'sources',name)))!==expected)throw Error('Source snapshot differs: '+name);
for(const r of results){
  const c=r.config,dir=c.name+'-r'+c.repeat;
  if(r.status!=='PASS'||r.exit.code!==0||r.sustainedSeconds<c.seconds||r.leakedWorkerPids.length)throw Error('Case gate failed: '+dir);
  const samples=await read(dir+'/samples.json'),checks=await read(dir+'/checks.json');
  if(checks.some(c=>!c.passed)||checks.length!==r.checks)throw Error('Invalid checks: '+dir);
  const ids=new Set(checks.map(c=>c.tabId));
  if(ids.size!==c.profiles*c.tabs)throw Error('Missing tab checks: '+dir);
  const sustained=samples.filter(s=>s.phase==='sustained');
  if(sustained.length<Math.floor(c.seconds*.8)||sustained.some(s=>s.product.footprintBytes===null||s.product.cpuOneCorePercent===null))throw Error('Insufficient resource samples: '+dir);
  if(samples.some(s=>s.elapsedMs>3000)||r.sustainedSeconds>c.seconds+5)throw Error('Observation gap or duration overrun: '+dir);
  if(sustained.some(s=>['threads','fds','sockets'].some(key=>!Number.isFinite(s.product[key]))))throw Error('Missing process resource counters: '+dir);
}
const tests=await read('test-manifest.json');
if(tests.exitCode!==0||tests.failed||tests.tests!==tests.passed||tests.binary.sha256!==manifest.binary.sha256)throw Error('Integration gate failed');
if(hash(await readFile(path.join(source,'test.tap')))!==tests.tapSha256)throw Error('TAP differs');
for(const [name,expected]of Object.entries(tests.testSourceHashes)){
  if(manifest.sourceHashes[name]&&manifest.sourceHashes[name]!==expected)throw Error('Test/experiment source mismatch: '+name);
  if(hash(await readFile(path.join(source,'sources',name)))!==expected)throw Error('Test source snapshot mismatch: '+name);
}
const destination=path.join(root,'results',manifest.runId);
try{await access(destination);throw Error('Do not overwrite published evidence');}catch(e){if(e.code!=='ENOENT')throw e;}
await mkdir(path.dirname(destination),{recursive:true});await cp(source,destination,{recursive:true,errorOnExist:true,force:false});
const mib=n=>Number.isFinite(n)?(n/1024**2).toFixed(2):'—';
const f=n=>Number.isFinite(n)?n.toFixed(2):'—';
const range=values=>{const a=values.filter(Number.isFinite);return a.length?f(Math.min(...a))+(a.length>1?'–'+f(Math.max(...a)):''):'—';};
const names=[...new Set(results.map(r=>r.config.name))];
const rows=names.map(name=>{
 const a=results.filter(r=>r.config.name===name),s=a.map(r=>r.phases.sustained),c=a[0].config;
 return `| ${name} | ${c.profiles}×${c.tabs} | ${a.length}×${c.seconds} | ${range(s.map(r=>r.product.footprintBytes.median/1024**2))} | ${mib(Math.max(...s.map(r=>r.product.footprintBytes.max)))} | ${range(s.map(r=>r.workers.footprintBytes.median/1024**2))} | ${range(s.map(r=>r.product.cpuTimeWeightedPercent))} | ${Math.max(...s.map(r=>r.product.threads.max))} | ${Math.max(...s.map(r=>r.product.fds.max))} |`;
});
const ioRows=results.map(r=>{const s=r.phases.sustained,c=r.config;return `| ${c.name}/r${c.repeat} | ${mib(s.product.diskReadBytesDeltaTotal)} | ${mib(s.product.diskWriteBytesDeltaTotal)} | ${mib(s.product.logicalWriteBytesDeltaTotal)} | ${r.network?.requests??'—'} | ${mib(r.network?.responseBodyBytes)} | ${f(r.latencies.inspect?.p95)} | ${f(s.eventLoopP99Ms.p95)} | ${f(s.probeMs.p95)} |`;});
const soak=results.find(r=>r.config.name==='soak-4p8t');
const ss=(await read('soak-4p8t-r1/samples.json')).filter(s=>s.phase==='sustained');
const first=ss.filter(s=>s.at<ss[0].at+60000),last=ss.filter(s=>s.at>ss.at(-1).at-60000);
const med=(a,g,k)=>distribution(a.map(s=>s[g][k])).median;
const drift={workersFootprintFirstMiB:med(first,'workers','footprintBytes')/1024**2,workersFootprintLastMiB:med(last,'workers','footprintBytes')/1024**2,
 driverFootprintFirstMiB:med(first,'driver','footprintBytes')/1024**2,driverFootprintLastMiB:med(last,'driver','footprintBytes')/1024**2,
 workerFdFirst:med(first,'workers','fds'),workerFdLast:med(last,'workers','fds')};
const samplesAll=[];
for(const r of results)samplesAll.push(...await read(r.config.name+'-r'+r.config.repeat+'/samples.json'));
const checks=results.reduce((n,r)=>n+r.checks,0),leaks=results.reduce((n,r)=>n+r.leakedWorkerPids.length,0);
const report=`# A1 genişletilmiş kaynak kullanımı incelemesi

Tarih: ${manifest.startedAt.slice(0,10)}. **${results.length}/${results.length} deney PASS; ${checks} sekme içerik/ilerleme kontrolü; ${leaks} kalan worker.** Mevcut A1 motoru değiştirilmeden RAM, CPU, disk I/O, thread/FD/socket ve host gecikmesi ölçüldü. JEV çalıştırılmadı. Bu A1 tanı deneyidir; A7 kapasite veya güvenlik kabulü değildir.

## Deney düzeni

Makine: ${manifest.machine.cpu}, ${manifest.machine.logicalCores} mantıksal çekirdek, ${mib(manifest.machine.ramBytes)} MiB RAM; ${manifest.machine.platform}/${manifest.machine.arch}, Node ${manifest.machine.node}. Her koşu yeni Node host + ayrı fixture süreciyle başladı. 12 senaryo 30’ar saniye iki kez, ikinci seri ters sırayla; ardından 4 profil ×8 sekme 600 s çalıştı. Her koşu 3 s host başlangıç ve 5 s kapanış sonrası gözlem içerir. Fixture ürün toplamından çıkarılır ve ayrıca ölçülür.

Ürün = tek Node host/ölçüm sürücüsü + benzersiz native worker süreçleri. Ham kaynak kayıtları, içerik kontrolleri ve olayları bellekte tutan ölçüm sürücüsünün maliyeti dahildir; host-only referansı bunu görünür kılar. Probe/ps kısa ömürlü yardımcı süreçleri ürün toplamına katılmaz; probe süreleri kaydedilir. Maliyetler tüm makine uygulamalarının RAM/CPU toplamı değildir.

Physical footprint ana RAM metriğidir; RSS ayrı tutulur ve paylaşılan sayfalar nedeniyle aynı anlama gelmez. Örnekleme 1 s: kısa CPU/RAM tepeleri kaçabilir. Native lifetime peak toplamı ayrıca JSON’dadır; süreçlerin farklı anlarda gördükleri tepelerin toplamı eşzamanlı ürün tepesi değildir. CPU native Mach sayaçlarından timebase dönüşümüyle nanosaniyeye çevrilir; gerçek monotonic örnek aralığı kullanılır. **CPU %100 = bir mantıksal çekirdek; bu makinede %1000 = on çekirdeğin zaman toplamı.** E/P çekirdekleri eşit işlem kapasitesi sayılmaz. Makine payı ayrıca JSON’da 10’a bölünmüş olarak vardır. CPU birimi bağımsız Node CPU sayacıyla test edildi; [Apple XNU kaynak davranışı](https://github.com/apple-oss-distributions/xnu/blob/main/osfmk/kern/bsd_kern.c) ve [Mach zaman dönüşümü](https://github.com/apple/darwin-xnu/blob/main/osfmk/mach/mach_time.h) esas alındı.

## Sürekli yük sonuçları

Aralıklar iki bağımsız koşunun medyanlarını/CPU zaman ağırlıklı ortalamalarını gösterir; güven aralığı değildir. RAM tepe ve thread/FD değerleri iki koşunun en yüksek örneğidir. p×t = profil ×profil başına sekme.

| Senaryo | p×t | Tekrar×süre sn | Ürün RAM medyan MiB | Ürün RAM tepe MiB | Worker RAM medyan MiB | Ürün CPU % | Thread tepe | FD tepe |
|---|---|---|---:|---:|---|---|---:|---:|
${rows.join('\n')}

Idle: 200 DOM düğümü, arka plan timer/fetch yok. Active: 200 düğüm, 500 ms sayaç, 15 s/64 KiB fetch, 5 s inspect. DOM: sekme başına 5000 düğüm, 500 ms’de 250 değişiklik. CPU: dört sekmede 100 ms’de yaklaşık 10 ms hesaplama. Network: 10 sekmede 250 ms/64 KiB fetch, sekme başına en fazla 2 pending. Churn: dört kalıcı sekmeye ek olarak en az 2 s arayla 5 aç/gezin/kapat işlemi. Uzun koşuda 30 s reload var; 30 s kısa koşular reload çevrim dayanıklılığını sınamaz. Kontroller her kalıcı sekmenin etiketini ve gerekli sayaç/fetch ilerlemesini doğrular. Duraklamış JS doğru metin bulunsa bile FAIL olur.

Varsayılan host sınırları değiştirilmedi. 1p10t/1p32t ve 8p4t gibi deneyler manifestte kayıtlı tanı kotası yükseltmeleri kullanır. Sekme ve profil maliyeti farklıdır: profil ayrı süreç/native Session taşır. 32 sekme veya 8 profil sonucu 60 bağımsız profil için doğrusal garanti oluşturmaz.

## I/O ve yanıt süreleri

Disk değerleri kernel’in süreç fiziksel I/O sayaçlarıdır; cache’den okuma fiziksel disk okuması sayılmayabilir. Logical write ayrıca gösterilir. Setup/teardown I/O dağılımları ve raw sayaçlar JSON’da ayrı fazlardadır. HTTP byte yalnız fixture yanıt gövdesidir; header, CDP/WebSocket, TLS veya tüm ağ kartı trafiği değildir. Socket/FD sayıları descriptor sayısıdır; benzersiz uzak bağlantı sayısı değildir.

| Koşu | Disk okuma MiB | Disk yazma MiB | Logical yazma MiB | HTTP istek | HTTP gövde MiB | Inspect p95 ms | Event loop p99 dağılım p95 ms | Probe p95 ms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
${ioRows.join('\n')}

Probe maliyeti CPU/footprint karşılaştırmalarının yorumunda dikkate alınmalıdır. Event loop ölçümü 20 ms çözünürlüklüdür, saf SDK gecikmesi değildir. Başlatma, newTab, navigate, reload, close ve churn gecikmeleri operations.json/result.json içindedir. Doğum/ölüm arasındaki kısa süreç işlerinin bir kısmı örnekler arasında kaçabilir; özellikle setup/teardown CPU/I/O toplamları tam yaşam döngüsü maliyeti diye sunulmaz.

## Uzun koşu ve kapanış

4×8 aktif tab ${soak.sustainedSeconds.toFixed(1)} s çalıştı; ${soak.checks} doğrulama yapıldı. İlk ve son 60 s medyan worker footprint: **${f(drift.workersFootprintFirstMiB)} → ${f(drift.workersFootprintLastMiB)} MiB**. Host/ölçüm sürücüsü: **${f(drift.driverFootprintFirstMiB)} → ${f(drift.driverFootprintLastMiB)} MiB**. Worker FD medyanı: **${drift.workerFdFirst} → ${drift.workerFdLast}**. Bunlar gözlenen değişimdir; iki pencere tek başına bellek sızıntısı ispatlamaz. Ölçüm kayıtlarının büyümesi, GC ve cache host eğrisini etkiler. Native worker eğrisi ayrıca incelenmelidir.

Her senaryoda host kapatıldı, kaydedilmiş worker PID’lerinin sonlandığı doğrulandı ve 5 s yalnız host recovery örnekleri alındı. Tarayıcı kapandıktan sonra aynı Node sürecinin bütün heap/cache belleğini işletim sistemine hemen iade etmesi beklenmez; baseline/recovery farkı tek başına worker sızıntısı sayılmaz.

Sistem genelinde gözlenen en yüksek CPU doluluğu %${f(Math.max(...samplesAll.map(s=>s.system.systemCpuBusyPercent).filter(Number.isFinite)))}; swap kullanım aralığı ${range(samplesAll.map(s=>s.system.swapUsedBytes/1024**2))} MiB; pressure seviyeleri ${[...new Set(samplesAll.map(s=>s.system.pressureLevel))].join(', ')}. Bunlar diğer masaüstü uygulamalarını da içerir; tarayıcıya atfedilmez. Compressor, swap-in/out, pagein/out, fault/context-switch ve wakeup ham sayaçları tutulur. Güç watt, enerji, GPU yükü ve sıcaklık ölçülmedi; sıfır diye raporlanmaz. Linux/cgroup/PSI, gerçek internet/TLS ve günler süren dayanıklılık bu macOS sentetik deneyinin kapsamı dışındadır.

## Tekrar üretim ve kanıt

\`cd browser && npm ci --ignore-scripts && npm run engine:build && npm run resources:build && npm test && npm run measure:resources\`. Geniş koşu yaklaşık 25 dakika sürer; \`npm run measure:resources -- --smoke\` kısa araç kontrolüdür ve bu rapora kabul edilmez. Native kaynak ${manifest.binary.sha256} SHA-256 binary ile çalıştı.

Yeni testler: ağaç/union sayımı, CPU zaman birimi ve çekirdek normalizasyonu, PID reuse/counter reset/missing metric ve gerçek native CPU/FD/RAM probu. Tüm entegrasyon takımı **${tests.passed}/${tests.tests} PASS**. Önceki native 290/290 ve üç 600 s A1 kabul kanıtı [A1 sonuçlarında](A1_RESULTS.md) korunur; motor bu deneyde değiştirilmedi.

- [Manifest](../browser/results/${manifest.runId}/manifest.json), [25 koşu özeti](../browser/results/${manifest.runId}/results.json), [test makbuzu](../browser/results/${manifest.runId}/test-manifest.json).
- Aynı evidence klasöründe her koşunun örnekleri, kontrolleri, operasyonları, olayları ve kullanılan kaynak snapshot’ları bulunur.
`;
await writeFile(path.join(root,'..','docs/A1_RESOURCE_RESULTS.md'),report);
await writeFile(path.join(destination,'analysis.json'),JSON.stringify({drift,checks,leaks},null,2)+'\n');
console.log(JSON.stringify({published:destination,report:'docs/A1_RESOURCE_RESULTS.md'}));
