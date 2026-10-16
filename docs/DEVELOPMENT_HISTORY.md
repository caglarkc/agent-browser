# Geliştirme sorunları, kararlar ve düzeltmeler

Son kayıt tarihi: **16 Ekim 2026 (Europe/Istanbul)**. Bu dosya, ürünün **ne değiştiğini, neden değiştiğini ve hangi kanıtla doğrulandığını** izler. Laboratuvar, plan, kod, test/ölçüm araçları ve belge hataları birlikte kaydedilir. Geriye dönük ilk kayıt; depodaki raporlar, korunmuş sonuçlar, Git geçmişi ve bu geliştirme oturumunun kanıtları üzerinden oluşturulmuştur. Kaydı olmayan bir arıza veya kök neden uydurulmaz.

Güncel ürün kapsamı [gereksinimler](BROWSER_REQUIREMENTS.md), teslim sırası [plan](BROWSER_PLAN.md), ayrıntılı mimari karar [ADR 001](adr/001-a1-worker-profile-topology.md) içindedir. Bu günlük bunların yerine geçmez. Tarihsel sonuçlar kendi motor/kaynak sürümleriyle geçerlidir; eski dosyalar yeni sonuca göre değiştirilmez.

## Okuma ve güncelleme kuralı

- **Düzeltildi:** belirtilen kapsamda kod/araç değişikliği ve doğrulama var; genel internet uyumluluğu veya sonraki faz kabulü anlamına gelmez.
- **Karar alındı:** gereksinim/mimari değişti; henüz uygulanmamış bölümler çözülmüş sayılmaz.
- **Açık:** düzeltme veya yeterli kapanış kanıtı yok. **Sınır:** desteklenmeyen/ölçülmeyen yetenek açıkça belirtilmiş.
- Her yeni soruna kalıcı `DEV-NNN` verilir. Kayıtta tarih/faz, belirti/etki, nedenin kanıt düzeyi, değişiklik ve gerekçesi, test/ölçüm, commit/kanıt bağlantısı ve kalan iş bulunur. Sadece düşünülen seçenekler uygulanmış gibi yazılmaz.
- Mevcut kayıt silinmez veya sonradan başarılı görünmesi için yeniden yazılmaz; kapanış/yeniden açılma tarihli takip notuyla eklenir. Hatalı kayıt düzeltmesinde önceki iddia ve düzeltme nedeni korunur.
- Kanıt commit'i biliniyorsa yazılır. Yeni kaydın kendi commit SHA’sı commit öncesinde uydurulmaz; aynı commit’te yer alması Git dosya geçmişinden izlenir. Tarihler bulgu/deney tarihidir; aşağıdaki commit tarihleri ayrıca teslim zamanını gösterir.
- Secret, gerçek credential, kişisel giriş verisi ve hassas ham payload günlüğe kopyalanmaz. Güvenli fixture/repro ve hash/kimlik kullanılır.

## Teslim zaman çizelgesi

| Teslim | Tarih | Değişiklik / neden |
|---|---|---|
| [7ff5b95](https://github.com/caglarkc/agent-browser/commit/7ff5b95) | 14 Ekim | Daha önce yapılan lab deneyleri, başarısızlıklar ve protokoller kaynaklarıyla paylaşıldı; bu commit tek tek deneylerin yapıldığı tarih değildir. |
| [82296f8](https://github.com/caglarkc/agent-browser/commit/82296f8) | 14 Ekim | Proje Agent Browser adını aldı. |
| [b295f77](https://github.com/caglarkc/agent-browser/commit/b295f77) | 15 Ekim | İnsan kontrolü olmayan kendi tarayıcımızın B01–B43 gereksinimleri ve gereksinim sırasına bağlı yedi fazı yazıldı. |
| [2d10068](https://github.com/caglarkc/agent-browser/commit/2d10068) | 16 Ekim | İlk motor engeli sonrası gerçek native çoklu sekme, profil/worker çekirdeği, kaynak pinleri ve A1 kabulü teslim edildi. |
| [2d05f28](https://github.com/caglarkc/agent-browser/commit/2d05f28) | 16 Ekim | A1 kaynak incelemesi genişletildi; CPU rekabeti ve yoğun ağda RAM tutulumu ortaya kondu. |
| [e09fab3](https://github.com/caglarkc/agent-browser/commit/e09fab3) | 16 Ekim | Fetch kalıcı referansı bırakıldı, CDP kayıtları sınırlandı; karşılaştırmalı bellek testleri ve kalan küçük artış belgelendi. |

## Ürün ve plan kararları

### DEV-001 — Benchmark laboratuvarı ürün tarayıcısı değildi

**Tarih/faz:** 14–15 Ekim; **durum:** karar alındı, A1 uygulandı. **Belirti:** normal tarayıcılar üzerindeki JEV/DOM/OCR karşılaştırmaları kendi tarayıcımızın hazır olduğu izlenimini verebilirdi. **Neden:** lab yürütme/karar yığınını ölçüyordu; kendi profil, sekme, worker ve API sözleşmemiz ayrı teslimdi. **Değişiklik:** Lightpanda tabanlı ürün `browser/` altında ayrıldı; modelden bağımsız çekirdek önce, JEV A6’da. Chromium/OCR tarihsel karşılaştırma olarak kaldı; ürün fallback’i yapılmadı. **Kanıt:** [plan §1–2](BROWSER_PLAN.md), [çekirdek](../browser/README.md); `b295f77`, `2d10068`. **Kalan:** A2–A7 kendi kapılarıyla kabul edilecek.

### DEV-002 — İnsan tarayıcı kontrolü ürün amacını bozuyordu

**Tarih/faz:** 14–15 Ekim; **durum:** kapsam kararı. **Belirti/etki:** insanın sayfa/sekme görmesi, gezmesi veya kontrol devralması istenmeyen ürün yüzeyi ve maliyet ekliyordu. **Değişiklik/gerekçe:** ürün tamamen agent odaklı; screenshot/OCR, insan gezinmesi, kontrol paneli/takeover ve genel eklenti sistemi kapsam dışı. Tek insan kanalı gerektiğinde hassas veri cevabı veren dar modül. Her input insana yönlendirilmez. **Kanıt:** [gereksinimler §9](BROWSER_REQUIREMENTS.md), [plan A4](BROWSER_PLAN.md); `b295f77`. **Kalan:** hassas girdi modülü A4’te; A1’de uygulanmış değildir.

### DEV-003 — Plan, gereksinim önceliklerini ve teslimlerini yeterince izlemiyordu

**Tarih/faz:** 15 Ekim; **durum:** plan düzeltildi. **Belirti:** benchmark/JEV odaklı eski sıra profil, yetki/egress, private input ve kalıcılık için izlenebilir teslim/kabul bırakmıyordu. **Değişiklik:** A1 profil/sekme → A2 kimlik/ağ → A3 DOM → A4 hassas girdi → A5 kalıcılık/koordinasyon → A6 uyumluluk/JEV → A7 kapasite sırası; B01–B43 eşlemesi, teslimler, T01–T12 ve sayısal başlangıç limitleri. **Kanıt:** [plan §6–9](BROWSER_PLAN.md); `b295f77`. **Kalan:** bir B-ID’nin plana yazılması uygulama kanıtı değildir; fazlar ayrı kabul edilir.

### DEV-004 — İzolasyon ile 60 profil / 500 MB hedefi kanıtsız bağlanıyordu

**Tarih/faz:** 15–16 Ekim; **durum:** topoloji kararı, kapasite açık. **Belirti:** tek görev medyanını 60 oturuma çarpmak veya bellek için güven sınırını gevşetmek güvenilir kapasite hesabı değildi. **Değişiklik:** farklı principal/etkin policy ayrı worker; bir profilin gerçek sekmeleri aynı native Session’da; ortak Node host bir kez sayılır. Topoloji erken ölçülür, 60/500 MB A7’de ayrı sınanır. **Kanıt:** [ADR 001](adr/001-a1-worker-profile-topology.md), [A1 sonuçları](A1_RESULTS.md); `2d10068`. **Kalan:** 60 bağımsız aktif profil / 500.000.000 byte kanıtlanmadı.

### DEV-005 — Localhost/CDP ve interception güvenlik sınırı sayılmamalı

**Tarih/faz:** 15–16 Ekim; **durum:** karar alındı, güvenlik açık. **Risk:** yerel süreç ham CDP’ye veya doğrudan ağa erişebilir; profil metadata’sı agent yetkisi değildir. **Değişiklik:** agent başına token/grant/revoke; OS izolasyonu, güvenilir relay ve zorunlu egress A2 teslimi yapıldı. Puppeteer interception tek ağ güvencesi sayılmaz. A1 SDK raw CDP vermez, yalnız trusted yerel fixture kullanır. **Kanıt:** [plan A2](BROWSER_PLAN.md), [ADR güvenlik sınırı](adr/001-a1-worker-profile-topology.md), [SDK sınırı](../browser/README.md); `b295f77`, `2d10068`. **Kalan:** Linux izolasyon/direct bypass/agent güvenlik kabulü yapılmadı.

### DEV-006 — Agent/sayfa serbest metni sahte parola talebi açabilirdi

**Tarih/faz:** 15 Ekim; **durum:** tasarım kararı, uygulama açık. **Risk:** prompt injection, yanlış frame/form hedefi ve agent anahtarıyla eklenti cevabı gönderme. **Değişiklik:** izinli credential/login intent, top-level/frame origin ve form-action bağlama; güvenilir amaç şablonu, ayrı eklenti kimliği, tek kullanımlık cevap, stale/replay reddi ve çıktı maskeleme A4’e bağlandı. Ephemeral private veri ile A5 şifreli profil/vault/anahtar yönetimi ayrıldı. **Kanıt:** [B13–B14/B23–B26 ve private input sözleşmesi](BROWSER_REQUIREMENTS.md), [A4–A5](BROWSER_PLAN.md); `b295f77`. **Kalan:** gerçek login, OTP, secret maskeleme ve vault kanıtları yok.

### DEV-007 — Canlı sitelerde mutlak 42/42 koşulu dış hataları ürün hatasıyla karıştırabilirdi

**Tarih/faz:** 15 Ekim; **durum:** kabul planı düzeltildi. **Neden:** rate limit, site değişimi ve gecikme; aynı 14 hedefin tekrarı bağımsız çeşitlilik değildir. **Değişiklik:** deterministik fixture/güvenlik kapıları ile canlı örnekleme, eşik, dış hata sınıfları ve tekrar politikası ayrıldı; koşudan önce sabitlenir. Domain yük/429 duruş limitleri ve sıfır yanlış-PASS ilkesi yazıldı. **Kanıt:** [plan §7 ve L17–L18](BROWSER_PLAN.md); `b295f77`. **Kalan:** yeni ürünün canlı kabulü A6’da henüz yapılmadı.

## Laboratuvarda görülen sorunlar

Bu bölüm tarihsel lab’a aittir. Buradaki model/OCR düzeltmeleri A1 ürününe JEV veya insan arayüzü eklendiği anlamına gelmez. Ana teslim commit’i `7ff5b95`; deney tarihleri kaynak raporlarda korunur.

### DEV-008 — Menü seçimi tekrarlayan model döngüsü

**Tarih:** 13 Ekim; **durum:** lab örneğinde düzeltildi. **Belirti:** önceki 12 çağrılı canlı menü koşusu aynı seçimi tekrar ederek FAIL oldu. **Değişiklik:** son eylemler karar girdisine eklendi; model geçmiş başarısız seçimi görebildi. **Kanıt:** [lab ilk doğrulama](../lab/README.md); yeni üç profil 3/3 PASS, toplam 9 çağrı. Eski ve yeni koşu ayrı korundu; hazırlık toplamı 21 çağrı. **Kalan:** tek fixture örneği genel döngü çözümü değildir; ürün controller’ının ilerleme/döngü denetimi sonraki fazdadır.

### DEV-009 — OCR’a uygulanamayan MORE ve yinelenen fiyat adayları

**Tarih:** 13 Ekim lab pilotu; **durum:** lab adapter’ında düzeltildi. **Belirti:** görsel gözleme semantik kontrol sayfalama eylemi sunuluyor, fiyat adayları yineleniyordu. **Değişiklik:** MORE yalnız DOM kontrol grubu ilerlemesi; görsel yol scroll kullanır; tekrar eden fiyat adayları düzeltildi. Pilot final toplama katılmadı. **Kanıt:** [canlı protokol](../lab/LIVE_TEST_PROTOCOL.md), [v2 sonuçları](../lab/LIVE_RESULTS.md). **Kalan:** OCR ürün yolu değildir; görsel ve DOM maliyetleri eşit kabul edilmez.

### DEV-010 — Dil farkı, navigation sırasında observation kesintisi ve bağlantı bağlamı

**Tarih:** 13 Ekim lab v1→v2; **durum:** lab adapter/protokol düzeltmesi. **Belirti:** varsayılan dil/UA farkları, navigation sırasında context yok olması ve eksik bağlantı bağlamı karşılaştırmayı etkiliyordu. **Değişiklik:** bütün modlarda ortak Accept-Language; gözlenmiş link adresi; salt okuma/gözlemde en fazla üç tekrar. Click veya JEV çağrısı otomatik yeniden gönderilmez. **Kanıt:** [protokol v1/v2 ayrımı](../lab/LIVE_TEST_PROTOCOL.md); 84 ve 42 denemelik turlar ayrı. **Kalan:** UA/render farkları devam eder; v2 her siteyi düzeltmedi.

### DEV-011 — GitHub ve OSM’de dört Lightpanda başarısızlığı

**Tarih:** 13–14 Ekim; **durum:** açık, ürün A3/A6 takibi. **Belirti:** GitHub Closed erken DONE/`issues#`; Open geçişinde undefined hedefe `dispatchEvent`; OSM History nesne geçmişi yerine genel `/history`; Details’ta 2.474 aday ve sonuçsuz MORE. **Değişiklik:** kanıt/aday kök neden ayrımı, document epoch/kararlı ref, bölge/nesne bağlamı, arama ve bağımsız verifier çözüm yolu plana yazıldı. **Kanıt:** [plan §5](BROWSER_PLAN.md), [canlı sonuçlar](../lab/LIVE_RESULTS.md): Lightpanda 10/14. **Kalan:** hydration veya motor uyumsuzluğu kesin kök neden ilan edilmedi; A1 çoklu sekme testleri bu dört siteyi kapatmaz.

### DEV-012 — Semantik DOM, rendered input ve iframe/canvas aynı yetenek değildi

**Tarih:** 13–14 Ekim; **durum:** sınır kaydı. **Belirti:** CSS-hidden/pointer testleri semantik yollarda başarısız; eski Lightpanda/driver child iframe gözleminde kısıtlı; canvas/trusted input destek dışı veya başarısız. **Değişiklik:** capability ve açık UNSUPPORTED ayrımı; gerçek rendered görünürlük/`isTrusted` eşdeğerliği vaat edilmedi. **Kanıt:** [lab README](../lab/README.md), [plan §2](BROWSER_PLAN.md). **Kalan:** A1 iframe yükleme/storage/history kanıtı, kapsamlı iframe observation veya trusted input desteği değildir.

### DEV-013 — Fixture favicon gürültüsü

**Tarih:** 13 Ekim; **durum:** lab fixture düzeltildi. **Belirti:** ilk Chrome console kaydında favicon 404. **Değişiklik:** fixture sunucusuna 204 cevabı eklendi; test logundaki gereksiz hata temizlendi. **Kanıt:** [lab ilk doğrulama](../lab/README.md). **Kalan:** bu fixture düzeltmesi canlı site console hatalarının tümünü çözmez.

## A1 motoru ve yaşam döngüsü

### DEV-014 — Aynı profilde ikinci gerçek sekme açılamıyordu

**Tarih:** 15–16 Ekim; **durum:** native motorda düzeltildi. **Belirti:** ilk ölçümde 1p×10t `BLOCKED_ENGINE`; Lightpanda 1.0.0 ikinci target’ı `TargetAlreadyLoaded` ile reddediyordu, diğer topolojilerin PASS’i A1 kapısını kapatmıyordu. **Değişiklik:** pinli upstream üzerinde aynı Session’ı paylaşan gerçek Page/CDP target modeli. Cookie kopyalayarak sahte sekme, tek sayfayı reload ile değiştirme ve Chrome fallback reddedildi. **Kanıt:** [engelli eski koşu](../browser/results/a1-2026-10-15T09-27-14-027Z/summary.json), [ADR 001](adr/001-a1-worker-profile-topology.md), [yeni kabul](A1_RESULTS.md); `2d10068`. **Kalan:** popup keşfi/bağımsız popup ömrü ayrı kapsam.

### DEV-015 — Yalnız target engelini kaldırmak yeterli değildi

**Tarih:** 15–16 Ekim; **durum:** A1 kapsamında düzeltildi. **Risk/etki:** ortak default context, history, frame arena, node kayıtları ve olay yönlendirmesi tab’ları birbirine bağlayabilirdi. **Değişiklik:** per-target page handle/context, arena/kayıt/lifecycle/network routing; tab ve frame history ayrılığı; Runtime çağrısının adreslenen target default context’ine gitmesi. Navigation/close yalnız ilgili context’leri yok eder. **Kanıt:** [A1 test raporu](A1_RESULTS.md), [native tab testleri](../browser/test/native-tabs.test.mjs), [motor patch’i](../browser/engine/multitab.patch); `2d10068`. **Kalan:** inspector grup içi context bildirimleri agent yetki sınırı değildir.

### DEV-016 — Cookie/localStorage paylaşımı ile sessionStorage ayrılığı karışabilirdi

**Tarih:** 15–16 Ekim; **durum:** native semantik doğrulandı. **Değişiklik/gerekçe:** cookie/localStorage Session/origin kapsamlı; sessionStorage top-level tab/origin kapsamlı; aynı-origin iframe tab deposunu kullanır. Opener bağımsız başlangıç kopyası alır, noopener almaz; bu sürekli senkronizasyon kopyası değildir. **Kanıt:** [A1 sonuçları](A1_RESULTS.md), [storage/opener testleri](../browser/test/native-tabs.test.mjs); 10 varyant ×3 tekrar ×3 gerçek tab corpus’u, `2d10068`. **Kalan:** kalıcı şifreli profil ve tüm DOM Storage event uyumluluğu ayrı teslim.

### DEV-017 — Profil açılışı, kota ve kapanış yarışları

**Tarih:** 15–16 Ekim; **durum:** A1 yerel host sözleşmesi uygulandı/test edildi. **Risk:** aynı profilin iki host tarafından açılması, paralel create ile kota aşımı, startup sırasında close, kill sonrası eski tab ID’si ve worker sızıntısı. **Değişiklik:** atomik profil kilidi, admission rezervasyonu, fresh session/worker/tab ID’leri, startup/close koordinasyonu, bounded olay geçmişi ve worker çıkmadan kilidi bırakmama. Worker kaybı bütün ilgili tab’ları LOST yapar; diğer profil devam eder. **Kanıt:** [host testleri](../browser/test/host.test.mjs), [CLI testi](../browser/test/cli.test.mjs), [A1 kabulü](A1_RESULTS.md); `2d10068`. **Kalan:** stale lock otomatik çalınmaz; hostile OS süreci/agent lease ve recovery güvenliği A2/A5’tir.

### DEV-018 — Ortak cookie değişimi login/logout kanıtı sayılmamalı

**Tarih:** 16 Ekim; **durum:** A1 sinyal sözleşmesi uygulandı. **Değişiklik:** opt-in `Browser.profileStateChanged` → deduplicate edilmiş `PROFILE_STATE_CHANGED`; cookie adı/değeri/URL taşınmaz. Logout sonrası ortak durum değişimi test edilir; bildirim uygulama hesabının gerçekten login/logout olduğunun kanıtı diye sunulmaz. **Kanıt:** [engine README](../browser/engine/README.md), [A1 raporu](A1_RESULTS.md); `2d10068`. **Kalan:** gerçek hesap login’i bu fixture testlerinden çıkarılamaz.

### DEV-019 — Donmuş sayfaya bakıp soak PASS üretme riski

**Tarih:** 16 Ekim; **durum:** test aracı güçlendirildi. **Risk:** doğru DOM metni retained kalırken JS durabilir; reload sayaç reset’i yanlış başarısızlık/başarı doğurabilir. **Değişiklik:** etiket ve artan tick/fetch kontrolleri; donmuş/yanlış tab negatif testleri; yalnız ilk okuma ve açık reload yeni sayaç başlangıcı oluşturur. **Kanıt:** [fixture progress testi](../browser/test/fixture-progress.test.mjs), [A1 600 s ölçümleri](A1_RESULTS.md); `2d10068`. **Kalan:** örnekleme kısa anlık duraklamaları tamamen yakalamaz.

### DEV-020 — Build/ölçüm farklı binary ile yapılabilirdi

**Tarih:** 15–16 Ekim; **durum:** kaynak/binary doğrulaması uygulandı. **Risk:** patchsiz upstream, farklı yerel binary veya Debug/Release sonuçlarının karışması. **Değişiklik:** upstream/archive/patch/değişen dosya/tam source-tree hash’leri, toolchain ve build manifesti; fresh-tree patch doğrulaması; ReleaseFast + optimize V8 snapshot; runtime startup binary hash kontrolü. Eski motor yalnız etiketli regresyon probu. Native kaynak/lisans bildirimleri korunur. **Kanıt:** [build aracı](../browser/scripts/build-engine.mjs), [source pinleri](../browser/engine/source.json), [engine açıklaması](../browser/engine/README.md); `2d10068`, `e09fab3`. **Kalan:** farklı SDK/toolchain rebuild hash’i değişirse yeni receipt/test gerekir; binary/cache Git’e yüklenmez.

## Kaynak ölçümü ve bellek düzeltmeleri

### DEV-021 — Paylaşılan host’u çarpmak ve eksik metriği sıfır saymak

**Tarih:** 15–16 Ekim; **durum:** ölçüm yöntemi/testi uygulandı. **Risk:** driver’ın her worker için yeniden sayılması, PID reuse, RSS/footprint karışması, bulunmayan counter’ın sıfır gibi görünmesi. **Değişiklik:** benzersiz process union, tek ortak host, ayrı fixture; identity/counter reset denetimi, eksikte null, ayrı setup/sustained/RSS/footprint. **Kanıt:** [memory testleri](../browser/test/memory.test.mjs), [resource testleri](../browser/test/resources.test.mjs), [rapor](A1_RESOURCE_RESULTS.md); `2d10068`, `2d05f28`. **Kalan:** sampled guard OS hard cap veya Linux PSS değildir.

### DEV-022 — Mach CPU zamanının birimi açık dönüştürülmeliydi

**Tarih:** 16 Ekim; **durum:** probe/test teslimi. **Risk:** Mach tick değerini ns sanmak CPU yüzdesini yanlış çıkarabilir. Bu kayıt bütün eski CPU sayılarının hatalı olduğuna dair iddia değildir. **Değişiklik:** gerçek `mach_timebase_info` dönüşümü, cumulative ns / gerçek monotonic süre, %100=bir mantıksal çekirdek; Node’un bağımsız CPU sayacıyla oran testi. **Kanıt:** [C probe](../browser/native/resource-probe.c), [resource testleri](../browser/test/resources.test.mjs), [ölçüm yöntemi](A1_RESOURCE_RESULTS.md); `2d05f28`. **Kalan:** watt/sıcaklık ölçülmedi, E/P çekirdek kapasitesi eşit sayılmaz.

### DEV-023 — Çok sekme CPU’da aynı worker’ın kapasitesini paylaşıyor

**Tarih:** 16 Ekim; **durum:** gözlenen sınır, optimizasyon açık. **Belirti:** 16 yoğun tab tek profilde yaklaşık bir çekirdeği dolduruyor; inspect p95 yaklaşık 160 ms ve sayaç hızı 6,24 Hz. Dört profil/worker’da yaklaşık 159% ürün CPU, p95 10,62 ms, 9,91 Hz. **Karar:** ayrı worker paralellik getirir ama RAM/thread maliyeti vardır; güven sınırı RAM için gevşetilmez. **Kanıt:** [CPU takip tablosu](A1_RESOURCE_RESULTS.md); `2d05f28`. **Kalan:** genel adalet/timeout/SLA çözümü uygulanmış değildir; tek tekrar genellenmez.

### DEV-024 — Yoğun ağda 736 MiB bir açılış sıçraması değildi

**Tarih:** 16 Ekim; **durum:** tanı tamamlandı, büyük birikim DEV-025/026 ile azaltıldı. **Belirti:** 10 tab ×250 ms/64 KiB fetch, 120 s kesintisiz koşuda 29→205→382→560→736 MiB. Tek worker, thread/FD patlaması yok. Capture kapalıyken bile tepe 417,84 MiB. **Çıkarım:** yalnız cache’i kapatmak yetmiyor; bütün artışın Node’dan geldiği varsayımı yanlış. **Kanıt:** [önceki kaynak raporu](A1_RESOURCE_RESULTS.md), [kök neden raporu](A1_MEMORY_FIX.md); `2d05f28`, `e09fab3`.

### DEV-025 — Tamamlanan fetch’ler kalıcı resolver kökü bırakıyordu

**Tarih:** 16 Ekim; **durum:** kanıtlanmış kök neden düzeltildi. **Repro:** 32 fetch ve body okuma bitince GlobalTracker başlangıcına dönmeli; eski kodda beklenen 0, bulunan 32. **Değişiklik:** resolver önce yerel handle’a alınır, kalıcı handle success/error/abort/shutdown’da bırakılır; `.settled` ve kurulum `errdefer` yolu çift release/sızıntıyı önler. JS’nin tuttuğu Response okunabilir kalır; CacheStorage completion yolu korunur. **Kanıt:** [önceki FAIL ve yeni test bağlantıları](A1_MEMORY_FIX.md), [302 native test makbuzu](../browser/results/a1-memory-fix-2026-10-16/native/manifest.json); `e09fab3`. **Kalan:** bütün olası native allocation’ların bounded olduğu sonucu çıkmaz.

### DEV-026 — CDP body/POST/metadata kaydı yeterince sınırlı değildi

**Tarih:** 16 Ekim; **durum:** native L19 sınırları uygulandı. **Neden:** eski response bütçesi target başına 200.000.000 byte; worker toplam sınırı yok; body eviction metadata tombstone’larını bırakıyordu; POST kopyası frame arena’da kalabiliyordu. **Değişiklik:** target response 1 MiB/tek 256 KiB, POST toplam 256 KiB/tek 64 KiB, her map en çok 128 kayıt; tüm worker capture kapasitesi 8 MiB. Client tavanı yükseltemez. POST gerçek free; disable/close/teardown bütçeyi iade eder; metadata düşse de geç body chunk’ı HTTP isteğini bozmaz. **Kanıt:** [L19 ve testler](A1_MEMORY_FIX.md), [patch](../browser/engine/multitab.patch); `e09fab3`. **Kalan:** cache sınırı süreç RAM tavanı veya target’lar arası adalet garantisi değildir.

### DEV-027 — HeapProfiler GC komutu desteklenmiyordu

**Tarih:** 16 Ekim; **durum:** açık capability sınırı. **Belirti:** `HeapProfiler.collectGarbage` method-not-found. **Karar:** UNAVAILABLE kaydedildi; GC çalıştı, bellek geri bırakıldı veya forced GC ile çözüm sağlandı denmedi. Üretim optimizasyonu olarak eklenmedi. **Kanıt:** [önceki rapor](A1_RESOURCE_RESULTS.md), [yeni dört koşu](A1_MEMORY_FIX.md); `2d05f28`, `e09fab3`. **Kalan:** allocation/heap profili ayrı araştırma gerektirir.

### DEV-028 — 134,8 s örnekleme boşluğu ölçümü geçersiz kıldı

**Tarih:** 16 Ekim; **durum:** eski takip serisi dışlandı, araç denetimi eklendi. **Değişiklik:** bütün kusurlu seri kabul dışı tutuldu; sleep inhibitor, ≤3 s örnek aralığı ve ≤5 s süre aşımı sınırıyla yeniden koşuldu. Kaynak/probe/binary kimliği bağımsız kontrol edildi; reddetme testi eklendi. **Kanıt:** [kaynak raporu](A1_RESOURCE_RESULTS.md), [dışlama kaydı](../browser/results/a1-resources-2026-10-16T07-29-23-666Z/followups/excluded-runs.json); `2d05f28`. **Kalan:** sleep inhibitor yüksek sistem yükündeki bütün gecikmeleri engellemez.

### DEV-029 — Düzeltme ölçümünde de iki timing denemesi reddedildi

**Tarih:** 16 Ekim; **durum:** dışlandı ve aynı eşiklerle tekrarlandı. **Belirti:** 4.304,74 ms gap/probe ~3 s nedeniyle ilk 120 s batch; 3.095,32 ms nedeniyle ilk 600 s denemesi FAIL. Aynı örneklerde sistem CPU’su %72,7/%73,9. **Değişiklik:** ham kusurlu denemeler ve gerekçeleri ayrı korundu; başka işler durdurulmadı, eşik gevşetilmedi; bağımsız kısa batch ve yeni uzun koşu tamamlandı. **Kanıt:** [iki dışlama ve ham dizinler](../browser/results/a1-memory-fix-2026-10-16/excluded-runs.json); `e09fab3`. **Kalan:** dış yük ile gap ilişkisi tek başına kesin neden ispatı değildir; CPU hızlanması çıkarılmaz.

### DEV-030 — Doğrulayıcı sabit aralıklı örnek/kontrol sayısı varsayıyordu

**Tarih:** 16 Ekim; **durum:** analiz aracı düzeltildi. **Belirti:** geçen 600 s testte 1.180 progress kontrolü nominal sayıdan az diye reddedildi; sonra örnek sayısı varsayımı da yanlış çıktı. **Kanıtlı neden:** producer batch bitince 5 s bekliyor; sampler busy iken timer tick’ini atlıyor. **Değişiklik:** gerçek başlangıç/bitiş kapsaması, her ≤3 s sample aralığı ve her tab’da ≤10 s progress aralığı denetlenir; nominal tam sayı şartı kaldırıldı. RAM/protokol/ölçüm verisi değişmedi. **Kanıt:** [ilk iki reddetme, düzeltme ve hash kaydı](../browser/results/a1-memory-fix-2026-10-16/verifier-correction.json), [5 s gap/200 MiB/failed-progress negatif testleri](../browser/results/a1-memory-fix-2026-10-16/verifier-rejection.json); `e09fab3`.

### DEV-031 — Büyük iyileşme bütün RAM artışını kapatmadı

**Tarih:** 16 Ekim; **durum:** büyük regresyon azaltıldı, küçük artış açık. **Sonuç:** aynı 120 s sürekli yükte 736,25→46,09 MiB tepe; 600 s’de 51,56 MiB, 23.662 istek, 1.180 başarılı kontrol. Dört geçerli koşuda 1.900 kontrol, native 302/302 ve ürün 23/23, kalan worker sıfır. **Kalan:** uzun testte son iki 120 s medyanı 44,69→48,33 MiB (+3,64 MiB). Bunun allocator/GC high-water davranışı veya başka tutulum olduğu kanıtlanmadı; allocation profili ve daha uzun koşu gerekir. **Kanıt:** [rapor/grafik](A1_MEMORY_FIX.md), [doğrulama](../browser/results/a1-memory-fix-2026-10-16/verification.json); `e09fab3`. A2 bu çalışmada başlatılmadı.

## Depo ve belge sürekliliği

### DEV-032 — Tamamlanan işin yalnız yerelde kalması

**Tarih:** 16 Ekim; **durum:** sürekli teslim kuralı uygulandı. **Talep/etki:** kullanıcı yapılan her işin GitHub’a gitmesini istedi; yerel diff teslim sayılmıyor. **Değişiklik:** [AGENTS.md](../AGENTS.md) ve [plan §10](BROWSER_PLAN.md) her tamamlanan işte doğrulama→commit→push→uzak SHA/temiz ağaç kontrolünü zorunlu kılar. Secret/binary/cache hariç tutulur, force push yapılmaz. **Kanıt:** `2d10068` sonrası teslim commit’leri ve Git geçmişi. **Kalan:** push başarısızsa açıkça raporlanır; başarılıymış gibi kapatılmaz.

### DEV-033 — Eski plan ve değerlendirmeler yeni ürünle karışabilirdi

**Tarih:** 14–16 Ekim; **durum:** belge önceliği tanımlandı, geçmiş korundu. **Değişiklik:** güncel gereksinim/plan esas; eski MVP, kabul, task contracts ve 27 maddelik review tarihsel destek olarak kaldı. Sheets, iki görsel motor ve iki sağlayıcı yeni ilk sürümün otomatik zorunluluğu değildir. Eski ölçümler sonradan yeni binary’ye aitmiş gibi değiştirilmez. **Kanıt:** [plan §1/§10](BROWSER_PLAN.md), [arşiv](archive/v1.0/README.md), aşağıdaki eski bulgu indeksi; `b295f77`. **Kalan:** tarihsel bir tasarımın yazılmış olması runtime PASS değildir.

### DEV-034 — Sorun/düzeltme gerekçeleri farklı raporlara dağılmıştı

**Tarih:** 16 Ekim; **durum:** bu kayıt ve sürekli güncelleme kuralı eklendi. **Değişiklik:** lab, ürün kararları, motor, ölçüm, başarısız deneme ve doğrulayıcı hataları kalıcı ID’lerle birleştirildi; README/plan/AGENTS üzerinden erişim sağlandı. **Doğrulama:** 38 DEV kaydının tekilliği/sırası, eski 27 bulgunun eksiksiz indeksi, yerel bağlantılar, commit referansları ve doküman diff’i kontrol edildi. Yalnız belge/kural değişikliği olduğundan motor testleri yeniden çalıştırılmadı. **Teslim:** bu dosyayı ekleyen Git commit’i. **Kalan:** sonraki çalışmalar aynı commit’te gerekçe/kanıt/durum kaydı eklemedikçe bu geçmiş güncel sayılmaz.

### DEV-035 — İnceleme yorumlarında kanıttan güçlü sonuçlar vardı

**Tarih:** 14–15 Ekim tasarım incelemesi; **durum:** değerlendirme düzeltildi, güvenlik varsayımları kanıt yerine konmadı. **Düzeltmeler:** JEV repo’da tanımlı `jev-1.13.0` karar modelidir; 14 hedef ve dört başarısız senaryo plan/testte isimlidir. 83,79 MiB Node dahil boru hattı ölçümüdür; bunu 60 ayrı worker maliyeti diye çarpmak doğru değildir. Planın agent başına kimlik sözleşmesini eksik tanımlaması tek anahtar zorunlu kıldığı anlamına gelmez; profil ayrılığının anılması da kalıcılık teslimi sayılmaz. Commit, referans için yararlıdır fakat belge incelemesinin önkoşulu değildir. **Kanıt:** kullanıcının paylaştığı karşı değerlendirme; [lab sonuçları](../lab/LIVE_RESULTS.md), [güncel plan](BROWSER_PLAN.md), DEV-003/004/006. **Güvenlik sınırı:** bir dosyanın gitignore’da olması yalnız o andaki takip davranışını gösterir; geçmişte hiç sızmadığının kanıtı değildir. Bu günlük yeni bir secret-history denetimi yapıldığını veya geçmişte sızıntı olmadığını iddia etmez.

### DEV-036 — Yardımcı kayıt scriptlerinde çalışma dizini ve ilk örnek varsayımı

**Tarih:** 16 Ekim bellek çalışması; **durum:** işlem sırasında düzeltildi. **Belirti:** bazı tek seferlik rapor/dışlama komutları `browser/` içindeyken tekrar `browser/` öneki kullanıp FileNotFound üretti. Dışlama makbuzu oluşturulurken ilk örneğin `elapsedMs:null` olması Python karşılaştırmasında TypeError üretti; dizin taşıması o aşamadan önce gerçekleşmişti. **Düzeltme:** doğru repo/çıktı yolu ve null kontrolü kullanıldı; zaten taşınmış dizin üzerinden devam edildi, tekrar taşıma veya ham veri üstüne yazma yapılmadı. **Kanıt sınırı:** bu yardımcı terminal hatalarının ayrı yayımlanmış logu yok; oturumdan geriye dönük kayıt. [Son dışlama makbuzları ve korunan ham dizinler](../browser/results/a1-memory-fix-2026-10-16/excluded-runs.json) nihai çıktıdır. Native motor/ölçülen yük/sonuçlar bu hatalarla değiştirilmedi.

### DEV-037 — Grafik bağımlılığı ve ham artifact biçimi ürün kodundan ayrılmalıydı

**Tarih:** 16 Ekim; **durum:** araç/depoya alma sorunu giderildi. **Belirti:** sistem/bundled Python’da matplotlib yoktu. Unified patch’in boş context satırları, native terminal çıktısı ve matplotlib SVG koordinatları whitespace kontrolüne takılıyordu. **Değişiklik:** matplotlib yalnız ignore edilmiş çalışma venv’ine kuruldu; ürün Node bağımlılıklarına eklenmedi. [`.gitattributes`](../.gitattributes) yalnız patch, yayımlanmış native ham text ve üretilmiş SVG için biçim istisnası tanımlar; kanıt byte’ları kırpılmadı. **Kanıt:** [grafik üretici](../browser/scripts/plot-memory-fix.py), [matplotlib sürüm kaydı](../browser/results/a1-memory-fix-2026-10-16/plot.txt); `e09fab3`. Bu istisnalar normal uygulama kaynaklarının whitespace kontrolünü kapatmaz.

### DEV-038 — Son konuma taşınan doğrulama receipt’i hash manifestini değiştirebilir

**Tarih:** 16 Ekim; **durum:** yayın sırasında tutarlılık sağlandı. **Risk/belirti:** doğrulayıcı yayımlanan dizinde tekrar çalışınca `verification.json` içindeki zaman ve baseline’a göreli yol değişir; daha önce çıkarılmış hash artık o dosyayı temsil etmez. **Düzeltme:** son yerleştirme ve doğrulamadan sonra evidence manifesti yeniden hesaplandı; 133 dosyanın hash’i, native log/TAP/source snapshot hash’leri ve rapor bağlantıları kontrol edildi. **Kanıt:** [evidence manifesti](../browser/results/a1-memory-fix-2026-10-16/evidence-manifest.json), [son doğrulama](../browser/results/a1-memory-fix-2026-10-16/verification.json); `e09fab3`. **Sürekli kural:** commit edilmiş tarihsel evidence üzerinde yazan aracı çalıştırma; yeni çıktı dizini kullan. Bu düzeltme eski lab/native ham örneklerini değiştirmedi.

## Eski 27 değerlendirme bulgusunun tam indeksi

Kaynak: **2 Ekim tarihli eski v2.0 tasarım değerlendirmesi** [TECHNICAL_REVIEW.md](TECHNICAL_REVIEW.md). Aşağıdakiler o günün risk/önerileridir; bugün yeni ürünün kabul edilmiş özelliği diye okunmaz. Eski kaynak her maddenin karşılığını ve G/K test yolunu korur. Güncel bağlam sütunu yalnız yeni kapsamdaki yerini açıklar; uygulama kapanışı iddia etmez.

| Eski ID | Sorun | Güncel bağlam / durum |
|---|---|---|
| I01 | Karşılaştırmadan özel runtime seçimi | Lab karşılaştırması mevcut; native motor gerekçesi DEV-014/020. Evrensel üstünlük kanıtı değil. |
| I02 | Görev/oracle belirsizliği | Bağımsız verifier ilkesi korunur; A3/A6 ürün kabulü açık. |
| I03 | Gözlem ve input semantiği karışması | DEV-012; rendered/trusted eşdeğerlik iddiası yok. |
| I04 | Node/domain kimliği iş nesnesini garanti etmiyor | A3 stale/entity/commit kontrolleri; kritik write kabulü açık. |
| I05 | 60-session RAM ve kalite farklı koşularda | DEV-004; A7 entegre kapasite kanıtı açık. |
| I06 | Session/execution/delivery karışması | Browser lifecycle A1; koordinasyon A5, Sheets ilk sürüm dışı. |
| I07 | Özel journal ve sınırsız pending/disk | A5/A7 bounded state/recovery; eski outbox tasarımı uygulanmış sayılmaz. |
| I08 | Temelsiz kapsam/takvim | DEV-001/003; faz başına ayrı teslim/kabul. |
| R01 | Ölçülmemiş MB dağılımı | DEV-004/021; kaynak ölçüldü, 60/500 MB açık. |
| R02 | Replay gerçek transport/history maliyetini atlıyor | Lab/ürün kanıtı ayrılır; A6/A7 entegre yol açık. |
| R03 | Native OOM tek session’a sınırlanır varsayımı | DEV-004/017; worker blast radius görünür, OS hard cap açık. |
| R04 | Observation version sayfa yarışını çözmüyor | A1 epoch altyapısı var; A3 action-time/nesne koşulları açık. |
| R05 | CDP lifecycle bakım bedeli eksik | DEV-014/015/020; custom patch ve test sorumluluğu sürer. |
| R06 | Egress/OS güvenliği yalnız niyet | DEV-005; A2 kabulü açık. |
| R07 | Görsel/mixed bellek minimumu belirsiz | Görsel ürün yolu kapsam dışı; eski mixed kabul yeni ürüne aktarılmaz. |
| R08 | Toplam skor kategori hatasını saklıyor | Lab aile/mod ve bütün başarısızlıkları ayrı raporlar; A6 kabulü açık. |
| R09 | Erken RAM final kanıt sanılıyor | DEV-004/031; erken topoloji ≠ nihai kapasite. |
| R10 | Operation/value wrapper anlamsız kombinasyonlar | Typed/capability sözleşmesi ilkesi; kapsamlı A3 action API açık. |
| R11 | Provider SDK/transport seçimi belirsiz | JEV A6’da; diğer provider kapsamı eski planın otomatik zorunluluğu değil. |
| R12 | History trimming provider protokolünü bozabilir | A6 entegrasyon kabulü açık; A1’de model history yok. |
| R13 | Desktop/remote OAuth karışıyor | Yeni private input A4, persistence A5; gerçek OAuth kanıtı yok. |
| R14 | Vault/token expiry belirsiz | DEV-006; A4/A5 key/expiry testleri açık. |
| R15 | Sheets cevabı sonrası local mapping kaybı | Sheets ilk ürün kapsamı dışı; eski outbox önerisi korunur. |
| R16 | Sheets batch/kota/RAW eksik | İlk ürün kapsamı dışı; kaynak öneri tarihsel. |
| R17 | İnsan düzenlemesiyle fixed-row yarışı | Sheets kapsamı dışı; insan browser kontrolü eklenmez. |
| R18 | Job SLA/soak/model bekleme süreleri tutarsız | Faz/test süreleri ayrı; native soak model E2E SLA’sı değildir. |
| R19 | MVP, DOM/AX ve finish belirsizliği | DEV-001/003/007/012; güncel B/T sözleşmesi, henüz tümü uygulanmadı. |

## Açık işlerin kısa indeksi

- **DEV-011/012:** dört canlı başarısızlık, zengin DOM/frame gözlemi ve uyumluluk A3/A6’da.
- **DEV-005/006/017:** agent yetki/egress/OS sınırı A2; private input A4; kalıcılık/lease/vault/recovery A5. Gerçek hesaplar için kabul yok.
- **DEV-023/027/031:** yük altında adalet, allocation/GC görünürlüğü ve küçük native footprint artışı araştırılacak.
- **DEV-004/021/031:** 60 aktif profil / 500 MB, Linux cgroup ve günlerce dayanıklılık A7’de açık. Bu indeks yeni faza otomatik başlama talimatı değildir.

## Yeni kayıt şablonu

```markdown
### DEV-NNN — Kısa sorun/karar adı

**Tarih/faz:** ...; **durum:** açık / karar alındı / düzeltildi / sınır.
**Belirti ve etki:** ...
**Neden ve kanıt düzeyi:** doğrulandı / aday / henüz bilinmiyor; repro/iz ...
**Değişiklik ve gerekçe:** önce → sonra; reddedilen seçenek ve nedeni ...
**Doğrulama:** test/ölçüm, sürüm ve kapsam; FAIL/NOT_RUN/UNSUPPORTED dahil ...
**Teslim:** commit veya aynı commit'in Git dosya geçmişi; güvenli kanıt bağlantısı ...
**Kalan iş / takip:** ...
**Tarihli takip:** kapanış/yeniden açılma veya kayıt düzeltmesi; eski iddiayı gizleme ...
```
