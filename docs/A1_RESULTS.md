# A1 profil, gerçek sekme ve worker sonucu

Tarih: 16 Ekim 2026. **A1 TAMAMLANDI.** Aynı profilde gerçek çoklu sekme, native cookie/localStorage paylaşımı, sekmeye özel sessionStorage ve üç erken bellek topolojisi geçti. Bu kabul yalnız A1’in yerel sentetik fixture kapsamıdır; A2–A7 kabulü değildir.

## Motor ve host teslimi

Lightpanda upstream commit’i `44e378d6113d40a6ef1e66ff8b27e1da34ef1647` üzerine [native patch](../browser/engine/multitab.patch) uygulandı. [Kaynak pinleri](../browser/engine/source.json), [derleme makbuzu](../browser/engine/manifest.json) ve [derleme aracı](../browser/scripts/build-engine.mjs) arşiv/patch/kaynak/binary kimliğini kaydeder. Runtime doğrulanmış ReleaseFast binary’yi doğrudan başlatır. Eski lab motoru, ikinci target’ın TargetAlreadyLoaded ile reddini gösteren etiketli regresyon probunda kalır; fallback değildir.

Bir profil bir native Session ve ayrı worker sürecidir. Gerçek Page/CDP target’ları ayrı DOM, gezinme geçmişi, document epoch, node kayıtları ve olay yönlendirmesi taşır. Cookie/localStorage profile/origin kurallarıyla ortaktır; sessionStorage tab’a bağlıdır, aynı-origin iframe üst tab’ın deposunu kullanır. Opener bağımsız başlangıç kopyası alır, noopener kopyalamaz. Frame geçmişi üst sekmenin geçmişini değiştirmez. Bir tab’ın gezinmesi/kapanması diğerlerinin JS bağlamını bozmaz.

BrowserHost immutable profil/oturum/worker/tab kimliklerini, atomik profil kilidini, kota rezervasyonunu, bounded lifecycle olaylarını ve makine CLI’sini sağlar. Opt-in native cookie değişikliği bildirimi, değer/adres taşımadan PROFILE_STATE_CHANGED üretir; logout sonrası ortak durum değişir. Bildirim uygulama düzeyinde login/logout kanıtı sayılmaz. İnsan tarayıcı arayüzü, JEV, OCR veya Chrome yolu eklenmedi.

## Testler

- A1 çekirdek ve gerçek motor entegrasyonu: **19/19 PASS**. T01 corpus’u 10 veri varyantı × 3 tekrar × 3 gerçek tab içerir; ayrıca 10 eşzamanlı target/JS sayacı, ham CDP default-context yönlendirmesi, canlı storage, iframe, opener/noopener, logout bildirimi, native history, profil ayrılığı, kota, CLI ve worker kill sınanır.
- Native upstream regresyonları: **CDP: 263/263 PASS**; **Session: 4/4 PASS**; **Storage: 1/1 PASS**; **Frame: 22/22 PASS**. Debug test runner’ın leak denetimi açık kalır.
- Kill testinde bir worker’ın üç tab’ı LOST olur; diğer profil devam eder. Eski tab ID’leri yeniden açılamaz ve kapanışta worker kalmaz.

## Erken bellek ölçümü

Üç topoloji aynı optimize motorla sıralı olarak 600’er saniye çalıştı. Her tab: 200 DOM satırı, 500 ms JS güncellemesi, 15 s yerel fetch, 5 s içerik ve artan JS sayacı kontrolü, 30 s reload. Donmuş sayaç DOM doğru kalsa bile FAIL olur; reload yeni sayaç başlangıcı oluşturur. Tek Node host/ölçüm sürücüsü bir kez, worker process tree’leri benzersiz sayılır. Ayrı fixture child süreç ürün toplamından çıkarılır. Ölçümde worker tab kotası 10 olarak önceden kaydedilmiştir; normal varsayılan 8’dir.

| Profil | Tab/profil | Sonuç | Süre sn | İçerik/JS kontrolü | Ürün footprint medyan MiB | Ürün örneklenen tepe MiB | Worker toplam medyan MiB | Ortak host medyan MiB |
|---|---|---|---:|---:|---:|---:|---:|---:|
| 1 | 1 | PASS | 600.0 | 120 | 54.05 | 113.66 | 10.55 | 43.16 |
| 1 | 10 | PASS | 600.0 | 1200 | 58.94 | 86.49 | 14.63 | 44.27 |
| 4 | 1 | PASS | 600.0 | 480 | 111.70 | 147.35 | 42.91 | 68.63 |

İlk okuma ve açık reload sonrası okumalar sayaç başlangıcı oluşturur; diğer kontrollerde artış zorunludur. Doğrulanmış arka plan JS ilerlemesi: 1p-1t: 100; 1p-10t: 1000; 4p-1t: 400.

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

`cd browser && npm ci --ignore-scripts && npm run engine:build && npm test && npm run measure`. [Motor derleme notları](../browser/engine/README.md) araç sürümlerini açıklar. Kısa harness koşuları ve yarım testler final sonuçlara dahil değildir.

- [Run manifesti](../browser/results/a1-2026-10-16T06-40-50-588Z/manifest.json), [sonuçlar](../browser/results/a1-2026-10-16T06-40-50-588Z/results.json), [özet](../browser/results/a1-2026-10-16T06-40-50-588Z/summary.json).
- [Core test makbuzu](../browser/results/a1-2026-10-16T06-40-50-588Z/test-manifest.json), [TAP](../browser/results/a1-2026-10-16T06-40-50-588Z/test.tap), [native regresyon makbuzu](../browser/results/a1-2026-10-16T06-40-50-588Z/native-test-manifest.json).
- [1 profil × 1 tab](../browser/results/a1-2026-10-16T06-40-50-588Z/1p-1t-samples.json), [1 profil × 10 tab](../browser/results/a1-2026-10-16T06-40-50-588Z/1p-10t-samples.json), [4 profil × 1 tab](../browser/results/a1-2026-10-16T06-40-50-588Z/4p-1t-samples.json) bellek örnekleri.
- Aynı klasörde test edilen kaynak snapshot’ları, içerik kontrolleri, olaylar ve native test logları bulunur.

## Genişletilmiş kaynak incelemesi

RAM dışında CPU, disk I/O, thread/FD/socket ve yük altındaki gecikmeleri kapsayan ek deneyler [A1 kaynak kullanımı raporunda](A1_RESOURCE_RESULTS.md) ayrı sunulur. Yeni işlev kontrolleri geçse de yoğun ağda native RAM tutulumu açık bulgudur; önceki A1 işlev kabulü sabit bellek tüketimi onayı değildir. Buradaki önceki kabul ölçümleri ve kaynak snapshot’ları değiştirilmez.
