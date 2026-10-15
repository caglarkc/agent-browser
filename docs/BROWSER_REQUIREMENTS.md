# Görselsiz tarayıcının özellikleri ve erişim gereksinimleri

Güncelleme: 15 Ekim 2026. Bu belge istenen ürün davranışlarını ve araştırmaya dayalı tasarımını tanımlar. Maddeler henüz uygulanmış özellikler değildir. [Uygulama planı](BROWSER_PLAN.md) bu gereksinimlere göre yürütülür; tarayıcı yetenekleri, hesaplar ve erişim yönetimi önceliklidir. JEV bir istemcidir.

Tarayıcı tamamen agent odaklıdır: Lightpanda motoru, profil ve sekme yöneticisi, yapısal gözlem ve yetki/ağ politikası içerir. İnsan sayfayı göremez, sekmede gezinemez, DOM inceleyemez veya tarayıcı kontrolünü devralamaz. İnsanla tek etkileşim, agent’ın gerekli gördüğü hassas veri girişini talep ettiği dar kapsamlı eklentidir. Site yasakları ve agent yetkileri dağıtım yapılandırmasıyla uygulanır; bunlar için ayrı insan paneli eklenmez.

## 1. Araştırmanın belirlediği teknik sınırlar

Lightpanda HTML’yi işler, JavaScript yürütür ve DOM tutar; gerçek görsel yerleşim ve piksel render’ı sağlamaz. Web API kapsamı kısmi olduğundan HTML/JS desteği her sitenin çalışacağı anlamına gelmez. [Motor mimarisi](https://lightpanda.io/docs/core-concepts/architecture-overview)

Güncel belgeler Markdown ve erişilebilirlik ağacı çıktıları ile ayrı browser context kullanımını gösterir. Bunlar gözlem ve oturum ayrılığı için başlangıçtır; çok sekme davranışı ve pinlenmiş binary’deki kapsam ayrıca test edilmelidir. [Yapısal gözlem](https://lightpanda.io/docs/guides/markdown-axtree), [context örneği](https://lightpanda.io/docs/usage/cdp/puppeteer)

Depodaki binary kendisini 1.0.0 olarak bildiriyor. Yerel `serve --help`, cookie dosyası yükleme, proxy, ağ/heap/watchdog limitleri ve CDP bağlantı sınırı seçeneklerini gösteriyor. Yardım çıktısı cookie yüklemesini read-only tanımlıyor; kalıcı profil kaydetme, cookie geri yazımı ve bütün storage türlerinin korunması ayrı ürün işidir. Web dokümanlarının sürümü yerel binary’nin destek kanıtı yerine geçmez.

Google otomasyonla kontrol edilen veya uygulamaya gömülü tarayıcılarda girişleri engelleyebilir. Google OAuth politikası geliştiricinin kontrol ettiği embedded user-agent üzerinden yetkilendirmeyi yasaklar. Dolayısıyla doğrudan Google web login desteği ancak site/hesap bazında doğrulanabilir; sistem tarayıcısındaki OAuth akışı ayrı bir çözümdür. [Google giriş desteği](https://support.google.com/accounts/answer/7675428?hl=en), [OAuth politikası](https://developers.google.com/identity/protocols/oauth2/policies)

## 2. Sayfaları açma ve çalıştırma

| ID | Tarayıcı bunu sağlamalı | Nasıl yapılmalı ve ne doğrulanmalı |
|---|---|---|
| B01 | Gerçek siteyi çalıştırma | URL’den HTML ve gerekli kaynaklar alınmalı; JS, DOM, timer ve fetch/XHR davranışları motor üzerinde yürümeli. Kaynaklar yüklenmeden yalnız metin indirme başarı sayılmamalı. Site yeniden yazılmayacak; orijinal web kodu çalıştırılacak. |
| B02 | Normal gezinme | Adres açma, geri/ileri, reload, yüklemeyi durdurma ve yönlendirmeler desteklenmeli. SPA route değişimi tam document navigation’dan ayrılmalı. |
| B03 | Dinamik sayfa hazır oluşu | Ana içerik, belirli kontrol veya AJAX sonucu için koşullu bekleme olmalı. Ağın tamamen susması veya sabit uyku her site için yeterli kabul edilmemeli. |
| B04 | Form ve kontrol etkileşimi | Input, textarea, select, checkbox, radio, submit, menü, dialog ve autocomplete desteklenmeli. Değerin değişmesi ile uygulamanın olayı kabul etmesi ayrı doğrulanmalı. |
| B05 | Frame ve popup davranışı | Iframe, shadow root, yeni pencere/sekme açılması ve JS dialog’ları takip edilmeli. Popup açılmadan adres politikası uygulanmalı. Motor desteği eksikse açık destek hatası verilmeli. |
| B06 | Dosya işlemleri | Upload yalnız izinli dosyadan; download sınırlı dizine, boyut/tür kotasıyla yapılmalı. Agent keyfi host dosyalarını okuyamamalı. |
| B07 | Uyumluluk matrisi | Auth, frame, storage, WebSocket, IndexedDB, worker ve gerçek kullanıcı girdisi gibi yetenekler sürüm bazında listelenmeli. Desteklenmeyen API veya site anlaşılır nedenle raporlanmalı. |

Gerçek layout, canvas görüntüsü, video, CAPTCHA görüntüsü ve koordinat gerektiren arayüzler yapısal gözlemle otomatik çözülemez. Motor desteği bulunmayan görevler nedenli durur; bunları insana sayfa göstererek veya tarayıcıyı devrettirerek tamamlama yolu eklenmez.

## 3. Agent gözlemi ve hassas veri giriş eklentisi

| ID | Tarayıcı bunu sağlamalı | Nasıl yapılmalı ve ne doğrulanmalı |
|---|---|---|
| B08 | Üç sayfa görünümü | Okuma için Markdown/metin, işlem için ad/rol/durum taşıyan kontrol ağacı, yetkili teşhis için DOM görünümü sunulmalı. Agent çıktısı erişim ve maskeleme politikasından geçmeli. |
| B09 | Bölge ve nesne bağlamı | Main, navigation, sidebar, form, dialog ve kayıt ayrımı bulunmalı. Global History ile nesnenin History’si aynı aday olarak sunulmamalı. |
| B10 | Büyük sayfalarda arama | Ad, rol, metin ve gözlenmiş URL ile arama; bölge seçimi; cursor ve truncation bilgisi olmalı. Binlerce kontrolü sırayla okutmak tek seçenek olmamalı. |
| B11 | Güncel ve güvenilir hedef | Ref, sekme/frame/document kimliğiyle bağlanmalı; işlem öncesi hedef doğrulanmalı. Eski ref yanlış düğümü tetiklememeli. |
| B12 | Değişiklik ve olay akışı | Yeni sekme, adres değişimi, yükleme, DOM güncellemesi, console/JS hatası ve engellenen istekler izlenebilmeli. Snapshot ve event çıktılarında profil/sekme/sürüm bilgisi olmalı. |
| B13 | Dar kapsamlı veri giriş eklentisi | Yalnız agent tarafından talep edilen alanlar, browser’ın doğruladığı hedef origin ve kısa amaç gösterilmeli. Sayfa, screenshot, DOM, sekme listesi veya gezinme aracı sunulmamalı. Eklenti yalnız değer gönderme veya talebi iptal etme yetkisine sahip olmalı. |
| B14 | Gerektiğinde hassas girdi talebi | Her input insana sorulmamalı. Agent hassas verinin insan tarafından girilmesi gerektiğinde request_private_input çağırmalı; mevcut politika/credential durumu da bu ayrımı belirlemeli. Agent’a ham değer yerine yalnız uygulandı/iptal/süresi doldu/eski hedef durumu dönmeli. |

Gözlem sayfanın JavaScript yürütüldükten sonraki durumundan alınır. Lightpanda’nın native Markdown/AX çıktıları başlangıç adayıdır; ürünün yetki, maskeleme ve kararlı ref kurallarıyla birleştirilir. [Lightpanda gözlem araçları](https://lightpanda.io/docs/guides/markdown-axtree)

## 4. Çoklu sekme ve çoklu agent

Önerilen ilişki: **tarayıcı → profil → oturum → sekme → frame/document**. Profil saklanan hesap durumunu ve kullanıcı politikasını, oturum bunun çalışan örneğini temsil eder. Aynı kalıcı profili eşzamanlı iki worker değiştiremez; kilit veya tek sahip gerekir.

| ID | Tarayıcı bunu sağlamalı | Nasıl yapılmalı ve ne doğrulanmalı |
|---|---|---|
| B15 | Bağımsız sekmeler | Her sekmenin adresi, geçmişi, DOM’u ve yükleme durumu ayrı olmalı. Komutlar her zaman tabId taşımalı; global active tab yanlış hedefe işlem yaptırmamalı. |
| B16 | Doğru hesap paylaşımı | Aynı profilin sekmeleri ilgili origin kurallarına göre cookie/localStorage paylaşmalı. sessionStorage sekme bazında kalmalı; opener davranışı dahil test edilmeli. Bir sekmede logout diğerini etkileyebilir ve bu değişiklik bildirilmelidir. |
| B17 | Ayrı profiller | Kişisel, iş ve agent profilleri ayrılmalı. Cookie, storage, geçmiş, açık sekme bilgisi ve credential kayıtları izin olmadan profiller arasında taşınmamalı. |
| B18 | Agent kimliği ve izinleri | Her agent’ın ayrı erişim anahtarı olmalı; izinli profil, sekme, site ve eylemler browser tarafından denetlenmeli. Başka tabId bilmek erişim sağlamamalı. |
| B19 | Aynı sekmede kontrol sahipliği | Aynı sekmede tek eylem sahibi için süreli lease ve generation kullanılmalı. Diğer agent izinliyse yalnız okuyabilir veya kuyrukta bekler. Hassas girdi beklenirken hedef tab kilitlenmeli; eklenti tarayıcı sahipliğini almamalı. Diğer tab’lar çalışmaya devam edebilmeli. |
| B20 | Farklı sekmelerde paralel iş | Ayrı tab’lardaki işler paralel yürütülebilmeli; kaynak kotaları ve adil sıra uygulanmalı. Aynı hesap üzerinde değişen ortak state için hesap düzeyinde kilit gereken akışlar tanımlanmalı. |
| B21 | Profil düzeyinde işlem koordinasyonu | Login/logout, hesap değiştirme, cookie temizleme, profil kaydetme ve geri yükleme bütün ilgili tab’ları etkilemeli; bunlar profil düzeyinde kilitle yönetilmeli. |
| B22 | İptal ve arıza ayrılığı | Agent kopunca lease sona ermeli; belirsiz gönderilmiş işlem otomatik tekrarlanmamalı. Sekme/worker çökmesinde etkilenen diğer sekmeler açıkça bildirilmelidir. |

Normal web davranışında sessionStorage origin ve top-level sekme bazında ayrılır; localStorage aynı origin üzerinden paylaşılır. Lightpanda bu davranışla conformance testinde karşılaştırılmalıdır. [MDN sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)

## 5. Hesaplar ve giriş

| ID | Tarayıcı bunu sağlamalı | Nasıl yapılmalı ve ne doğrulanmalı |
|---|---|---|
| B23 | Login için gizli veri girişi | Sayfayı açma, alanı bulma ve login akışını yürütme agent’a ait olmalı. İnsan yalnız talep edilen e-posta/parola gibi değerleri eklentiye yazmalı. Örneğin agent e-postayı doldururken parola eklentiden hedef alana uygulanabilmeli; iki değer de gizli istenebilir. |
| B24 | Agent’ın login yapması | Yalnız seçili site ve credential için yetki verilirse giriş alanlarını doldurup gönderebilmeli. Parola bir credentialRef ile host tarafından yerleştirilmeli; model cevabı, trace veya gözlemde görünmemeli. |
| B25 | Veriyle tamamlanabilen doğrulama | OTP gibi metin girdileri aynı eklentiden talep edilebilmeli. Sayfa görmeyi, görsel CAPTCHA çözmeyi veya tarayıcı devralmayı gerektiren adımlar destek dışı olarak durmalı. Passkey gibi ek mekanizmalar motor desteği kanıtlanmadan destekleniyor sayılmamalı. |
| B26 | Kalıcı giriş ve logout | Desteklenen cookie/storage şifreli profilde saklanmalı; yeniden açılış, süre dolması ve revoke/logout sınanmalı. IndexedDB gibi gerekli storage taşınamıyorsa kalıcı login o site için destek dışı olarak bildirilmelidir. |
| B27 | Google girişindeki kapsam sınırı | İnsan kontrollü sistem tarayıcısı veya OAuth paneli bu ürüne eklenmemeli. Agent login akışı ve dar veri girişiyle tamamlanamayan Google akışı desteklenmiyor olarak raporlanmalı. Önceden sağlanan connector yetkileri varsa web login’den ayrı tutulmalı. |
| B28 | Google ile siteye girişin ayrı ele alınması | Gmail web oturumu, üçüncü taraf sitenin Google ile girişi ve bizim uygulamamızın Google API yetkisi farklı akışlardır. Birindeki başarı diğerinin login desteği sayılmamalı. |
| B29 | Giriş durumunun sınırlı taşınması | Kullanıcının seçtiği siteye ait oturumun aktarımı opsiyonel özellik olarak araştırılmalı. Bütün kişisel Chrome profilini içe aktarma varsayılan olmamalı; gerekli cookie/storage, origin ve site desteği ayrı test edilmeli. |
| B30 | Giriş yetkisi ile kullanım yetkisinin ayrılması | Agent’a login yetkisi vermeden hazır oturumu kullanma izni verilebilmeli; login izni de bütün hesap sayfalarında sınırsız gezinme yetkisi sağlamamalı. |

Google’ın sistem tarayıcısındaki OAuth yöntemi önceki araştırmanın alternatifidir; yeni agent odaklı ürün kapsamına insan login arayüzü olarak alınmaz. Ayrıca bir API token’ı web sekmesinde Gmail oturumu sağlamaz. [Google masaüstü OAuth akışı](https://developers.google.com/identity/protocols/oauth2/native-app), [Google API yetkilendirmesi](https://developers.google.com/identity/protocols/oauth2)

Üçüncü tarafın Google ile login akışı bizim OAuth client’ımızla değiştirilemez. Önceden yetkilendirilmiş oturumun kontrollü provision edilmesi araştırılabilir; bunun için insanın bu tarayıcıyı açıp kullanması sağlanmaz. Cookie dosyası yükleyebilmek Google oturumunun çalışacağı kanıtı değildir. UA değiştirme veya güvenlik kontrolünü atlatma login çözümü olarak tanımlanmaz.

Parolayı modelden gizlemek, yetkili agent’ın girişten sonra hesaptaki verilere erişimini kendiliğinden engellemez. Bu erişim B31–B36 politikalarıyla ayrıca sınırlandırılır. Parola site formuna yerleştirildiğinde hedef site kodunun o alanı işlemesi normaldir; garanti model/API/log tarafındaki sızıntının önlenmesidir.

## 6. Site engelleme ve yetkiler

| ID | Tarayıcı bunu sağlamalı | Nasıl yapılmalı ve ne doğrulanmalı |
|---|---|---|
| B31 | Browser genelinde yasak | Yapılandırmada bir domain/origin yasaklandığında hiçbir agent o siteyi açamamalı. Kesin yasakta ilgili açık tab/bağlantılar kapatılıp yeni trafik kesilmeli. |
| B32 | Agent’a özel yasak | Bir agent’a izinli site diğerine yasaklanabilmeli. Yetkisiz agent siteyi açamamalı, gözlemini alamamalı ve hazır login oturumuna erişememeli. Ayrı worker/profile veya aynı güçte izolasyon gerekir. |
| B33 | İzinli site listesi | Global, profil ve agent katmanlarında allow/deny uygulanmalı; global deny daha dar izinle kaldırılamamalı. Domain, alt domain, scheme/port ve canonical URL eşleşmesi net olmalı. |
| B34 | Navigation ile ağ erişimini ayırma | “Bu siteyi açamaz” ve “bu domain’e hiçbir istek gidemez” ayrı kurallar olmalı. Redirect, popup, iframe, fetch/XHR, form action, WebSocket ve desteklenen worker/subresource yolları politika kapsamına girmeli. |
| B35 | Siteye göre eylem yetkisi | Açma, okuma, form doldurma, submit, upload/download, login ve credential kullanımı ayrı verilmeli. Yalnız okunabilir etiketi; GET/POST sınıflamasıyla garanti edilmemeli, site/endpoint sözleşmesiyle doğrulanmalı. |
| B36 | Görülebilir veri ve secret sınırı | Agent’ın HTML, AX, Markdown, event ve hata çıktıları aynı maskeleme/policy katmanından geçmeli. Cookie/token/parola okuma, keyfi JS ve ham CDP agent’a verilmemeli. |
| B37 | Anında izin iptali | Agent anahtarı veya site izni iptal edilince yeni eylem/istek/observation kapatılmalı; stream ve lease sonlandırılmalı. Daha önce gönderilmiş işlem geri alınmış sayılmamalı. |
| B38 | Makine üzerinden denetim ve kayıt | İzinler, revoke, shutdown ve secret içermeyen audit olayları dağıtım yapılandırması ve yetkili kontrol API’siyle yönetilmeli. İnsan için canlı izleme, sekme görüntüleme veya kontrol paneli geliştirilmemeli. |

Site yasağı browser API’sinde adres kontrolü ve motorun ağ çıkışında uygulanmalıdır. Lightpanda proxy yapılandırmasını belgeliyor; bu tek başına aşılmaz yasak kanıtı değildir. Ağ izolasyonu direct bypass’i kapatmalı; proxy/engine filtresi hedefi ve redirect’i doğrulamalıdır. HTTPS CONNECT domain kontrolü URL path’ini göremez; path/endpoint kuralı motorun istek katmanında uygulanmalı, uygulanamıyorsa daha geniş domain engeli veya açık destek sınırı kullanılmalıdır. [Proxy desteği](https://lightpanda.io/docs/guides/configure-a-proxy)

DNS’in özel IP’ye dönmesi, IP ile domain yasağını dolaşma, alt domain, IDN ve redirect testleri gerekir. Agent kimliğinin ağ isteklerine güvenilir bağlanamadığı paylaşımlı worker kullanılmaz; farklı ağ politikaları ayrı worker/proxy kimliğiyle ayrılır. Aynı profile ait farklı izinli agent’lar ortak cookie jar üzerinden birbirinin yetkisini genişletememelidir.

Ham CDP’ye erişen istemci DOM, cookie ve ağ araçlarını kullanarak ürün kontrolünü aşabilir. Yetkili gateway, OS process/socket izolasyonu ve ayrı worker’lar bu nedenle ürünün parçasıdır. Yalnız portu 127.0.0.1’e bağlamak yerel süreçlere karşı tam izolasyon sağlamaz. Mac geliştirme ve Linux dağıtımında bu sınır ayrı doğrulanır. [İlgili upstream CDP erişim raporu](https://github.com/lightpanda-io/browser/issues/3452)

## 7. Agent ve JEV bağlantısı ile kaynak yönetimi

| ID | Tarayıcı bunu sağlamalı | Nasıl yapılmalı ve ne doğrulanmalı |
|---|---|---|
| B39 | Modelden bağımsız agent erişimi | Agent’ların CLI, HTTP/SDK ve MCP erişimi aynı yetki ve tab sözleşmesini kullanmalı. JEV için ayrı browser durumu yaratılmamalı. İnsan bağlantısı yalnız hassas girdi eklentisinin dar endpoint’i olmalı. |
| B40 | Paylaşımın açık seçilmesi | Agent yeni izole profile varsayılan bağlanmalı. Kullanıcı ancak seçtiği profile/tab’a süreli erişim verebilmeli. MCP session ID yetkilendirme yerine geçmemeli. |
| B41 | Sekme ve agent kotaları | Açık tab, paralel iş, heap, yanıt boyutu, ağ bağlantısı ve toplam bellek sınırları olmalı. Limit dolunca yeni iş kontrollü reddedilmeli; bir agent diğerlerini aç bırakmamalı. |
| B42 | Arka plan ve askıya alma | Arka plan tab’ının script/ağ faaliyeti görünür olmalı. Suspend/resume desteği motorla sınanmalı; kapatıp yeniden yüklemek aynı canlı sekmeyi sürdürmek olarak gösterilmemeli. |
| B43 | Kaynak ve uyumluluk raporu | Profil/tab/worker sayısı, süreler, bellek, blocked istekler ve site hataları raporlanmalı. Paylaşımlı motor belleği tab başına kesin bellekmiş gibi bölüştürülmemeli. |

Lightpanda native MCP’nin HTTP oturum yönlendirmesi ve stdio default session davranışı belgelenmiştir. Ürün kendi authenticated MCP gateway’ini kullanmalı; güçlü native araçlar doğrudan açılmamalıdır. [MCP oturum davranışı](https://lightpanda.io/docs/usage/mcp), [araç listesi](https://lightpanda.io/docs/reference/mcp-tools)

## 8. Özelliklerin çalıştığını gösterecek kabul testleri

1. **Sekmeler:** aynı profilde üç tab; bağımsız adres/history/DOM, aynı-origin cookie/localStorage paylaşımı ve sekmeye özgü sessionStorage. Bir tab’daki logout etkisi takip edilir.
2. **Profiller:** iki hesap aynı siteye ayrı profillerden girer; cookie/storage, tab listesi, observation ve credential birbirine sızmaz.
3. **Agent’lar:** üç agent ayrı tab’larda çalışır; aynı tab için iki eylem isteyen agent’tan yalnız lease sahibi ilerler. Hassas girdi bekleyen tab kilitlenirken diğer tab’lar ilerler.
4. **Yasaklar:** yasak domain doğrudan URL, redirect, popup, iframe, fetch ve WebSocket ile denenir; kesin ağ yasağında hedef sunucuya istek ulaşmaz. Agent’a özel yasakta başka agent’ın izni korunurken yetkisiz agent observation alamaz.
5. **Giriş:** agent e-postayı doldurur; insan yalnız parola eklentisine yazar; browser doğru alana uygular ve agent devam eder. Talep başına iptal/timeout, alan değişimi, başka origin’e navigation ve yeniden kullanım reddedilir. Secret’ın bütün agent çıktılarında/loglarda maskelenmesi ve eklentinin gezinme yetkisinin olmaması sınanır.
6. **Gözlem:** dinamik güncelleme sonrası eski ref reddedilir; main/sidebar ayrımı doğru kalır; yasak tab ve secret bütün çıktı formatlarında saklanır.
7. **Kaynaklar:** 1/10/30/60 tab ve agent topolojileri ayrı ölçülür; tab sayısı ile CDP bağlantısı veya bağımsız hesap sayısı eşit varsayılmaz.
8. **Canlı uyumluluk:** mevcut 14 hedef ve dört başarısız GitHub/OSM senaryosu bu ortak tarayıcı API’siyle yeniden çalıştırılır.

9. **İnsan arayüzünün sınırı:** eklenti yalnız kendi giriş taleplerini cevaplayabilir; sayfa metni/DOM/sekme listesi alamaz, URL açamaz, click/submit çağıramaz ve agent yetkisi elde edemez. Rutin input’lar insan talebi oluşturmadan agent tarafından tamamlanır.

## 9. Hassas girdi eklentisinin sözleşmesi

Agent, alanı bulduktan sonra `request_private_input` ile izinli login intent kimliğini ve alan ref’ini belirtir. Browser credential–origin, top-level/frame origin ve form action bağlarını doğrular; amaç metnini güvenilir sabit şablondan üretir. Agent/sayfa serbest metni bildirim amacına dönüşmez. Özel alanlar yapılandırmada da işaretlenebilir; password/OTP gibi alanlar korumalı sınıfa girer. Eklenti her input için açılmaz. Talep yalnız browser policy’sinin izin verdiği alana oluşturulur.

Browser bir defalık requestId üretir; agent kimliği, profil, oturum, tab, frame, documentEpoch, hedef node ve top-level/hedef origin bilgilerini kendisi bağlar. Eklentiye doğrulanmış site kimliği, alan türü ve sabit şablon amacı gönderilir; sayfa içeriği gönderilmez. İnsan değeri yazıp gönderir veya iptal eder.

Değer agent/model transport’undan geçmeden eklentiden güvenilir browser host’una iletilir. Host hedefi ve generation’ı yeniden kontrol eder, alanı doldurur ve yalnız durum sonucunu agent’a bildirir. İnsan form submit etmez; agent izinli akışa devam eder. Talep tamamlanınca, iptalde veya timeout’ta eklenti tamponu ve geçici secret temizlenir; açık saklama politikası yoksa parola kaydedilmez.

Talep beklerken hedef tab’da çakışan eylemler engellenir. Sayfanın kendi script’i alanı değiştirir, frame kaybolur veya navigation olursa istek eskimiş sayılır; değer yeni alana otomatik uygulanmaz. Başka tab/agent talebi ele geçiremez. Eklenti browser motoruna doğrudan CDP ile bağlanmaz; yalnız dar, kimliği doğrulanmış cevap kanalını kullanır. Bu bir Chrome eklentisi gerektiren ikinci tarayıcı tasarımı değil, kendi tarayıcımızın veri giriş modülüdür.

Hassas değer input type değiştirilse dahi korumalı kalır; value attribute, HTML/AX/Markdown, console/error, network trace ve araç sonuçları üzerinden geri okunması engellenir. Sayfanın değeri başka içerikte yansıtması ayrıca test edilir; keyfi sitelerin bütün dönüşümlerini yalnız parola alanını yıldızlayarak güvenle sakladığımız iddia edilmez. Güvenli gözlem sınırı kurulamayan akışta dışarı gözlem aktarımı durdurulur.

İlk geliştirme sırası: agent profil/sekme modeli → site/agent yetkisi ve ağ engeli → DOM gözlemi/etkileşim → hassas girdi eklentisi ve credential koruması → oturum kalıcılığı ve çoklu agent koordinasyonu → canlı site uyumluluğu ve kapasite. Model adaptörleri bu özellikleri kullanan erişim katmanıdır.

## 10. Uygulama ve kabul referansı

B01–B43 için esas teslim aşamaları ve bağımsız T01–T12 testleri [plan §8](BROWSER_PLAN.md#8-b01b43-izlenebilirlik-tablosu) tablosundadır. Yedi aşama plan §6, karar kapıları §7, önerilen sayısal başlangıç değerleri §9’dadır. Bu sınırlar henüz uygulanmış veya ölçülmüş değildir; kabul öncesi manifestte sabitlenir. İnsan için sayfa görüntüleme/gezinme/devralma kapsamı yoktur.

Private input kanalının ayrı eklenti kimliği ve eşleştirmesi, sabit amaç metni, izinli credential/frame/form hedefi, bildirim sınırı ve prompt injection negatif testleri A4/T07–T08 teslimidir. Varsayılan parola saklama sıfırdır; kalıcı credential ve şifreli oturum anahtarı A5’te OS store veya controller-only secret mount’uyla sağlanır. Farklı güven/erişim politikaları ayrı worker/profil gerektirir; 60/500 MB için bu sınır gevşetilemez.
