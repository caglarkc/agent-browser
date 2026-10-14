# Kabul, karşılaştırma ve ölçüm protokolü

Sürüm: 2.0. Tarih: 2 Ekim 2026. [MVP planının](MVP_PLAN.md) normatif eki. Aşağıdaki sayısal eşikler ürün tasarım kararıdır; vendor garantisi veya ölçülmüş sonuç değildir. Bütün koşuların bugünkü durumu **NOT_RUN**.

## 1. Corpus ve koşu manifesti

Başlangıç eval corpus'u **20 görevdir**: 16 yapısal (S01–S16) + 4 görsel (V01–V04). Yapısal dağılım: 8 kayıt okuma/navigasyon, 4 dinamik SPA/iframe/shadow DOM okuma ve 4 doğrulanabilir test formu. Görseller gerçek canvas/screenshot/koordinat gerektirir. Auth isolation, staleness, adversarial mutation ve chaos ayrıca K testleridir; canlı başarı paydasına yapay kolay görev olarak eklenmez.

Her görev için şablon/hash, fixture seed, giriş, beklenen entity/değerler, bağımsız verifier, required capability, motor profili, yan etki sınıfı, modelden saklı ground truth, başlangıç/reset adımları ve resource sınırları bulunur. Bir görev beş farklı wording ile çoğaltılıp beş bağımsız iş sayılmaz.

Gerçek saha listesi en az **5 akış / 3 domain** içerir: domain/hesap sahibi, izin, akışın amaç ve son durumu, read/write sınıfı, doğrulama yöntemi, güvenli test verisi, gerekli render ve sürüm tarihi. Aynı şirketin üç hostname'i anlamlı çeşitlilik yoksa üç bağımsız saha örneği sayılmaz. Gerçek site girdisi gelene kadar dosyalar UNSET durumundadır; hayali müşteriler/domain'ler yazılmaz. Bu durum G0 ürün geçişini ve G3 saha kabulünü engeller, fixture araştırmasını engellemez.

P0 bitiminde, ürün geliştirmesine geçmeden önce corpus, adaylar ve kriterler sürümlenir. P0 keşfi sırasında yapılan değişiklikler kaydedilir; G0 manifestinden sonra kriter/dataset değişirse yeni manifest ve ilgili karşılaştırmaların yeniden koşulması gerekir. Sonuç görülüp zor görev sessizce çıkarılamaz.

Zorunlu run manifest alanları:

- Kaynak commit'i, controller/backend/engine/driver/SDK/SQLite/kernel sürümleri ve artifact SHA256; varsa lisans notu.
- Corpus/template/verifier/policy/prompt/schema hash'leri; model snapshot veya alias sınırlaması; provider API konfigürasyonu.
- CPU/vCPU/arch, host RAM, cgroup ve swap ayarları; bütün süreç ağacı; cold/warm cache durumu.
- Oturum topolojisi, motor dağılımı, restart sınırı, bütün kuyruk/body/history/disk/maliyet limitleri ve retry sahibi.
- Workload zaman çizelgesi, görev dağılımı/seed, sağlayıcı concurrency/quota, gerçek test harcama tavanı.
- Başlangıç/bitiş ve drain sınırları, ham JSON/CSV yolları; offered/accepted/rejected/verified/delivered/late/unknown adetleri.

Eksik zorunlu manifest ile performans PASS verilmez. Kanıtlar secret içermeyen metadata ve gerekli redacted içeriktir; hassas ham içerik rapora kopyalanmaz.

## 2. Karşılaştırma deneyi ve G0

MVP §3 adayları aynı Linux ve izolasyon koşullarında değerlendirilir. Önce tek oturumda görev semantiği ve policy conformance; sonra uygun adaylarda 1/10/30/60 oturum aynı corpus ile en az 3 kısa bağımsız ölçüm. Adayların sırası değiştirilir; cache durumu tutarlıdır. Farklı model/prompt kullanılan yerleşik agent sonuçları ayrı ürün karşılaştırmasıdır.

Rapor; correctness, peak memory, throughput, p95, başarı başına model maliyeti, startup, cold/warm farkı, dependency sayısı ve bakım gereksinimi içerir. Hızlanma oranı yalnız eşdeğer doğruluk ve aynı semantikte hesaplanır. Destek verilemeyen aday için hangi zorunlu testin neden başarısız olduğu saklanır. Güvenlik/lisans başarısızlığı daha düşük bellekle telafi edilemez.

P0 erken 60-session ölçümü en az 15 dakika; başlangıç ve bir kontrollü worker replacement tepesini de içerir. G0 headroom hesabı:

`ölçülen seçilmiş-runtime tepe + henüz eklenmemiş bileşenlerin muhafazakâr ölçüm-tabanlı payı + ölçüme dahil olmayan eşzamanlı tepe payı ≤500.000.000 byte`.

Aynı bileşen iki kez sayılmaz; eksik bileşen sıfır yazılamaz. SQLite, SDK/history, verifier, egress ve outbox için temsilî spike gerekir; ölçülmemiş kalan pay varsa G0 headroom NOT_RUN kalır. Sınırı geçen sonuç G0 teknik FAIL'dir; bu hesap sınırı geçti diye hedef sessizce yükseltilmez. Hesabın geçmesi G2 kanıtı değildir.

G0 raporu seçilmiş backend, reuse/custom gerekçesi, capability manifesti, güvenlik/lisans sonucu, gerçek site uygunluğu, API bütçe/erişim, headroom ve sonraki paketlerin yeni tahminini içerir. Özel driver seçimi için mevcut çözümlerin somut karşı örneği ve sahiplenilecek protokol yüzeyi gerekir.

## 3. Aynı koşuda ortak kabul hesabı

### 3.1 Zaman ve payda

60 slotun her birinde bir resident browser session ve bağımsız iş döngüsü vardır. Slot, işin normal sonlanması veya 180 saniye başarı deadline'ından sonra yeni iş teklif eder; dış etkisi hâlâ belirsiz oturum güvenli hale gelmeden yeniden kullanılmaz. Güvenli hale gelme beklemesi hız/ilerleme metriklerinde görünür; session unload ile RAM azaltılmaz. Sağlıklı soak'ta resident sayı 60'ın altına düşerse FAIL.

Yapısal slotlarda S01–S16 görevleri önceden belirlenmiş dengeli sırayla döner; mixed profilin Chromium görsel slotlarında V01–V04 aynı yöntemle döner. Kolay görev erken bitince sürekli aynı kolay görev tekrarlanmaz. Oturum oluşturma ve startup belleği ölçüme dahildir. A profillerinde ana iş teklif penceresi 60 dakika, B-mixed'de 15 dakikadır. Son 180 saniyede teklif edilen işler en çok 180 saniyelik ek drain'de sonlanabilir; drain de belleğe ve olay kaydına dahildir. Yeni iş drain'de teklif edilmez.

Her geçerli workload teklifi paydadadır: kabul reddi, timeout, unsupported, provider limiti, doğrulama hatası, retry tükenmesi, unknown ve teslim gecikmesi başarısızlıktır. İstemcinin açıkça bozuk isteklerini sınayan negatif K testleri normal workload paydasına katılmaz. Bir yeniden deneme aynı işin ek denemesidir; yeni başarı sayılmaz. Fallback'in maliyet/süresi başlangıç işine dahildir.

Başarı, geçerli teklifin controller'a ulaştığı t0'dan itibaren ≤180 saniyede `EXECUTION_VERIFIED` ve gerekli teslimin `DELIVERY_VERIFIED` olmasıdır. t0 admission kararından önce controller'ın monotonik saatiyle atanır; istemcinin bildirdiği zaman kabul edilmez. Harness'in planladığı teklif ile t0 arasındaki gecikme de ayrıca raporlanır; harness gecikmesiyle yük düşürülemez. Admission beklemesi bütçeye dahildir; sağlıklı kapalı döngü yükünde saklı kuyruk yoktur. Admission/işlem/doğrulama alt bütçesi 150 saniye; kalan süre teslim içindir. Geç doğrulanmış sonuç gerçek audit'te korunur ama o koşuda başarısız sayılır.

`S = zamanında tamamlanan benzersiz iş / geçerli teklif edilen iş`.

`Q = teklif penceresi içindeki zamanında tamamlanan benzersiz iş / pencere dakikası`.

Throughput için drain'deki tamamlanmalar 60 dakikalık pencereye geri yazılmaz. Başarı oranının paydasındaki son işler ise drain sonunda değerlendirilir. Bu iki pencere açıkça etiketlenir; kısa job sayısıyla saatlik performans extrapolation'ı yapılmaz.

Cezalı gecikme serisinde her başarısız/reddedilmiş/geç iş **180 saniye** alır; başarılı iş gerçek uçtan uca süresini alır. Bu serinin p95'i kabulde kullanılır. Başarılı işler arasındaki p95 ayrıca raporlanır ama kabulün yerine geçmez. Böylece erken hata vererek düşük latency gösterilemez. Cezalı p95 ≤150 saniye şartı, pratikte ≥%90 başarı alt sınırından daha sıkıdır; koşulların hepsi birlikte geçmelidir.

### 3.2 Canlı birleşik eşikler

| Metrik | A-live için zorunlu koşul |
|---|---|
| Resident oturum | Bütün sağlıklı ana koşu boyunca 60; 60 bağımsız iş döngüsü |
| Toplam bellek | Startup, ana pencere, drain dahil memory.peak ≤500.000.000 byte; swap yok |
| Görev başarısı | Her sağlayıcı için S ≥%90; her görev ailesi ayrıca ≥%90; yanlış başarı sıfır |
| Hız | Q ≥18 doğrulanmış ve teslim edilmiş iş/dakika |
| Gecikme | Cezalı uçtan uca p95 ≤150 saniye; hiçbir >180 saniye iş başarı sayılmaz |
| Araç yürütme | Desteklenen normal işlerde runtime action başarısı ≥%99,5; görev başarısının yerine geçmez |
| İşlem doğruluğu | Yetkisiz/yanlış nesneli/tekrarlı dış commit sıfır; tek olay tüm koşuyu FAIL yapar |
| Crash/kaynak | Sağlıklı koşuda beklenmeyen crash/OOM yok; beklenen fault-injection ayrı profildir |
| Adalet | Her session her kayan 10 dakikada ≥1 zamanında başarı; bir slotu aç bırakmak yok |
| Teslim | Başarıya sayılan her iş Sheets readback ile doğrulanmış; drain sonunda pending/unknown sıfır |

18/dakika, 60 oturum ve 180 saniye çerçevesine bağlı ilk ürün hedefidir; provider ölçümünden türetilmiş gerçek hız değildir. Provider quota/SLA bu yükü karşılamıyorsa hedef kanıtlanmaz. Eşik değişikliği ürün kararı ve yeni manifest ister; koşu sonrası esnetme yoktur.

Kuyruk high-water mark, pending yaş p50/p95/max ve ilk/son 20 dakikalık birikme eğimi raporlanır. Araç retry'leri ham deneme/hata ve nihai iş sonucu olarak ayrı gösterilir; hatalı ilk denemeler istatistikten silinmez.

## 4. Kabul profilleri

| Profil | Yük / tekrar | Geçme koşulu ve iddia |
|---|---|---|
| A-runtime | 60 resident session, 60 dakika ×3 bağımsız koşu + drain; 16 yapısal görev | Üretim controller/SDK/HTTP/verifier/store/outbox yolları; replay provider/Sheets; peak ≤500 MB; S ≥%99; Q ≥18/dakika; cezalı p95 ≤150 s; her session ≤10 s'de anlamlı browser ilerlemesi; yanlış commit/başarı sıfır |
| A-live-OpenAI | Aynı corpus/60 slot, 60 dakika ×1 + drain | Gerçek model ve Sheets; §3.2 koşullarının hepsi aynı koşuda |
| A-live-Anthropic | Aynı corpus/60 slot, 60 dakika ×1 + drain | Gerçek model ve Sheets; §3.2 koşullarının hepsi aynı koşuda |
| B-visual | 1 ve 2 Chromium session; V01–V04 ×3 tekrar/provider | Deterministik driver/verifier K3 %100; canlı görevlerde her görev ≥2/3 ve toplam ≥%90; gerçek görüntü/koordinat kanıtı; kaynak raporu |
| B-mixed | 59 yapısal +1 Chromium, 58+2; her biri 15 dakika/provider + drain | Toplam 60 slot; aynı S/Q/p95/yan etki koşulları, her motor grubunda S ≥%90; toplam bellek ölçülür. >500 MB = mixed bellek hedefi FAIL |
| C-real | En az 5 izinli akış /3 domain ×3 tekrar/provider | Her akış ≥2/3, toplam ≥%90; yanlış başarı/yan etki sıfır; hedef site/sürüm sınırlı destek raporu |
| D-chaos | 60 slot altında tanımlı crash/disk/network/kota/cancel enjeksiyonu | K7/K10/K11/K14/K15; etkilenen iş doğru durumda, sağ kalanlar ilerler; recovery tepe belleği ≤500 MB yapısal profilde |

B-visual'daki deterministik %100, modelin %100 doğru olacağı iddiası değildir. B-visual kapasite raporu bütçeyi aşarsa görsel sınıfın sınırı açık kalır; B-mixed başarısı olmadan karışık işler için 500 MB iddiası yoktur. G3 raporu yapısal/görsel/mixed kapıları ayrı gösterir; mixed FAIL genel hedefin sağlandığına çevrilemez.

Replay yanıtları gerçek boyutlu gözlem/image/history ve üretim transport'tan gelir; doğrudan executor'a mock sonuç enjekte edilmez. Gecikme/stream/chunk dağılımı manifesttedir. 10 saniye ilerleme şartı için normal replay gecikmeleri buna uygun önceden sabitlenir; 429 ve uzun beklemeler D-chaos'tadır. No-op observe, timer heartbeat veya aynı değişmeyen ekranı okumak anlamlı görev ilerlemesi sayılmaz; verifier'ın tanımladığı iş adımı gerekir.

A-live'da 10 saniye browser adımı zorlanmaz; model bekleyebilir, fakat iş/süre/adillik eşikleri geçerlidir. Hesap erişimi/bütçesi koşu başlamadan yoksa BLOCKED_EXTERNAL. Başlayan koşuda kota/timeouts oluşursa sonuçlar silinmez, o koşu FAIL olarak korunur; yeni yeterli kota ile ayrı koşu yapılabilir.

İki sağlayıcının birer saatlik canlı testi release doğrulamasıdır; istatistiksel uptime/SLA garantisi değildir. T14-eval = 20 görev ×3/provider; her sağlayıcı ≥%90 ve her görev ≥2/3. 60 tekrar 60 bağımsız görev sayılmaz; görev düzeyinde gruplanmış belirsizlik ve örnek sayıları raporlanır. T14 ve yük testlerinin ikisi de gerekir.

## 5. Bellek ölçümü, leak ve overload

Birincil metrikler cgroup `memory.current`, `memory.peak`, `memory.events`, swap; yardımcı metrikler PSS/RSS, JS heap, Go kullanılıyorsa heap/GC, CPU, FD, child process sayısıdır. Cgroup koşu öncesi yeniden oluşturulur; ısınma sonrasında peak silinmez. İlk keşif sınırsız, kabul 500.000.000 byte hard cap ile; hard cap tek başına başarı değildir.

Go GOMEMLIMIT bütün ürünü sınırlamaz. Shared backend/engine memory, proxy, SQLite page cache/WAL, provider history, response/screenshot tamponları ve bütün child süreçler sayılır. Fixture ve load harness dışında hiçbir üretim işi dışarı taşınmaz. Motor binary/cache'inin harici süreçlerce önceden yüklenmesi ve cgroup page accounting etkisi manifestte açıklanır; farklı başlangıçlar eşitmiş gibi karşılaştırılmaz.

Startup dışında ilk 10 dakika ısınma sayılır; 10–30 ve 40–60 dakika ortalama memory.current farkı ≤max(%5, 10.000.000 byte). Bu test sonsuz süre leak olmadığını kanıtlamaz. 1.000 create/close churn sonrası süreç/fd sayıları başlangıca dönmeli; settle süresi manifestte sabit (varsayılan 60 saniye), bellek farkı aynı tolerans içinde olmalıdır. Sürekli artış eğimi kalırsa eşik içinde olsa da leak incelemesi kapanmadan PASS verilmez.

Read/observe p95 ≤250 ms, yerel action p95 ≤500 ms; network/model süreleri ayrıca kaydedilir. Bu yerel hedefler uçtan uca ölçümün yerine geçmez. Session soft quota, worker hard limit ve aggregate limit farklıdır. Native OOM bütün shard'ı etkileyebilir; etkilenen tüm işler görünür state almalıdır.

Overload'da admission kontrollü reddeder; kabul edilmiş rezervasyonları korur. Normal benchmarkta geçerli iş reddi başarısızlık sayılır. D-chaos overload testinde beklenen reddin kendisi hata değildir; yanlış kabul/kayıp sonuç hatadır. Worker replacement eşiği, aynı anda izin verilen restart sayısı ve replacement overlap bellek tepesine dahildir.

## 6. Zorunlu test matrisi

K1–K17 isimleri normatiftir. Her testin raporunda test kodu/fixture sürümü, beklenen/gerçek çıktı, çalıştırma komutu ve durum bulunur. Tablo testlerin bugün yapıldığı anlamına gelmez.

| ID | Senaryo | Kabul / engellediği hata |
|---|---|---|
| K1 | Task/tool schema, immutable contract, budget ve HTTP idempotency | Bilinmeyen alan ve değişen hash reddi; aynı istekte tek job; eksik yetkide dispatch yok |
| K2 | Her backend/profil için nav/ref/action/frame/cancel conformance | Supported/unsupported/no-op ayrımı; modal/hidden/disabled/iframe/shadow DOM; aynı profile eşdeğer davranış |
| K3 | Screenshot/canvas/koordinat | Gerçek görüntü; crop/scale/viewport/scroll/frame/staleness; deterministik beklenen hedef %100 |
| K4 | Observe-action yarışı ve entity reuse | Aynı node/role/name ile farklı record; form action/value/version değişimi; yanlış commit sıfır |
| K5 | Policy ve prompt injection | İzinli domainde yanlış kayıt/değer, autosave/Enter, kaynakta sahte talimat; yetkisiz yan etki/secret erişimi sıfır |
| K6 | Verifier yanlış-pozitif suite | Sahte toast, kısmi alan, eski receipt, yanlış iş korelasyonu, Sheet'e yanlış sonucu doğru teslim; yanlış PASS sıfır |
| K7 | Üç durum makinesi, cancel/resume ve geç yanıt | Önceki generation yeni işi etkileyemez; gönderilmiş eylem iptalle geri alınmış sayılmaz; tek session lease |
| K8 | İki provider protokolü ve history sınırı | Call id/image/strict/multi-call/yarım stream/429/cancel; bozuk geçmiş veya izinsiz dispatch yok |
| K9 | Google OAuth/vault | PKCE/state/callback/secret izinleri/import/refresh/revoke/expiry; mock/canlı/8.gün ayrı; plaintext sızıntısı yok |
| K10 | SQLite, outbox, Sheets recovery | Her intent/commit/send/ACK sınırında kill; unique key, row hash/gerçek hücre readback; kör append/çift submit yok |
| K11 | Uzun Google kesintisi, disk/WAL büyümesi ve kota | Pending + rezervasyon sınırları; admission kapanır; accepted sonuç korunur; disk-full'de mutasyon durur |
| K12 | 60-session veri, host ve ağ izolasyonu | Cookie/storage/ref/provider-state karışması sıfır; DNS rebinding/redirect/private IP/IPv6/fetch/ws/direct bypass; diğer session/controller/CDP/secret erişimi sıfır |
| K13 | 1/10/30/60 yük ve birleşik kabul | A-runtime/live aynı koşuda RAM/S/Q/p95/teslim/adillik; tek-session eval sonucu yerine geçmez |
| K14 | 1.000 churn, worker/shard crash ve replacement | Süreç/fd temizliği, bounded bellek; sadece belgeli izolasyon birimi etkilenir; sağ kalanlar ilerler |
| K15 | Browser başarısı + Sheets timeout, operator retry | Web yürütmesi VERIFIED kalır; yalnız aynı sonuç teslimi tekrar edilir; deadline geçmişi korunur |
| K16 | Temiz Linux kurulum, migration/backup/restore/upgrade | Pinlenmiş artifacts; consistent WAL backup; secret ayrılığı; yeniden üretilebilir ölçüm ve rollback |
| K17 | 20 görev eval + gerçek site canary | Provider/engine/görev ailesi skorları; T14-eval ve C-real eşikleri; false PASS/yanlış commit sıfır |

Crash ile güç kaybı farklı deneylerdir. K10 process-kill suite bütün adaylarda; kalıcı kabul garantisi için referans dosya sisteminde VM power-off veya eşdeğer fault-injection durability testi gerekir. Altyapı yoksa durability alt testi NOT_RUN ve ilgili release kapısı açık kalır. OS güvenlik testi host kernel açıklarının yokluğunu kanıtlamaz; test edilen tehdit kapsamı yazılır.

K12'de yalnız üst URL filtresi veya cookie ayrılığı yeterli değildir. Proxy'nin HTTPS path/body görmediği durumda gerekli app-layer kontroller ayrıca kanıtlanır. Backend'in tehlikeli yardımcı araçları kapatılamıyorsa aday elenir. Negatif testler gerçek kullanıcı hesabına veya izinsiz hedefe saldırı yapmaz; kontrollü fixture ağında yürütülür.

## 7. Raporlama ve karar

Her raporda sonuç: PASS, FAIL, NOT_RUN veya BLOCKED_EXTERNAL. Reuse kararı, gerçek site desteği, yapısal kapasite, görsel/mixed kapasite ve dış hesap uygunluğu ayrı satırlardır. Başka profilin PASS sonucu eksik satırı doldurmaz.

Tüm testler geçtiğinde bile iddia yalnız pinlenmiş sürüm/corpus/ortam içindir. Yeni site, yeni model alias'ı, yeni SDK/engine sürümü, değişen güvenlik veya limit ayarı ilgili conformance ve ölçümün yenilenmesini gerektirir. Gerçek site drift'i destek matrisinde tarih/sürümle izlenir; başarısız site otomatik olarak destekli kalmaz.

G0 kapısında gereken rapor dosyaları uygulama aşamasında üretilecek: `manifest.json`, `capabilities.json`, `candidate-comparison.csv`, `headroom.json`, `raw-metrics.jsonl`, `failures.md`, `decision.md`. Bunlar mevcut teslimde ölçüm yapılmış gibi oluşturulmaz. G2 aynı yapıya profil/sağlayıcı bazında koşu ve birleşik kabul sonuçlarını ekler.
