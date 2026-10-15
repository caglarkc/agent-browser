# Lightpanda tabanlı kendi görselsiz tarayıcımızı oluşturma planı

Güncelleme: 15 Ekim 2026. Durum: uygulama planı.

Amaç, Lightpanda motorunu kullanan kendi tarayıcımızı oluşturmak: kendi süreç ve oturum yönetimi, sekmeleri, gezinme geçmişi, DOM gözlem modeli, etkileşim API’si, hata davranışları ve kurulabilir paketi. Tarayıcı ekran görüntüsü, OCR veya grafik arayüz gerektirmeden çalışacak. JEV bu tarayıcıyı kullanabilen karar katmanı olacak; tarayıcının temel işlevleri model olmadan da çağrılabilecek.

Bu plan mevcut benchmark laboratuvarından çalışan tarayıcı ürününe geçişi tanımlar. Güncel ürün kapsamı ve öncelikler [tarayıcı özellikleri ve erişim gereksinimleri](BROWSER_REQUIREMENTS.md) belgesindedir: agent profil/sekme modeli, site/agent yetkileri ve ağ engeli, DOM gözlemi/etkileşim, hassas veri giriş eklentisi, hesap kalıcılığı ve çoklu agent koordinasyonu, ardından canlı site uyumluluğu ve kapasite. İnsan sayfa görüntülemez, gezinmez veya tab kontrolünü devralmaz. İnsanla tek bağlantı agent’ın gerektiğinde istediği hassas verinin eklenti üzerinden verilmesidir. Aşağıdaki aşamalar bu gereksinimlerle birlikte uygulanır; JEV entegrasyonu tarayıcı yeteneklerinin önüne geçmez.

## 1. Ürün kapsamı ve mevcut belgeler

Lightpanda başlangıç motorudur. HTML, JavaScript, DOM ve ağ işlerini motor yürütür; biz tarayıcının kontrolünü ve agent’a sunduğu davranışı geliştiririz. İlk ürün motoru ayrı süreçte başlatabilir; çalışır bir ürün için motoru hemen kütüphane olarak gömmek gerekmez. Dağıtım tek kurulum ve tek başlatma komutu sağlar, alttaki süreçleri tarayıcı yönetir.

İlk sürümün kapsamı:

- CLI ve localhost API üzerinden tarayıcı, oturum ve sekme oluşturma/kapatma.
- Adres açma, yönlendirme takibi, yeniden yükleme, geri/ileri gezinme ve geçerli adresi okuma.
- DOM üzerinden metin ve kontrol okuma, kontrol bulma, tıklama, alan doldurma ve seçenek seçme.
- Sayfanın ve hedef kontrolün hazır oluşunu bekleme; eskiyen hedefi anlaşılır bir hata ile reddetme.
- Oturum içindeki cookie/storage sürekliliği ve oturumlar arası ayrılığın motor desteğine göre doğrulanması.
- Agent’ın gerektiğinde çağırdığı hassas girdi eklentisi: insan yalnız seçili veriyi girer; browser doğrulanmış hedef alana uygular; değer modele ve loglara gitmez. Talep bekleyen tab kilitlenir, diğer tab’lar çalışır. Ayrıntılı sözleşme B13/B14/B23 ve gereksinimler §9’dadır.
- JEV ile hedef yürütme ve modelden bağımsız sonuç doğrulama.
- Lightpanda olmadan veya gizlice Chrome başlatarak başarılı gösterilemeyen kurulum ve testler.

Canvas/harita görüntüsü yorumlama, screenshot/OCR, Chromium’a otomatik geçiş, insan kontrol paneli, insanın sayfa/sekme görüntülemesi veya gezinmesi, genel eklenti sistemi, Google Sheets teslimi ve genel internetin bütün sitelerinde uyumluluk ilk sürüme dahil değildir. Dar hassas veri giriş eklentisi ürün kapsamındadır. OSM hedefleri harita yorumlama değil nesne detay/geçmiş gezinmesidir. Görselsiz DOM etkileşimi gerçek kullanıcı girdisinin bütün özelliklerini, özellikle `isTrusted` koşulunu, kendiliğinden sağlamaz.

Bu hedef ve teslim sırası için **bu belge güncel uygulama planıdır**. [Eski MVP planı](MVP_PLAN.md), [eski kabul protokolü](ACCEPTANCE.md), [teknik değerlendirme](TECHNICAL_REVIEW.md) ve [araştırma](research/RESEARCH.md) tarihsel karar desteği olarak korunur. Eski plandaki iki görsel motor, iki LLM sağlayıcısı ve Sheets kapsamı bu ilk sürümün zorunlu kabulü değildir. [Görev sözleşmelerindeki](TASK_CONTRACTS.md) bağımsız doğrulama, eskiyen hedef, iptal ve belirsiz işlemi kör tekrar etmeme ilkeleri yeni tarayıcıya uyarlanır; eski G/K kabul eşikleri bu ürünün otomatik kabul koşulu değildir.

## 2. Testlerden alınan başlangıç kanıtı

| Kanıt | Sonuç | Plan üzerindeki etkisi |
|---|---|---|
| Son canlı adapter v2 turu | Lightpanda 10/14, Chromium DOM 12/14, OCR 10/14 | Başlangıç hedef listesi 14 senaryo; dört Lightpanda başarısızlığı ayrı takip edilir |
| Önceki adapter v1 turu | Lightpanda 21/28; GitHub 3/4 | GitHub’ın sürekli motor uyumsuzluğu olduğu sonucu çıkarılmaz; geçiş/zamanlama değişkenliği araştırılır |
| Yerel core görevler, bağımsız doğrulayıcı | Lightpanda 90/90 | Şema, kayıt bağlamı ve gerçek sonuç doğrulaması korunur |
| Sınır görevleri | Pinlenmiş Lightpanda/driver’da iframe ve trusted input başarısız; canvas destek dışı | Capability listesi ve açık destek hataları gerekir |
| 14 Ekim yerel test çalıştırması | Mevcut `npm test` 10/10 | Başlangıç regresyon takımı; yeni ürünün kabulü yerine geçmez |

Canlı v2 ölçümünde üç yolun birlikte başarılı olduğu dokuz hedefte Lightpanda medyan görev süresi 2,96 saniye ve toplam yerel tepe footprint medyanı 83,79 MiB. Bunlar kaynak avantajını araştırmak için başlangıçtır; dört başarısız görevin maliyetini veya çok oturumlu ürün kapasitesini temsil etmez. 60 oturum / 500 MB hedefi için A1’de erken topoloji ölçümü, A7’de aynı ürün yolunda nihai kapasite kabulü yapılır.

Kaynaklar: [canlı v2 raporu](../lab/LIVE_RESULTS.md), [canlı v1 raporu](../lab/LIVE_BASELINE_RESULTS.md), [JEV deneyleri](../lab/JEV_RESULTS.md), [performans raporu](../lab/PERFORMANCE_RESULTS.md), [v2 ham sonuçları](../benchmarks/results/live-2026-10-13T15-52-00-491Z/results.json) ve [karar izleri](../benchmarks/results/live-2026-10-13T15-52-00-491Z/trace.jsonl).

## 3. Tarayıcı mimarisi

```text
Kendi CLI ve localhost API’miz
          |
Agent kimliği ve policy gateway
          |
Tarayıcı host’u: worker, profil, sekme, lease ve iptal
          |
OS izolasyonu ve özel relay üzerinden CDP adaptörü
          |
Lightpanda motoru: HTML, JavaScript ve DOM
          |
Zorunlu egress proxy/filter -> izinli site

Sekme -> yapısal gözlem -> etkileşim API’si
                  |
          İsteğe bağlı JEV görev döngüsü
                  |
          Bağımsız sonuç doğrulayıcı
```

İlk uygulama Node.js ESM ile başlar; mevcut Puppeteer Core bağlantısı yeniden kullanılır. Bu seçim mevcut deneyle ürün arasındaki değişken sayısını azaltır. Puppeteer motor bağlantısı için iç bağımlılık olur; ürün kullanıcısı onun API’sini bilmek zorunda kalmaz. Go/Rust’a geçiş veya yeni bir CDP istemcisi ancak ölçülen kaynak, dağıtım ya da protokol sorunu gerektirirse ayrı kararla yapılır.

Mevcut `lab/` benchmark ve eski kaynak snapshot’ları korunur. Ürün kodu ayrı `browser/` dizininde geliştirilir. Laboratuvarın yeni karşılaştırmaları ürünün gerçek API’sini kullanır; üründen bağımsız ikinci bir canlı-site tıklama sürücüsü tutulmaz.

| Modül | Sorumluluk |
|---|---|
| `host` | Worker/profil topolojisi, lifecycle, lease/generation, cancellation ve kaynak admission |
| `identity-policy` | Agent başına token, scope/grant, revoke, login intent ve deny kararları |
| `isolation-egress` | OS worker/relay/CDP sınırı, zorunlu proxy, DNS/IP/redirect ve protokol engeli |
| `credentials-store` | Ephemeral secret, credentialRef, OS anahtarı, şifreli profil ve atomik restore |
| `engine` | Sınırlandırılmış Puppeteer/CDP erişimi ve capability tespiti |
| `navigation` | Adres, document/frame değişimleri, yönlendirmeler, history ve hazır oluş |
| `observation` | Kontrol kimliği, adı, rolü, durumu, nesne bağlamı, bölge ve gözlenmiş bağlantı |
| `actions` | Kontrollü navigate/click/fill/select/wait; işlem öncesi doğrulama |
| `private-input` | Agent’ın hassas girdi talebi, eklenti cevap kanalı, hedef doğrulama, secret yerleştirme ve maskeleme |
| `agent` | JEV adaptörü, karar bütçesi, ilerleme takibi ve eylem geçmişi |
| `verification` | Hedef sonucu modelden bağımsız doğrulama; PASS/FAIL/UNKNOWN |
| `cli` ve `api` | Aynı tarayıcı sözleşmesini dışarıya sunma |
| `telemetry` | Olay izi, aşama süreleri, hatalar ve süreç belleği |

Tarayıcı yaşam döngüsü `start/stop`, profil/oturum `create/close`, sekme `new/close` olarak ayrılır. İlk topoloji profil başına ayrı worker ve profil içinde çoklu tab’dır; farklı credential principal veya etkin erişim/ağ politikası engine paylaşamaz. Aynı profili iki worker değiştiremez. Uyumsuz politikaya sahip agent’a mevcut profil grant’i reddedilir; ayrı provision edilmiş profil gerekir, cookie’ler otomatik kopyalanmaz. A1 bu seçimin erken bellek/çökme ölçümünü ve ADR’sini teslim eder. A2 OS/egress güvenlik sınırını, A5 kalıcılık ve çok-agent koordinasyonunu tamamlar; A7 kapasiteyi ölçer.

## 4. Ortak gözlem ve etkileşim sözleşmesi

Her gözlem `sessionId`, `tabId`, `frameId`, `documentEpoch`, `observationVersion`, adres, yükleme durumu ve capability bilgisi taşır. Kontrol ref’i dizideki sıra numarası yerine belge/frame ve aynı DOM düğümüne bağlı kimlik kullanır. Kontrolün adı, rolü, değeri, disabled/selected/checked durumu, gözlenmiş hedef adresi ve bulunduğu anlamlı bölge birlikte kaydedilir.

Kontroller navigation, main, sidebar, dialog, form ve kayıt bölgelerine ayrılır. Ana görev bölgesi önce sunulur; tam kontrol listesi arama ve cursor ile erişilebilir kalır. DOM arama, gözlenmiş ad/rol/metin/adres üzerinde yapılır. Modelin bütün sayfayı 65’lik listeler halinde sırayla taraması tek erişim yöntemi olmaz. Büyük revision/tablo listelerinde özet ve ayrıntı erişimi ayrılır; atlanan veri miktarı açıkça bildirilir.

`click` öncesi belge/frame, düğüm bağlantısı, kontrol adı/rolü, beklenen adres ve gerekli durum yeniden kontrol edilir. Hedef eskidiyse `STALE_TARGET` döner ve yeni gözlem alınır. Başarılı olarak gönderilmiş veya sonucu belirsiz bir tıklama otomatik tekrar edilmez. Güvenle yeniden gözlem alma ile yan etkili işlemi tekrar etme ayrı davranışlardır.

Gezinme sonrası yalnız sabit 450 ms bekleme kullanılmaz. Adres/document değişimi, uygulama bölgesi değişimi ve hedef kontrolün hazır oluşu sınırlı koşullarla takip edilir. Aynı adres içindeki AJAX/SPA geçişleri de dikkate alınır. Hazır oluşun sağlanamadığı durumda timeout ve son durum raporlanır; sürekli ağ trafiği bulunan sitelerde yalnız network-idle beklemek yeterli kabul edilmez.

Eylemler `navigate`, `observe`, `find`, `click`, `fill`, `select`, `wait`, `back`, `forward`, `reload` olarak açık anlam taşır. Model keyfi JavaScript veya shell çalıştıramaz. Gerçek DOM linkinden okunmuş adres için açık navigate eylemi kullanılabilir; bunun kullanıcı tıklamasıyla aynı olay semantiği olmadığı kaydedilir. Görev gerçekten click gerektiriyorsa navigate ile sessizce değiştirilmez.

Gateway, agent başına ayrı token ve scope/grant, Origin/Host kontrolü, sınırlı body/süre ile çalışır. A2, özel worker namespace’i ve erişimi kısıtlı relay socket’iyle CDP’yi agent’tan ayırır; localhost binding tek başına güvenlik kanıtı değildir. API/model secret’ları motor sürecine aktarılmaz. Her tab’da eylemler sıralanır; görev iptalinde generation geçersiz kılınır ve eski karar yeni eylem başlatamaz. Ağ politikası bütün browser çıkışına uygulanır; Puppeteer interception tek güvenlik sınırı değildir. İlk canlı destek görevleri okuma/gezinmedir; login/form/upload kabulü kontrollü fixture’da kalır.

JEV’in `DONE` cevabı tamamlanma önerisidir. Doğrulayıcı sonucu onaylamadıysa görev PASS olmaz. Controller eksik koşulu karar girdisine bildirir ve kalan bütçe içinde ilerlemeyi dener. Aynı hedefe sonuçsuz tıklama, aynı gözlemin tekrar gelmesi ve cursor döngüsü tespit edilir; kontrollü yeniden gözlem/arama veya nedenli duruş uygulanır. Düşük confidence tek başına ilerleme veya başarısızlık kanıtı değildir.

## 5. Dört başarısız senaryonun çözüm yolu

| Senaryo | İzlerdeki kanıt | İlk düzeltme ve araştırma | Kabul kanıtı |
|---|---|---|---|
| GitHub Closed | `Closed` tıklamasından sonra adres `issues#`; sonraki karar erken DONE | Filter bölgesindeki selected durumunu ve sorguyu gözleme ekle; hydration/uygulama değişimini bekle; gönderilen tıklama ve olayların etkisini teşhis et | Closed sorgusu/aktif filtresi ve yüklenmiş Issues görünümü; JEV DONE tek başına yeterli değil |
| GitHub Open | Issues bağlantısı seçildikten sonra sonraki hedef `dispatchEvent` sırasında undefined | Belge epoch’u ve kararlı ref ekle; geçişte yeni gözlem al; kaybolan hedefi typed hata ile durdur | Open sorgusu/aktif filtresi ve kullanılabilir liste; eski ref yeni belgeye uygulanmıyor |
| OSM History | `/way/5013364/history` yerine genel `/history` seçiliyor ve tekrarlanıyor | Global navigation ile nesne sidebar’ını ayır; nesne kimliği/adres bağlamını sun; nesnenin kendi geçmiş kontrolünün neden adaylara girmediğini araştır | Tam nesne history rotası, 5013364 kimliği ve revision içeriği birlikte mevcut |
| OSM Details | 2.474 aday; 14 karar boyunca MORE; hiçbir tıklama yok | Kontrol çıkarımında Details kontrolünün adı/rolü ve desteklenmeyen öğe türlerini incele; sidebar’da arama; history listesini bölümlere ayır | Güncel `/way/5013364` rotası ve aynı nesnenin güncel detay içeriği mevcut |

GitHub Closed için hydration veya olay uygulaması eksikliği, mevcut izlerin henüz ispatlamadığı kök neden adaylarıdır. GitHub Open kaybolan hedefi gösterir; kaybın motor/driver kaynaklı oluş şekli yeniden üretimle netleştirilir. OSM Details kontrolünün eksik çıkarımı da araştırılacak adaydır. Düzeltme öncesinde bu ayrımlar küçük, deterministik fixture’larla sınanır.

Hedef URL’ler canlı testin doğrulayıcısında kalır; model girdisine beklenen cevap olarak aktarılmaz. Siteye özel doğrudan URL ezberleyip görev sonucunu zorla üretmek başarı kanıtı sayılmaz. Gezinti hedefi mevcut DOM’da gözlenmiş bir linkten veya aynı tarayıcı oturumunda gözlenmiş geçmişten gelmelidir. Siteye özel verifier kullanılabilir; gözlem ve stale hedef düzeltmeleri genel tarayıcı işlevi olmalıdır.

Lightpanda’nın gerçekten eksik web API/olay davranışı gösterdiği durumda en küçük yeniden üretim çıkarılır. Adaptörde çözülebilen hata orada düzeltilir. Motor değişikliği gerekiyorsa tam kaynak commit’i ve build yöntemi pinlenmiş bir motor düzeltmesi/fork’u değerlendirilir; aynı conformance ve canlı görevler yeniden çalıştırılır. Chrome fallback’iyle başarısızlık kapatılmaz.

## 6. Yedi uygulama aşaması

Bu aşamalar [B01–B43 gereksinimlerini](BROWSER_REQUIREMENTS.md) ürün teslimine bağlar. A1–A7 iş paketleri, T01–T12 ise §7’de tanımlanan bağımsız kabul testleridir. §8 her gereksinimin esas teslim aşamasını gösterir; sonraki regresyon aşamaları ayrıca belirtilir. Limitler §9’da başlangıç konfigürasyonu olarak verilir; ölçülmüş kapasite garantisi değildir.

Her aşama teslimi; çalışan kod, komut/API sözleşmesi, test sonucu ve destek/engel kaydı içerir. Yalnız tasarım yazmak aşamayı geçirmez. Zorunlu bir yeteneğin NOT_RUN veya BLOCKED olması o kapıyı açık bırakır. Canvas gibi kapsam dışı yeteneğin açık UNSUPPORTED sonucu, o yeteneğin desteklendiği anlamına gelmez.

### Aşama 1 Profil sekme ve worker modeli

**B-ID kapsamı:** B15–B17, B22, B41–B43; B01/B02/B07 için altyapı. **Başlangıç limitleri:** L01–L04, L12–L14.

**Teslimler:** `host`, profil/oturum/tab kimlikleri, create/close/history yaşam döngüsü, minimal fixture gezinmesi, worker kaybı olayları, destek matrisi ve kaynak manifesti. Aynı profili iki worker’ın eşzamanlı değiştirmesi engellenir. Askıya alma motor tarafından desteklenmiyorsa açık UNSUPPORTED döner; sekmeyi yeniden yüklemek resume sayılmaz.

İlk ADR izolasyon birimini sabitler: ayrı credential principal/profil veya farklı ağ/erişim politikası ayrı worker kullanır. İlk sürüm bir worker’da bir profil ve o profilin çoklu sekmelerini barındırır; profiller arası engine paylaşımı yapılmaz. Aynı profilin agent’ları yalnız aynı güven ve etkin yetki kümesine sahipse worker paylaşabilir. Daha dar yetkili agent’a profilin tamamı verilmez. Ortak gateway/Node host yeniden kullanılır; toplam pipeline belleği worker sayısıyla doğrudan çarpılmaz.

Tam güvenlik katmanı A2’de kurulur; A1 yalnız anahtarsız yerel fixtures ve sentetik hesaplarla çalışır. A1’de 1 ve 10 sekmeli tek profil, 1 ve 4 profilli ayrı-worker topolojileri 10’ar dakika karşılaştırılır. Bu fixture ölçümünde worker tab kotası önceden manifestte 10 olarak sabitlenir; normal dağıtımın 8-tab varsayılanı sessizce değiştirilmez. Bu ölçüm topolojinin ek maliyetini ve çökme etkisini gösterir; 60/500 MB kabulü değildir. Sonuç kaynak bütçesine sığmıyorsa ADR revize edilir veya hedef açık kalır; izolasyon gevşetilmez. Paylaşımlı engine alternatifi ancak ayrı ADR, cookie/storage/izin ayrılığı testleri ve yeni ölçümle eklenebilir.

**Bağımsız kabul:** T01, T02’nin lifecycle kısmı ve T11’in erken ölçümü. Üç tab’ın adres/geçmişi ayrı, aynı-origin paylaşımı doğru, profiller arasında sıfır sızıntı; worker kill bütün etkilenen tab’ları görünür biçimde kayıp yapar; kapatılan tab/ref yeniden kullanılamaz. Ölçüm raporu ve topoloji ADR’si olmadan A2’ye geçilmez.

### Aşama 2 Agent kimliği izinler ve ağ çıkışı

**B-ID kapsamı:** B18, B31–B35, B37–B40; B36’nın erişim kısmı. **Başlangıç limitleri:** L02–L04, L06, L10–L12, L16.

**Teslimler:** agent başına ayrı token kimliği ve hash kaydı, rotation/revoke, profil/tab/action grant’leri, deny önceliği, authenticated HTTP/SDK/MCP gateway, audit ve OS izolasyonu. Ham CDP endpoint’i agent’a verilmez. Agent’ın tabId veya MCP session ID bilmesi yetki oluşturmaz. Yetki her eylemde ve observation yayınında yeniden değerlendirilir.

Linux dağıtımında worker ayrı unprivileged kimlik, private network namespace ve sınırlı dosya mount’larıyla çalışır. CDP yalnız o namespace içindeki loopback’tedir; gateway’in güvenilir relay’i izinleri 0600 olan Unix socket üzerinden bağlanır. Motorun Unix socket konuşabildiği varsayılmaz. Agent süreçleri worker namespace’ine, relay socket’ine ve secret mount’larına erişemez. OS yöneticisi/root veya gateway’in ele geçirilmesi bu izolasyonun dışındadır. macOS geliştirmesinde aynı erişim sınırı kanıtlanamıyorsa güvenli çok-agent dağıtımı PASS verilmez.

Ağ, zorunlu worker kimlikli egress proxy/filter üzerinden çıkar; worker’ın doğrudan internet ve host ağına çıkışı OS düzeyinde kapanır. Politika bağlantıdan önce ve her redirect’te uygulanır; DNS/IP, iframe, popup, fetch/XHR, form hedefi ve WebSocket yolları test edilir. Desteklenmeyen kaçış protokolleri kapatılır. HTTPS path/endpoint kuralı gerektiğinde motor istek katmanında denetlenir; yalnız CONNECT proxy ile path filtresi vaat edilmez. Puppeteer interception tek güvenlik sınırı sayılmaz. Güvenilir şekilde denetlenemeyen akış açıkça reddedilir.

**Bağımsız kabul:** T02–T04. Yasak hedef fixture sunucusunun istek sayacı sıfır kalmalı; direct bypass ve agent’ın ham CDP bağlantısı başarısız olmalı. Revoked anahtar yeni işlem başlatamamalı, açık observation stream’i kesilmeli. Her kanal aynı deny kararını üretmeli. Güvenlik katmanı geçmeden gerçek hesap veya secret kullanılmaz.

### Aşama 3 DOM gözlemi gezinme ve etkileşim

**B-ID kapsamı:** B01–B12; B36’nın genel çıktı sınırı. **Başlangıç limitleri:** L04–L06, L11–L14.

**Teslimler:** gerçek HTML/JS/DOM sayfa yolu; navigate/back/forward/reload/stop; SPA ve document lifecycle ayrımı; Markdown/AX/DOM çıktıları; bölge/nesne bağlamı, find/cursor, kararlı ref ve koşullu wait. Form, menü, modal, autocomplete, shadow root, iframe/popup/dialog ve dosya işlemleri capability matrisiyle sınırlandırılır. Desteklenmeyen iframe/trusted input gibi işlemler açık typed hata verir; destek yokluğu sessiz PASS’e çevrilmez.

Fixture/lab ve ürün aynı observation/action uygulamasını kullanır. Dört canlı başarısızlığın stale target, dinamik filtre, yanlış History kapsamı ve büyük kontrol listesi örnekleri deterministik fixture’larla yeniden üretilir. Model oracle cevabını almaz. Upload/download yalnız izinli dizin ve dosya kotalarıyla çalışır.

**Bağımsız kabul:** T05–T06. Sabit fixture corpus’unda %100 doğru sonuç ve sıfır yanlış/mükerrer commit gerekir. Stale ref yanlış kontrolü tetiklemez. Büyük sayfada hedef bütün listeyi sırayla dolaşmadan bulunabilir. Kapsam dışı yeteneğe negatif conformance testi uygulanır; zorunlu görev o yeteneğe bağlıysa destek kapısı açık kalır.

### Aşama 4 Hassas veri eklentisi ve credential koruması

**B-ID kapsamı:** B13–B14, B23–B25, B30, B36. **Başlangıç limitleri:** L07–L10, L15–L16.

**Teslimler:** yalnız `request_private_input` talebini cevaplayan eklenti, ayrı eklenti kimliği, tek kullanımlık eşleştirme, bildirim/poll kanalı, request state machine, hedef bağlama, secret yerleştirme ve tüm çıktı kanallarında maskeleme. Eklenti sayfa, DOM, screenshot veya tab listesi alamaz; gezinemez, click/submit yapamaz. İnsan kontrol paneli veya browser takeover endpoint’i bulunmaz.

Agent yalnız önceden izinli login intent’ini ve alan ref’ini seçer. Browser; credential sınıfını, top-level/frame origin’lerini, hedef alanı ve form action origin/path’ini güvenilir yapılandırmadan doğrular. Amaç metni sabit şablondan gelir; agent/sayfa serbest metni bildirim metnine dönüşmez. Gizli e-posta gibi sıradan type=text alanları da politika ile private sınıfına alınır. Agent’ın veya sayfanın “parola lazım” demesi tek başına talep açamaz. Kötü amaçlı sayfa, yanlış form hedefi ve beklerken değiştirilmiş form action negatif testlere girer.

Eklenti dağıtımda bir defalık yerel bootstrap koduyla eşleştirilir; sürekli insan yönetim arayüzü eklenmez. Bootstrap kodu yalnız eklentiye dar cevap kimliği verir. Yerel özel IPC kanalında peer kimliği ve request yetkisi doğrulanır; agent token’ı eklenti cevabı gönderemez. Bildirim yalnız doğrulanmış site kimliği, alan türü, sabit amaç ve requestId taşır; değerler yalnız kimliği doğrulanmış cevap kanalındadır. Eklenti kapalıysa talep timeout olur; secret başka kanaldan istenmez.

Private input tek seferliktir, varsayılan olarak diske yazılmaz. Model transport’undan geçmez. Host alanı/form hedefini son kez doğrulayıp uygular; agent yalnız `APPLIED/CANCELLED/EXPIRED/STALE` alır. Eklenti buffer’ı ve host’un geçici referansları temizlenir; yönetilen runtime’da fiziksel RAM’in kusursuz sıfırlanması iddia edilmez, işçi core dump’ları kapatılır. Kalıcı credential/profil anahtar yönetimi A5’in ayrı teslimidir.

**Bağımsız kabul:** T07–T08. Agent e-postayı doldurup yalnız parolayı insana yönlendirebilir; gizli e-posta da aynı kanaldan alınabilir. Normal input’lar insana sorulmaz. Sahte origin/frame/form-action, eski generation, replay, yanlış eklenti kimliği ve prompt injection talepleri reddedilir. Secret HTML/AX/Markdown/console/error/network trace/model payload’da görünmez. Güvenli çıktı sınırı kurulamayan akışta observation aktarımı durur; insan sayfa görüntülemesi fallback olmaz.

### Aşama 5 Kalıcı oturumlar ve çoklu agent koordinasyonu

**B-ID kapsamı:** B19–B22, B26, B29; B16–B18/B24/B30/B37/B40 entegrasyonu. **Başlangıç limitleri:** L01–L03, L07–L10, L12–L16.

**Teslimler:** sekme başına tek writer lease’i, heartbeat/generation, profil düzeyinde login/logout/save kilidi, task cancel/reconcile ve adil scheduler. Private input bekleyen tab başka writer’a verilmez; agent heartbeat’i sürmelidir. Diğer tab’lar ilerler. Lease bitince bekleyen private request iptal edilir; geç cevap yeniden açılan tab’a uygulanmaz. Gönderilmiş yan etki belirsizse otomatik tekrar yoktur.

Credential kaynağı açık ayrılır: ephemeral private input, dışarıdan provision edilmiş credentialRef ve şifreli kalıcı session profili. Eklentiden girilen parola otomatik vault’a kaydedilmez. Kalıcı credential kullanımı yalnız açık saklama politikasıyla yapılır. macOS’ta OS Keychain, Linux’ta worker’dan ayrı controller-only secret mount’u ile sağlanan 256-bit master key başlangıç seçenekleridir; anahtar repo/env/log/worker’a girmez. Anahtar yoksa plaintext fallback yapılmaz. Denetlenmiş kripto kütüphanesiyle authenticated encryption, ayrı profil anahtarları, format sürümü, atomik yazım ve rotation uygulanır; özel şifreleme algoritması yazılmaz.

Cookie/storage export/import capability’si ölçülür; alan adları ve cookie scope korunur. Gerekli IndexedDB veya başka state aktarılamıyorsa o site için kalıcı login desteklenmiyor denir. Profil silme/logout yerel state’i temizler; sağlayıcıdaki bütün oturumların iptali ayrıca kanıt gerektirir. Başka browser profilinin tamamı varsayılan içe aktarılmaz. Aktarım ancak sınırlandırılmış fixture/provision yoluyla test edilir.

**Bağımsız kabul:** T01–T02 regresyonu, T08–T09. Ayrı hesaplar ve profiller sızmaz; üç agent’ın aynı tab yarışı tek dispatch üretir; iptalden sonra geç karar/request etkisizdir. Restarta doğru profil döner, yanlış/eksik key açılmaz, rotation ve yarım yazımda veri kaybı/sessiz boş profil oluşmaz. Hassas girdi bekleme ve lease süreleri sahte saatle sınanır.

### Aşama 6 Canlı site uyumluluğu ve model istemcileri

**B-ID kapsamı:** B27–B28, B39; B01–B12/B23–B30 canlı uyumluluğu. **Başlangıç limitleri:** L04–L06, L17–L18.

**Teslimler:** aynı browser API’sini kullanan ince model adaptörleri, bağımsız verifier’lar, dört GitHub/OSM düzeltmesi ve yedi-site destek raporu. JEV ürünün kontrol/kimlik/ağ katmanını atlamaz. Google web login, üçüncü taraf Google login ve önceden sağlanan API yetkisi ayrı destek durumları taşır; gerçek hesap testi yoksa NOT_RUN kalır. İnsan kontrollü OAuth/browser yolu eklenmez; CAPTCHA/ekran devralma isteyen akış destek dışı durur.

Geliştirme önce yerel reproducer’da yapılır; kök neden motor ise en küçük örnek ve pinlenmiş engine patch/fork kaydedilir. URL ezberi, oracle sızıntısı veya Chrome fallback’i başarı sayılmaz. Canlı test yalnız salt okuma/gezinmedir; login/form/upload doğruluğu fixture’larda kabul edilir, gerçek hesap desteği ayrı canary gerektirir.

**Bağımsız kabul:** T10 ve T05–T09 regresyonları. Canlı örnekleme, geçme eşiği ve dış hata politikası §7’de sabitlenir. Model olmadan temel browser conformance’ı da geçmelidir. Canlı başarı güvenlikteki herhangi bir FAIL’i kapatamaz.

### Aşama 7 Kapasite ve kurulabilir paket

**B-ID kapsamı:** B07, B41–B43; B01–B43 bütünleşik regresyonu. **Başlangıç limitleri:** L01–L18; kapasite profili L13.

**Teslimler:** temiz kurulum, pinlenmiş motor/bağımlılıklar, headless yapılandırma, eklenti dağıtımı/eşleştirmesi, destek matrisi, immutable run manifesti ve Linux kapasite raporu. A1’deki erken ölçüm tekrarlanır; A2 egress/izolasyon, A4 secret koruması ve A5 kalıcılık gerçek ürün maliyetine dahildir.

1/10/30/60 hedeflerinde tab, profil, agent ve worker sayıları ayrı yazılır. Tek profilde 60 tab ile 60 bağımsız hesap/oturum aynı test sayılmaz. 60 bağımsız oturum hedefi, ayrı profile ait 60 oturumun seçilmiş güvenli topolojide aktif ilerlemesiyle sınanır. Önce limitli keşif, sonra 500.000.000 byte bütün ürün hard cap kabulü uygulanır. Belleğe gateway, proxy, worker, storage cache, eklenti host’u ve ölçüme dahil yardımcılar girer; uzak model hariçtir ve açık raporlanır.

**Bağımsız kabul:** T11–T12 ve T01–T10 regresyonları. Paket kurulabilir olsa bile zorunlu güvenlik/işlev testi açıkken ürün kabulü verilmez. 60/500 MB başarısızsa capacity hedefi FAIL/NOT_RUN kalır; daha düşük ölçülmüş profil ayrı açıklanabilir ama hedef değiştirilmiş sayılmaz. İlk ürün işlev kabulü ile 60/500 MB kapasite kabulü ayrı satırlardır.

## 7. Bağımsız kabul testleri ve karar kapıları

### Test kataloğu

Test oracle’ları agent/model cevabından ayrıdır. Fixture backend’i gerçek kayıt, ağ isteği ve commit sayısını; OS probe’ları erişim/çıkış sınırını; credential testleri sentetik secret sızıntısını kontrol eder. İnsan yalnız eklentinin dar veri alanına yazabilir; test gözlemi tarayıcıda insan gezinme arayüzü oluşturmaz.

| Test | Kapsam ve bağımsız kanıt | Geçiş koşulu |
|---|---|---|
| T01 | Profil/tab/history/storage; üç tab ve iki ayrı hesaplı profil; backend state ve storage sentinel’ları | Tüm fixture varyantları doğru; hesap/tab karışması sıfır |
| T02 | Worker izolasyonu, çapraz agent/profile/tab yetkisi, raw CDP ve mount/socket erişim probları | Yetkisiz gözlem/eylem/secret erişimi sıfır; worker kill etkisi doğru raporlanır |
| T03 | Allow/deny ve egress: redirect, iframe, popup, fetch/XHR, form, ws, DNS/IP ve direct bypass; hedefte istek sayacı | Kesin ağ yasağında hedefe ulaşan istek sıfır; desteklenmeyen kaçış yolu kapalı |
| T04 | Agent token rotation/revoke, scope, HTTP/SDK/MCP paritesi, audit | Revoke transaction’ından sonraki yeni dispatch/observation yok; geç in-flight etki ayrı uzlaştırılır |
| T05 | JS/dinamik DOM, SPA, wait, find/cursor, eski ref, scope, frame/shadow/popup ve dört hata reproducer’ı | Sürüm sabit corpus’ta %100; eski ref/yanlış nesne için sıfır yanlış PASS |
| T06 | Form/select/autocomplete/modal, upload/download ve capability negatif testleri; payload/dosya oracle’ı | Tek doğru commit; yanlış/mükerrer commit sıfır; file scope/kota ihlali reddedilir |
| T07 | Eklenti eşleştirme/kimlik, private input talebi, timeout/replay, origin/frame/form-action değişimi ve phishing/prompt injection fixture’ları | İzinli alana bir kez doğru uygulama; her yasak talep reddedilir; eklentide sayfa/tab/gezinme yetkisi yok |
| T08 | Secret kaynakları, HTML/AX/Markdown/log/error/network/model çıktıları ve yansıtma saldırıları | Sentetik canary secret sızıntısı sıfır; maskelenemeyen çıktı fail-closed; plaintext disk fallback yok |
| T09 | Lease/generation yarışı, heartbeat kaybı, private input beklemesi, cancel, restart/save/restore/key rotation | Tab başına tek writer, geç dispatch sıfır; doğru profile restore; belirsiz mutasyon tekrarı sıfır |
| T10 | Sabit canlı görev listesi, bağımsız rota/entity/filter/içerik verifier’ı; Google destek durumları ayrı | Aşağıdaki sınırlı canlı uyumluluk kapısı; erişim engeli PASS sayılmaz |
| T11 | Erken topoloji ölçümü; nihai load/soak/churn; OS toplam ürün belleği, CPU, FD ve ilerleme | Erken rapor A1’de zorunlu; nihai ölçümde yanlış PASS/izolasyon ihlali sıfır ve seçilen kapasite profili eşikleri sağlanır |
| T12 | Temiz kurulum, engine/dependency hash’i, yapılandırma, eklenti kurulumu ve kapanış | Chrome/OCR/insan browser UI’si olmadan kurulum; varsayılan ağ/secret politikası aktif; süreçler temiz kapanır |

### Deterministik kapı

T01–T09 ve T12’nin uygulanabilir zorunlu vakaları %100 geçer; tek bir secret sızıntısı, yetki bypass’i, yanlış PASS veya yanlış/mükerrer commit release’i durdurur. Conformance corpus’u kabul öncesinde sürümlenir. Veri varyasyonlu her işlev ailesi 10 varyant × 3 tekrar; lease/stale/cancel race ailesi ayrıca 100 kontrollü zamanlama dizisiyle sınanır. Bunlar yeni test planıdır; geçmiş 90/90 veya 10/10 sonuçları yerine geçmez. Corpus’taki uygulanamaz yetenekler manifestte gerekçesiyle ayrılır; zorunlu özelliğin yokluğu UNSUPPORTED yazılarak kapatılamaz.

### Sınırlı canlı uyumluluk kapısı

Eski 40/40 + 42/42 ve toplam 82-deneme zorunluluğu bu protokolle değiştirilmiştir. Sabit adapter/model/engine sürümünde mevcut 14 hedef, iki ayrı zaman grubuna bölünen 3 tam turda sınanır: **42 ilk deneme**. Yedi site ve görev kimlikleri önceden manifestte sabittir; aynı hedef tekrarları yeni site çeşitliliği sayılmaz.

Başlangıç pilot kabul eşiği **en az 38/42 doğrulanmış başarı**, ayrıca **14 hedefin her birinde en az 2/3**; dört GitHub/OSM hedefinin her biri de bu koşulu sağlamalıdır. Sıfır yanlış PASS şartı değişmez. Bu, yalnız bu küçük destek corpus’una ait uyumluluk kapısıdır; genel web veya üretim SLA’sı değildir.

PASS/FAIL/UNKNOWN/NOT_RUN, ilk deneme süresi ve neden kategorileri birlikte raporlanır. Sınıflar: observation/karar, stale/action, engine capability, navigation/readiness, policy, verifier, ağ/DNS/TLS, 429/erişim engeli ve bütçe. Dış hatalar toplam başarı paydasından çıkarılmaz; ayrıca ürün kaynaklı hata görünümü sunulur. Eksik 42-deneme koşusu kabulü kapatmaz. 429/sağlayıcı engelinde domain koşusu durur ve tamamlanamayanlar NOT_RUN olur; aynı koşuda başarıya ulaşana kadar tekrar yoktur.

Belirsizlik raporu toplam ham oranı, site/hedef başına oranları ve hedefe göre kümelenmiş bootstrap ile %95 aralığı verir; 14 hedef ve 7 siteyle tahminin sınırlılığı belirtilir. Aralık keşif amaçlıdır; bağımsız Bernoulli denemeleri varsayıp genel başarı alt sınırı iddia edilmez. Bu pilotta CI alt sınırı ayrı release eşiği yapılmaz; böyle bir SLA hedefi için daha çeşitli sabit corpus ve önceden belirlenmiş örneklem gerekir.

Canlı istekler domain başına tek aktif görev ve en az 10 s görev aralığıyla çalışır; fixture geliştirmeleri canlı siteye yük bindirmez. Domain kuralları/otomasyon erişim koşulları koşu manifestinde kontrol tarihiyle kaydedilir. Yasak/engel veya Retry-After varsa daha kısıtlayıcı davranış uygulanır, kaçış denenmez. Gizli otomatik action/provider retry yoktur. Tanı tekrarı ayrı manifesttir ve ilk deneme skorunu değiştirmez. L17–L18 toplam çağrı/tur limitini kapatır; nakit API tavanı yapılandırılmadan ücretli koşu başlamaz. Bu belge canlı API harcaması başlatmaz.

### Kapasite ve sonuç raporu

A1 erken testleri kaliteyi atlamadan topoloji kararını sınar. A7’de her topoloji 10 dakika keşif; desteklenen hedef topolojide 60 dakika aktif fixture işi ve 100 create/close churn uygulanır. Aynı koşuda en az %99 doğrulanmış fixture işi, her aktif oturumda her 30 s’de en az bir tamamlanan bounded görev, sıfır yanlış PASS/izolasyon ihlali ve kaynak hard cap gerekir. İlk 10 dakika ile son 10 dakika ortalama resident ürün belleği farkı en çok max(%5, 10.000.000 byte) olmalı; FD/child sayıları churn sonrası başlangıca dönmeli. Gateway kuyruğunda bekleyen iş 60 aktif oturum sayılmaz.

60 bağımsız oturum ve bütün ürün ≤500.000.000 byte birlikte sağlanmazsa bu kapasite kapısı FAIL’dir. 500 MB için worker güven sınırı, egress veya credential koruması kapatılamaz. Profil sayısı, worker sayısı ve paylaşılan host maliyeti ayrı gösterilir; tek görev medyanları çoğaltılarak sonuç üretilmez.

Run manifesti; source commit ve uncommitted diff hash’i, motor binary/dependency/model sürümleri, corpus/verifier/policy/limit hash’leri, topoloji, sıra ve ortamı taşır. Bütün denemeler, başarısızlara en az aktif-task deadline cezası uygulanmış süreler ve ham aşama süreleri raporlanır. Ortak başarılı hedef karşılaştırması ayrıca verilebilir. Secret/raw cookie içermeyen kanıtlar saklanır. Sonuç tablosunda **ürün işlev/güvenlik**, **canlı destek corpus’u**, **Google/özel capability**, **60/500 MB kapasite** ayrı PASS/FAIL/NOT_RUN/BLOCKED satırlarıdır.

## 8. B01–B43 izlenebilirlik tablosu

Her satırın esas teslim aşaması, somut çıktısı ve bağımsız kabul testi vardır. Regresyon bütün üründe A7’de tekrar edilir. Bir satırın capability sınırı varsa desteklenen davranış ve negatif test ayrıca raporlanır.

| B-ID | Esas aşama | Teslim | Kabul testi |
|---|---|---|---|
| B01 | A3 | HTML/JS/DOM çalışan sayfa yolu | T05 |
| B02 | A3 | Navigation/history/reload/stop ve SPA ayrımı | T01, T05 |
| B03 | A3 | Koşullu readiness/wait | T05 |
| B04 | A3 | Form ve kontrol action’ları | T06 |
| B05 | A3 | Frame/shadow/popup/dialog capability ve olayları | T05, T06 |
| B06 | A3 | İzinli upload/download ve dosya kotaları | T06 |
| B07 | A3, A7 | Sürüm bazlı capability/support matrisi ve paket raporu | T05, T06, T12 |
| B08 | A3 | Yetkili Markdown/AX/DOM çıktıları | T05, T08 |
| B09 | A3 | Bölge ve entity bağlamı | T05 |
| B10 | A3 | Find/scope/cursor/truncation | T05 |
| B11 | A3 | Epoch/ref ve action-time doğrulama | T05 |
| B12 | A3 | Kimlikli, sınırlı olay akışı | T04, T05, T08 |
| B13 | A4 | Yalnız veri giriş/iptal yapabilen eklenti | T07 |
| B14 | A4 | Gerektiğinde tek kullanımlık private request | T07, T09 |
| B15 | A1 | Bağımsız tab kimliği/adresi/geçmişi | T01 |
| B16 | A1, A5 | Origin/tab storage ve login/logout sürekliliği | T01, T09 |
| B17 | A1, A5 | Ayrı profil ve atomik kalıcı state | T01, T02, T09 |
| B18 | A2 | Agent kimliği/token/scope | T02, T04 |
| B19 | A5 | Tek writer lease ve private-wait tab kilidi | T09 |
| B20 | A5 | Adil çok-agent scheduler | T09, T11 |
| B21 | A5 | Profil düzeyinde auth/save kilidi | T09 |
| B22 | A1, A5 | Worker kaybı, cancel ve unknown reconciliation | T02, T09 |
| B23 | A4 | Agent login + yalnız hassas insan girdisi | T07, T08 |
| B24 | A4, A5 | Origin bağlı credentialRef ve secret injection | T07, T08, T09 |
| B25 | A4 | Private OTP; devralma isteyen işte açık destek sınırı | T07 |
| B26 | A5 | Şifreli session save/restore/logout | T08, T09 |
| B27 | A6 | Google agent-only destek/engel raporu | T10, T12 |
| B28 | A6 | Web/üçüncü taraf/API auth ayrımı | T10 |
| B29 | A5 | Origin sınırlı state provisioning/import | T02, T08, T09 |
| B30 | A4, A5 | Login, credential ve hesap kullanım grant ayrımı | T04, T07, T09 |
| B31 | A2 | Global deny ve açık bağlantı kesme | T03, T04 |
| B32 | A2 | Agent’a özel deny ve worker/policy ayrılığı | T02, T03 |
| B33 | A2 | Canonical origin/domain allow/deny | T03 |
| B34 | A2 | OS egress + proxy/engine filtresi | T03 |
| B35 | A2 | Action/endpoint yetki matrisi | T03, T04, T06 |
| B36 | A2, A4 | Ham erişimi kapatma ve bütün çıktılarda secret sınırı | T02, T08 |
| B37 | A2, A5 | Revoke, generation ve stream/lease iptali | T04, T09 |
| B38 | A2 | Makine policy/audit/revoke; insan paneli yok | T04, T12 |
| B39 | A2, A6 | Ortak agent gateway ve ince model istemcileri | T04, T10, T12 |
| B40 | A2, A5 | İzole varsayılan profil ve süreli grant | T02, T04, T09 |
| B41 | A1, A7 | Admission/kaynak kotaları ve limit raporu | T11 |
| B42 | A1, A7 | Arka plan faaliyeti ve gerçek suspend capability | T05, T11 |
| B43 | A1, A7 | Erken/nihai ürün kaynak ölçümü | T11, T12 |

## 9. Başlangıç limitleri

Bunlar uygulama için önerilen **başlangıç varsayılanlarıdır**. A1 ölçümü ve ilgili kabul testleriyle doğrulanır; kanıt olmadan performans/SLA sözü değildir. Daha düşük limit zorunluysa değişiklik gerekçesi ve yeni manifest ile yapılır. Kabul başladıktan sonra eşik sessizce değiştirilmez. Tüm süreler monotonic clock kullanır.

| Limit | Başlangıç değeri ve kapsam | Gerekçe ve doğrulama |
|---|---|---|
| L01 | Default: 4 worker/profil, worker başına 8 tab, toplam 32 tab | Küçük ve sınırlı ilk dağıtım; fazla istek RESOURCE_LIMIT; T01/T11 |
| L02 | 16 bağlı agent; agent başına en çok 4 tab grant’i; toplam 8 aktif görev | Kontrolsüz fan-out’u önler; A5 adil sıra ve T09/T11 |
| L03 | Tab başına 1 writer ve en çok 2 bekleyen writer; global admission kuyruğu 32 iş, kuyruk bekleme 10 s | Aynı sayfada yarış ve sınırsız kuyruk yok; doluysa BUSY; T09 |
| L04 | Engine başlatma/bağlantı 15 s; navigation 20 s; normal local action 5 s; koşullu wait en çok 10 s | Ağ ve araç timeout’larını ayırır; testte gecikme enjeksiyonu T05/T12 |
| L05 | Görev: 30 action/karar turu; aktif süre 180 s; private bekleme hariç tutulur, mutlak görev süresi 300 s | Bitmeyen döngüyü keser; private girdi 120 s ile sınırlı; T07/T09/T10 |
| L06 | Provider çağrısı 15 s; otomatik provider/action retry 0 | Kayıp cevapta kör dispatch’i önler; T05/T09 |
| L07 | Writer lease 30 s, agent heartbeat 5 s; heartbeat/lease kontrol çözünürlüğü en çok 1 s | Takılı agent tab’ı sonsuza kadar tutmaz; private beklemede de heartbeat zorunlu; T09 |
| L08 | Private request 120 s; tab başına 1, agent başına 2, global 8 pending | Dar insan bağlantısını sınırlar; timeout/lease kaybında iptal; T07/T09 |
| L09 | Private alan değeri en çok 4.096 UTF-8 byte; tek kullanım; eklenti bootstrap kodu 128-bit, TTL 120 s | Secret boyutu/replay sınırı; yanlış/eşleşmemiş kimlik reddi; T07/T08 |
| L10 | Agent token 256-bit, varsayılan TTL 24 saat; eklenti kimliği ayrı 256-bit ve TTL 30 gün; revoke her dispatch/stream yayını öncesi, iptal yayılımı en çok 1 s | Ham token yalnız ilk provision’da; host hash tutar, eklenti anahtarı OS store’da; T04/T07 |
| L11 | API body/response en çok 1 MiB; observation 256 KiB ve en çok 200 kontrol; event buffer tab başına 256 olay veya 256 KiB | Büyüyen çıktı ve backpressure sınırlı; cursor/truncated açık, event kaybı gap olayıyla bildirilir; T05/T08 |
| L12 | Worker başına 16 HTTP isteği, host başına 4 bağlantı, 4 WebSocket; response üst sınırı 16 MiB | Kaynak tüketimini kapatır; büyük kaynak capability hatasıyla raporlanır; T03/T11 |
| L13 | Default toplam ürün cgroup limiti 1.024 MiB, worker V8 heap hedefi 64 MiB; erken keşif toplam üst sınırı 2.048 MiB ve A1 fixture ölçümünde worker başına en çok 10 tab. Capacity profili: en çok 60 worker/profil, 60 tab/agent/aktif görev, kabulde bütün ürün ≤500.000.000 byte | Heap sınırı worker toplamı değildir. Kapasite profili ayrı manifestle açılır; default kotalar sessizce yükselmez. T11 |
| L14 | Tek upload/download 10 MiB; worker temp 100 MiB; profil snapshot 32 MiB; audit toplam 32 MiB/24 saat, en çok 4 MiB dosyalar | Disk sınırında işi reddeder; secret/raw body audit’e girmez; T06/T08/T12 |
| L15 | Varsayılan private secret disk saklama 0; en çok 1 pending snapshot/profile; master key 256-bit, dosya/mount yalnız controller’a 0400/0600 | Ephemeral girdi ile encrypted vault ayrımı; eksik key’de stop; T08/T09 |
| L16 | Profil auth/save kilidi 10 s; süre dolunca unknown reconciliation bitmeden yeni auth mutation yok; engine graceful close 5 s ardından zorunlu sonlandırma | Kilit süresi dolması devam eden işi güvenli saymaz; T09/T12 |
| L17 | Canlıda domain başına 1 aktif görev, görevler arası en az 10 s; 429/engel gördüğünde domain koşusu stop | Gereksiz canlı yük ve tekrar yok; daha kısıtlayıcı site kuralı öncelikli; T10 |
| L18 | Canlı kabul: 42 ilk deneme, task başına en çok 20 model çağrısı ve koşu toplamı 300 çağrı; konfigüre edilmiş nakit tavanı yoksa ücretli koşu 0 | İlk dolan bütçede kalanlar NOT_RUN; sınırsız çağrı modu kabulde kapalı; T10 |

Limitlerin kabulde denenmesi sadece normal yol değildir: sınırın hemen altı/üstü, deadline anında cevap, heartbeat kaybı ve quota yarışları da sınanır. Aynı testte L05, L07 ve L08 birlikte uygulanır; private girdi beklemek görev, agent veya lease bütçesini sıfırlamaz. Bu değişiklik planlama teslimidir; limitler henüz çalışan kodda uygulanmış değildir.

## 10. İlk uygulama işi ve belge önceliği

İlk iş `browser/` altında agent profil/session/tab sözleşmesini ve worker topolojisi ADR’sini oluşturmak, A1’in T01/T02/T11 test altyapısını kurmak ve erken ölçümü yapmaktır. Ardından A2 kimlik/ağ/OS sınırları gelir. Live benchmark veya JEV entegrasyonu bu kapıların önüne geçmez.

Güncel özellikler için BROWSER_REQUIREMENTS, aşama/limit/kabul için bu belge esas alınır. Çelişkide PASS verilmez; birlikte düzeltilir. Eski MVP_PLAN, ACCEPTANCE ve TASK_CONTRACTS tarihsel tasarımdır; yararlı ilkeleri yeni testlere taşınır, eski G/K eşikleri bu ürünün otomatik kabul koşulu değildir. Kaynak ve benchmark snapshot’ları tarihsel kanıt olarak değiştirilmez. Değişiklikler çalışma ağacında diff olarak bırakılır; bu plan güncellemesi commit, dağıtım veya canlı API çalıştırma içermez.
