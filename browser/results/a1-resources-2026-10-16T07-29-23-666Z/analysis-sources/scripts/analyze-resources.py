"""Append reproducible interpretation after report-resources.mjs verifies/publishes the run."""
import json
import hashlib
import statistics
import sys
from pathlib import Path

root = Path(sys.argv[1]).resolve()
report = Path(sys.argv[2]).resolve()
load = lambda name: json.loads((root/name).read_text())
matrix = load('results.json')
network = load('followups/network/results.json')
cpu = load('followups/cpu/results.json')
mib = lambda n: n/2**20
by_name = {r['config']['name']: r for r in network}
regular = by_name['default-continuous']['workerFootprint']
zero = by_name['zero-capture-continuous']['workerFootprint']
retained_delta = mib(regular['lastWindowMedianBytes']-zero['lastWindowMedianBytes'])

cpu_rows, cpu_analysis = [], []
for r in cpu:
    name = r['config']['name']
    checks = load(f'followups/cpu/{name}/checks.json')
    tabs = {}
    for c in checks:
        tabs.setdefault(c['tabId'], []).append(c)
    rates = [(a[-1]['state']['tick']-a[0]['state']['tick']) / ((a[-1]['at']-a[0]['at'])/1000)
             for a in tabs.values() if len(a) > 1]
    rate = statistics.mean(rates)
    s = r['phases']['sustained']
    cpu_analysis.append({'name': name, 'meanTabTicksPerSecond': rate})
    cpu_rows.append(f"| {name} | {mib(s['product']['footprintBytes']['median']):.2f} | "
                    f"{s['workers']['cpuTimeWeightedPercent']:.2f} | "
                    f"{s['product']['cpuTimeWeightedPercent']:.2f} | "
                    f"{r['latencies']['inspect']['p95']:.2f} | {rate:.2f} |")

network_rows = []
for r in network:
    f = r['workerFootprint']
    network_rows.append(f"| {r['config']['name']} | {mib(f['firstWindowMedianBytes']):.2f} | "
                        f"{mib(f['lastWindowMedianBytes']):.2f} | {mib(f['maxBytes']):.2f} | "
                        f"{r['network']['requests']} | {mib(r['network']['responseBodyBytes']):.2f} | "
                        f"{r['workerCpuTimeWeightedPercent']:.2f} |")

gc_rows = '\n'.join('| '+r['config']['name']+' | '+r.get('gcProbe',{}).get('status','NOT_RUN')+' | '+r.get('gcProbe',{}).get('message','—').replace('|','/')+' |' for r in network)

scope = ('Bu deneyde capture bütçesini sıfırlamak native bellek tutulumunun önemli bir bölümünü azaltıyor.'
         if retained_delta > 10 else
         'Bu deney capture bütçesini sıfırlamanın tek başına bellek artışını açıkladığını göstermiyor.')
checks = sum(r['checks'] for r in matrix+network+cpu)
interpretation = f'''## Kaynak sağlığı kararı ve öncelikli bulgular

**İşlev/ilerleme ve kapanış kontrolleri 30/30 ölçüm koşusunda geçti; toplam {checks} kontrol var. Kaynak sağlığı için bellek tutma sorunu açık.** PASS burada içerik/ilerleme, örnekleme guard’ı ve worker temizliğidir; belleğin uzun vadede sınırlı kaldığına dair onay değildir. Motor ve ürün varsayılanları bu incelemede değiştirilmedi.

1. **CDP yanıt gövdesi saklama bütçesi küçültülmeli ve toplamı sınırlandırılmalı.** 32 aktif sekmeli 10 dakika koşusunda native worker ilk/son 60 s medyanı yaklaşık 73 →139 MiB oldu. Node ölçüm sürücüsü bu artışı açıklamaz. Aynı yükü üç ayrı native worker’da 120’şer saniye sınadık: 30 s reload, kesintisiz gezinme ve yalnız tanı için `Network.enable(maxTotalBufferSize:0,maxResourceBufferSize:0)`.
2. **V8 heap sınırı süreç RAM sınırı değildir.** Motordaki CDP target sarmalayıcısında varsayılan gövde saklama bütçesi 200.000.000 byte, tek gövde bütçesi 20.000.000 byte. Bunlar HTTP yanıt boyutu sınırından ve V8’in 64 MiB heap sınırından ayrı native kaynaklardır. Çok sekmede hedef başına bütçelerin toplamı büyüyebilir; yalnız yeniden yüklemeye güvenilemez.
3. **Aynı profilde CPU yoğun sekmeler tek worker’da yarışır.** 16 yoğun sekme tek profilde yaklaşık bir çekirdeği doldururken, dört profil ayrı worker’larda paralel ilerledi. Bu ayrım agent planlaması ve timeout/adalet kararlarını etkiler; ayrı profil daha fazla RAM/thread maliyeti taşır. İzolasyon RAM hedefi için gevşetilmedi.

### Ağ belleği için kontrollü takip

Tek native worker, 10 gerçek sekme, sekme başına 250 ms’de 64 KiB fetch; her koşul yeni worker ve fixture ile başladı. Ana matristeki aynı motor, Puppeteer ve fixture kullanıldı. Tanı Node sürücüsü koşullar arasında yaşar; bu tabloda **yalnız native worker** belleği/CPU’su karşılaştırılır. İlk/son pencereler 30 s’dir. Her koşul bir kez çalıştı; güven aralığı veya evrensel sızıntı oranı değildir.

| Koşul | İlk 30 s RAM medyan MiB | Son 30 s RAM medyan MiB | Örneklenen tepe MiB | HTTP istek | Yanıt gövdesi MiB | Native CPU % |
|---|---:|---:|---:|---:|---:|---:|
{chr(10).join(network_rows)}

{scope} Kesintisiz varsayılan ile sıfır bütçe arasındaki son pencere farkı **{retained_delta:.2f} MiB**. Bu fark ölçülen ayarın etkisidir; kalan belleğin bütün alt bileşenleri için heap/allocation profili çıkarılmış değildir. Yanıt gövdesi cache’i, allocator/GC davranışı ve request metadata ömrü birlikte ele alınmalıdır. **Sıfır capture koşulu da büyüyorsa, cache bütçesini kısmak tek başına çözüm değildir.** Zero-capture yalnız tanı koşuludur, ürüne kalıcı olarak uygulanmadı; ileride body okuma gereksinimleri için açık ve sınırlı bir politika gerekir.

Kaynak incelemesi: pinli upstream [network buffer varsayılanları](https://github.com/lightpanda-io/browser/blob/44e378d6113d40a6ef1e66ff8b27e1da34ef1647/src/server/cdp/domains/network.zig) ve [capture/eviction mekanizması](https://github.com/lightpanda-io/browser/blob/44e378d6113d40a6ef1e66ff8b27e1da34ef1647/src/server/cdp/CDP.zig). Patch target’lara ait bu durumu ayırır; profil/worker ve tüm ürün için ayrıca toplu kaynak bütçesi gerekir. HTTP `Cache-Control:no-store`, CDP debug capture’ını devre dışı bırakmaz.

### GC gözlemi ve ikinci kök neden adayı

Ölçüm bittikten sonra, sürekli fetch devam ederken explicit GC komutu ayrıca denendi; bu adım steady RAM/CPU dağılımına katılmadı.

| Koşul | GC kontrolü | Motor cevabı |
|---|---|---|
{gc_rows}

Bu motorda desteklenmeyen GC komutu bir serbest bırakma ölçümü üretmez. Kaynakta ikinci aday: [Fetch.zig](https://github.com/lightpanda-io/browser/blob/44e378d6113d40a6ef1e66ff8b27e1da34ef1647/src/browser/webapi/net/Fetch.zig) promise resolver’ı persist ediyor; tamamlama yolunda yerel resolver’a dönüştürme var, açık release görünmüyor. [PromiseResolver.Global](https://github.com/lightpanda-io/browser/blob/44e378d6113d40a6ef1e66ff8b27e1da34ef1647/src/browser/js/PromiseResolver.zig) release sağlıyor ve [GlobalTracker](https://github.com/lightpanda-io/browser/blob/44e378d6113d40a6ef1e66ff8b27e1da34ef1647/src/browser/js/js.zig) referansları sayfa üzerinde izliyor. Bu, tamamlanmış response/promise zincirinin sayfa ömrünce tutulması için **kaynak temelli güçlü bir adaydır; düzeltme A/B testiyle henüz ispatlanmadı**. Minimal tekrar üretim, success/error/abort/shutdown yolları ve çift-release regresyonlarıyla doğrulanmalı.

### CPU doygunluğu ve gecikme

16 sekmenin her biri 100 ms’de yaklaşık 10 ms hesaplama yapar. 30 s koşuları tek tekrar içerir. Gecikmeler yerel sentetik sayfanın `inspect` çağrılarıdır; bütün komut türleri veya canlı siteler için SLA değildir. CPU %100 bir mantıksal çekirdek, bu makinede %1000 on çekirdeğin zaman toplamıdır.

| Topoloji | Ürün RAM medyan MiB | Native CPU % | Ürün CPU % | Inspect p95 ms | Tab başına sayaç Hz ortalama |
|---|---:|---:|---:|---:|---:|
{chr(10).join(cpu_rows)}

Sayaç Hz’i her sekmenin ilk/son bağımsız gözlemi arasındaki artıştan hesaplanır. Tek profildeki yükün istenen 10 Hz’i sağlayamaması, DOM doğru kalırken ilerlemenin yavaşlayabileceğini gösterir. Dört profilde paralellik artar; RAM/CPU bütçesi ve görev adaleti birlikte planlanmalıdır.

### Ölçüm sınırı ve sonraki somut iş

- A1 işlev kabulü ve önceki 290/290 native regresyon kanıtı korunur. Yeni ölçüm **sabit kaynak tüketimi kabulü vermez**. Öncelik, CDP body/request kayıtları için hedef +profil/worker +ürün bütçesi ve yaş/sayı sınırı belirlemek; fetch resolver/reference ömrünü küçük regresyonla doğrulamak ve ardından aynı ağ/soak koşularını yeniden sınamaktır. 500.000.000 byte /60 bağımsız profil hedefi henüz doğrulanmadı.
- Ölçüm host’u örnek/olay/kontrol kayıtlarını RAM’de tutar; Node heap/cache eğrisi saf SDK maliyeti değildir. Native worker ayrıca raporlanır. OS page cache temizlenmedi: yeni süreç, soğuk disk anlamına gelmez. RSS paylaşılan sayfaları tekrar sayabilir; physical footprint toplamı da Linux PSS ölçümü değildir.
- Bu çalışma yerel HTTP ve sentetik yükle sınırlıdır. TLS/gerçek internet, günler süren dayanıklılık, Linux cgroup/PSI, watt/enerji, GPU ve sıcaklık ölçümü yapılmadı. Eksik değerler sıfır kabul edilmez.

Takip koşularının kaynak hash’leri ve binary kimliği ana matrisle [bağımsız doğrulandı](../browser/results/{load('manifest.json')['runId']}/followups/verification.json). 134,8 s örnekleme boşluğu olan ilk takip serisi bütünüyle dışlandı ve yeniden çalıştırıldı; reddetme testi `followups/verifier-rejection.json`, dışlama kaydı `followups/excluded-runs.json` içindedir. Yeni tanı araçları `scripts/diagnose-cpu-contention.mjs`, `scripts/diagnose-network-memory.mjs` ve `scripts/verify-resource-followups.mjs` ile tekrar çalıştırılabilir.
'''
text = report.read_text()
marker = '\n## Kaynak sağlığı kararı ve öncelikli bulgular\n'
if marker in text:
    raise SystemExit('Interpretation already appended; regenerate the base report explicitly first')
heading, rest = text.split('\n', 1)
report.write_text(heading+'\n\n'+interpretation+'\n'+rest.lstrip())
(root/'interpretation.json').write_text(json.dumps({
    'checks': checks, 'conditions': 30, 'resourceHealth': 'OPEN_NETWORK_MEMORY_RETENTION',
    'nativeLastWindowDefaultMinusZeroBytes': regular['lastWindowMedianBytes']-zero['lastWindowMedianBytes'],
    'cpu': cpu_analysis, 'scriptSha256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
}, indent=2)+'\n')
print(report)
