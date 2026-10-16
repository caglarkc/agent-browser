import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const source=path.resolve(process.argv[2]||'');
const read=name=>readFile(path.join(source,name),'utf8').then(JSON.parse);
const manifest=await read('manifest.json'),summary=await read('summary.json'),tests=await read('test-manifest.json'),native=await read('native-test-manifest.json');
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
if(manifest.secondsPerSupportedTopology!==600||summary.status!=='PASS'||summary.results.length!==3)throw Error('Publication requires all three full ten-minute topologies');
if(summary.results.some(r=>r.status!=='PASS'||r.sustainedSeconds<600||r.leakedWorkerPids.length||r.checks===0))throw Error('Incomplete topology');
const progressCounts=[];
for(const result of summary.results){
 const checks=await read(result.name+'-checks.json');
 if(checks.length!==result.checks||checks.some(c=>!c.passed||typeof c.progressRequired!=='boolean'))throw Error('Invalid active-work evidence: '+result.name);
 const tabs=new Map();
 for(const check of checks)tabs.set(check.tabId,(tabs.get(check.tabId)||0)+(check.progressRequired?1:0));
 if(tabs.size!==result.tabCount||[...tabs.values()].some(count=>count<1))throw Error('Missing tab JS progress: '+result.name);
 progressCounts.push({name:result.name,checks:[...tabs.values()].reduce((sum,n)=>sum+n,0)});
}

if(tests.exitCode!==0||tests.tests!==tests.passed||tests.failed!==0||tests.binary.sha256!==manifest.binary.sha256)throw Error('Core test gate or engine identity differs');
const engine=JSON.parse(await readFile(path.join(source,'sources/engine/source.json'),'utf8'));
if(native.patchSha256!==engine.patchSha256||native.sourceTreeSha256!==engine.sourceTreeSha256||native.suites.some(s=>s.exitCode!==0||s.passed!==s.tests))throw Error('Native regression gate differs');
for(const suite of native.suites)if(suite.tests<1||hash(await readFile(path.join(source,suite.log)))!==suite.sha256)throw Error('Native test log differs: '+suite.name);
for(const [name,expected]of Object.entries({...manifest.sourceHashes,...tests.testSourceHashes})){
 if(manifest.sourceHashes[name]&&tests.testSourceHashes[name]&&manifest.sourceHashes[name]!==tests.testSourceHashes[name])throw Error('Measurement/test source mismatch: '+name);
 if(hash(await readFile(path.join(source,'sources',name)))!==expected)throw Error('Source snapshot mismatch: '+name);
}
if(hash(await readFile(path.join(source,'test.tap')))!==tests.tapSha256)throw Error('Test evidence differs');
const destination=path.join(root,'results',manifest.runId);await mkdir(path.dirname(destination),{recursive:true});
await cp(source,destination,{recursive:true,errorOnExist:true,force:false});
const rel='../browser/results/'+manifest.runId;
const mib=n=>Number.isFinite(n)?(n/1024**2).toFixed(2):'—';
const rows=summary.results.map(r=>`| ${r.topology.profiles} | ${r.topology.tabsPerProfile} | ${r.status} | ${r.sustainedSeconds.toFixed(1)} | ${r.checks} | ${mib(r.sustained.productFootprintBytes.median)} | ${mib(r.sustained.productFootprintBytes.max)} | ${mib(r.sustained.workerFootprintBytes.median)} | ${mib(r.sustained.driverFootprintBytes.median)} |`);
const report=`# A1 profil, gerçek sekme ve worker sonucu

Tarih: ${new Intl.DateTimeFormat('tr-TR',{dateStyle:'long',timeZone:'Europe/Istanbul'}).format(new Date(manifest.startedAt))}. **A1 TAMAMLANDI.** Aynı profilde gerçek çoklu sekme, native cookie/localStorage paylaşımı, sekmeye özel sessionStorage ve üç erken bellek topolojisi geçti. Bu kabul yalnız A1’in yerel sentetik fixture kapsamıdır; A2–A7 kabulü değildir.

## Motor ve host teslimi

Lightpanda upstream commit’i \`${engine.commit}\` üzerine [native patch](../browser/engine/multitab.patch) uygulandı. [Kaynak pinleri](../browser/engine/source.json), [derleme makbuzu](../browser/engine/manifest.json) ve [derleme aracı](../browser/scripts/build-engine.mjs) arşiv/patch/kaynak/binary kimliğini kaydeder. Runtime doğrulanmış ReleaseFast binary’yi doğrudan başlatır. Eski lab motoru, ikinci target’ın TargetAlreadyLoaded ile reddini gösteren etiketli regresyon probunda kalır; fallback değildir.

Bir profil bir native Session ve ayrı worker sürecidir. Gerçek Page/CDP target’ları ayrı DOM, gezinme geçmişi, document epoch, node kayıtları ve olay yönlendirmesi taşır. Cookie/localStorage profile/origin kurallarıyla ortaktır; sessionStorage tab’a bağlıdır, aynı-origin iframe üst tab’ın deposunu kullanır. Opener bağımsız başlangıç kopyası alır, noopener kopyalamaz. Frame geçmişi üst sekmenin geçmişini değiştirmez. Bir tab’ın gezinmesi/kapanması diğerlerinin JS bağlamını bozmaz.

BrowserHost immutable profil/oturum/worker/tab kimliklerini, atomik profil kilidini, kota rezervasyonunu, bounded lifecycle olaylarını ve makine CLI’sini sağlar. Opt-in native cookie değişikliği bildirimi, değer/adres taşımadan PROFILE_STATE_CHANGED üretir; logout sonrası ortak durum değişir. Bildirim uygulama düzeyinde login/logout kanıtı sayılmaz. İnsan tarayıcı arayüzü, JEV, OCR veya Chrome yolu eklenmedi.

## Testler

- A1 çekirdek ve gerçek motor entegrasyonu: **${tests.passed}/${tests.tests} PASS**. T01 corpus’u 10 veri varyantı × 3 tekrar × 3 gerçek tab içerir; ayrıca 10 eşzamanlı target/JS sayacı, ham CDP default-context yönlendirmesi, canlı storage, iframe, opener/noopener, logout bildirimi, native history, profil ayrılığı, kota, CLI ve worker kill sınanır.
- Native upstream regresyonları: ${native.suites.map(s=>`**${s.name}: ${s.passed}/${s.tests} PASS**`).join('; ')}. Debug test runner’ın leak denetimi açık kalır.
- Kill testinde bir worker’ın üç tab’ı LOST olur; diğer profil devam eder. Eski tab ID’leri yeniden açılamaz ve kapanışta worker kalmaz.

## Erken bellek ölçümü

Üç topoloji aynı optimize motorla sıralı olarak 600’er saniye çalıştı. Her tab: 200 DOM satırı, 500 ms JS güncellemesi, 15 s yerel fetch, 5 s içerik ve artan JS sayacı kontrolü, 30 s reload. Donmuş sayaç DOM doğru kalsa bile FAIL olur; reload yeni sayaç başlangıcı oluşturur. Tek Node host/ölçüm sürücüsü bir kez, worker process tree’leri benzersiz sayılır. Ayrı fixture child süreç ürün toplamından çıkarılır. Ölçümde worker tab kotası 10 olarak önceden kaydedilmiştir; normal varsayılan 8’dir.

| Profil | Tab/profil | Sonuç | Süre sn | İçerik/JS kontrolü | Ürün footprint medyan MiB | Ürün örneklenen tepe MiB | Worker toplam medyan MiB | Ortak host medyan MiB |
|---|---|---|---:|---:|---:|---:|---:|---:|
${rows.join('\n')}

İlk okuma ve açık reload sonrası okumalar sayaç başlangıcı oluşturur; diğer kontrollerde artış zorunludur. Doğrulanmış arka plan JS ilerlemesi: ${progressCounts.map(r=>r.name+': '+r.checks).join('; ')}.

Örnekleme 1 s’dir; kısa tepeler kaçabilir. Setup ve sustained dağılımları ayrıdır. RSS ayrıca saklanır ve physical footprint yerine kullanılmaz. Bileşen medyanları ayrı örneklerden gelebilir. Aynı Node sürücüsü topolojiler boyunca yaşar; cache/GC ve ölçüm overhead’i dahildir. Tüm koşuların sonunda ölçülen worker’lar sonlanmıştır.

Bu macOS erken ölçümüdür. 2 GiB örnekleme guard’ı OS hard cap değildir; 60 aktif profil / 500.000.000 byte, Linux cgroup, CPU/FD soak ve güvenli çok-agent kapasitesi A7’de doğrulanacaktır. Eski 1.0.0 ölçümleri bu koşuya karıştırılmadı.

## Kabul sınırı

| Kapı | Durum | Kanıt/sınır |
|---|---|---|
| T01 A1 profil/tab/history/storage | PASS | Üç-tab corpus’u, 10 canlı target, paylaşım/ayrılık ve opener testleri |
| T02 A1 lifecycle | PASS | Üç tab’a worker kaybı, profil kilidi, eski ID reddi, bağımsız profil devamı |
| T11 A1 erken topoloji | PASS | Her üç topoloji 600 s, içerik kontrolleri ve worker temizliği |
| T02 OS/agent güvenlik, A2 egress | NOT_RUN | A1 trusted fixture host’u güvenlik sandbox’ı sayılmaz |
| Kalıcı şifreli profil / private input | NOT_RUN | A5 / A4 kapsamı |
| 60/500 MB kapasite | NOT_RUN | A7 kapsamı |

Native opener storage semantiği test edildi; tam popup target keşfi/bağımsız popup ömrü, kapsamlı iframe/DOM gözlemi ve DOM Storage event uyumluluğu sonraki aşamaların kapsamıdır. V8 inspector grubu aynı güven profilinde paylaşılır; iç CDP context bildirimleri agent yetkilendirme sınırı değildir. [ADR 001](adr/001-a1-worker-profile-topology.md) ve [çekirdek kullanımı](../browser/README.md) bu sınırları korur.

## Tekrar üretim ve kanıt

\`cd browser && npm ci --ignore-scripts && npm run engine:build && npm test && npm run measure\`. [Motor derleme notları](../browser/engine/README.md) araç sürümlerini açıklar. Kısa harness koşuları ve yarım testler final sonuçlara dahil değildir.

- [Run manifesti](${rel}/manifest.json), [sonuçlar](${rel}/results.json), [özet](${rel}/summary.json).
- [Core test makbuzu](${rel}/test-manifest.json), [TAP](${rel}/test.tap), [native regresyon makbuzu](${rel}/native-test-manifest.json).
- [1 profil × 1 tab](${rel}/1p-1t-samples.json), [1 profil × 10 tab](${rel}/1p-10t-samples.json), [4 profil × 1 tab](${rel}/4p-1t-samples.json) bellek örnekleri.
- Aynı klasörde test edilen kaynak snapshot’ları, içerik kontrolleri, olaylar ve native test logları bulunur.
`;
await writeFile(path.join(root,'..','docs/A1_RESULTS.md'),report);
console.log(JSON.stringify({published:destination,report:path.join(root,'..','docs/A1_RESULTS.md')}));
