# Teknik değerlendirme ve tek revizyon turu

Tarih: 2 Ekim 2026. Girdi: [v0.1 taslak](archive/MVP_PLAN_v0.1.md). Çıktı: [v1.0 MVP planı](MVP_PLAN.md).

İlk tam taslak, runtime/test ve sağlayıcı/Google entegrasyonu açısından paralel değerlendirildi. Aşağıdaki bulgular tek revizyon turunda final plana işlendi. Bu değerlendirme bir implementation testi veya performans kanıtı değildir.

## Bulgular ve değişiklikler

| ID | Önem | İlk plandaki sorun | Revizyondaki karşılık |
|---|---|---|---|
| R01 | Yüksek | Ölçülmemiş 70/330/50/50 MB dağılımı kesinlik izlenimi veriyor | Dağılım kaldırıldı; P0 base/marginal/payload/restart ölçümünden bütçe çıkaracak (§6) |
| R02 | Yüksek | Scripted soak üretim model transport/history maliyetini atlayabilir | A-runtime üretim yolları + gerçek boyutlu cevaplar; A-live iki gerçek sağlayıcı için ayrı (§6) |
| R03 | Yüksek | Her bellek hatasının tek session'a sınırlanması vaat edilmiş | Session/worker/aggregate limit ayrıldı; shard crash etkisi kapasite/onay raporuna bağlandı (§3, §6, T12) |
| R04 | Yüksek | Observation version sayfanın JS rerender yarışını engellemiyor | Frame/document epoch + node kimliği + action-time doğrulama; node reuse testleri (§4, T04) |
| R05 | Orta/yüksek | Doğrudan CDP'nin lifecycle ve event bakım maliyeti düşük gösterilmiş | Command/event manifesti; RPC/target/frame/cancel kapsamı; P2 süresi artırıldı (§3, §8) |
| R06 | Yüksek | Ağ/sandbox kuralları uygulanabilirlik kanıtı olmadan yazılmış | G0 egress/direct bypass/OS izolasyon koşulu; yardımcı servis belleği dahil (§6, §9) |
| R07 | Yüksek | Görsel profilde minimum teslim ve mixed 500 MB sonucu belirsiz | 1/2 render canvas demo + 59+1/58+2 mixed testi; aşım açık başarısız hedef sonucu (§6, T06) |
| R08 | Orta/yüksek | Toplam %90 küçük örneklemde kategori başarısızlığını saklayabilir | Önceden sabit corpus; kategori/provider skorları; kritik işlerde ≥2/3; örneklem belirsizliği (§7) |
| R09 | Yüksek | P0 motor testi nihai ürün RAM kanıtı gibi okunabilir | G0 uygulanabilirlik/headroom; G2 tüm entegre bileşenlerin kapasite kanıtı (§8) |
| R10 | Yüksek | act(operation,value) şeması anlamsız kombinasyonlar üretebilir | Model için click/fill/select_option/press_key ayrı; ortak action yalnız executor'da (§4) |
| R11 | Yüksek | Go controller için provider transport seçilmemiş | Resmi Go SDK adayları; modül pinleme; HTTP limit/cancel; tek retry sahibi (§5) |
| R12 | Yüksek | Geçmiş sınırı tool-call ve thinking bloklarını bozabilir | Tam assistant/tool-result grupları; yarım SSE ile mutation yok; session-bound response ID (§5, T07) |
| R13 | Yüksek | Desktop loopback ile remote web-server OAuth karışmış | Desktop client + yerel auth CLI + PKCE; Linux runner secret mount; remote web callback ayrı faz (§5) |
| R14 | Yüksek | Secret store soyut; test token expiry koşulu eksik | AES-GCM vault + ayrı master key; plaintext fallback yok; mock/canlı/8.gün testleri ayrı (§5, T08) |
| R15 | Yüksek | Sheets yazılmışken local row kaydı kaybolabilir | Önceden fsync edilmiş job/row/hash journal; pending/verified/conflict ve restart uzlaştırması (§5) |
| R16 | Orta | Batch, kota ve çıktının formül olarak yorumlanması eksik | Tek writer; 2 saniye/20 sonuç önerisi; bounded kuyruk/token bucket; RAW mode (§5, T08) |
| R17 | Yüksek | Fixed row ile eşzamanlı insan düzenlemesi yarışı var | Uygulama yönetimli tablo; manuel row mutation destek dışı; compare-and-write garantisi yok (§5) |
| R18 | Yüksek | 180 saniye job ile 60 dakika soak ilişkisiz; 10 saniye model SLA adil değil | Sabit browser session içinde ardışık kısa job'lar; runtime/live farklı ilerleme ölçütü (§4, §6) |
| R19 | Orta | Kapsam beta büyüklüğünde; DOM/AX semantiği ve finish doğrulaması belirsiz | Vertical slice; sınırlı pointer; observation_kind/capabilities; oracle+Sheets VERIFIED; 6–9 hafta tahmin (§2, §4, §7, §8) |

## Teknik kararların değerlendirmesi

**Lightpanda koşullu aday olarak kaldı.** Mevcut bir motoru değerlendirmek MVP süresini korur; Web API desteği, deployment lisansı ve güvenlik sınırı doğrulanmadan bağımlılık kesinleştirilmez. Chromium başka iş sınıfını karşılar. Görsel fallback'i başka makineye taşıyarak toplam bellek düşük gösterilmez. Lisansın dağıtıma etkisi için hukuki sonuç çıkarmak yerine gerçek sürüm ve dağıtım tercihi G0 girdisidir. [Resmi lisans](https://github.com/lightpanda-io/browser/blob/main/LICENSING.md).

**Go kontrol servisi önerisi korundu.** Tek ortak süreç bellek ölçümünü ve iş yaşam döngüsünü basitleştirir; Go seçimi tek başına küçük RAM garantisi vermez. Rust'a veya engine'ın Zig koduna geçmek henüz ölçülmüş bir gereklilik değildir. Önce controller tabanı ve sıcak yollar profillenir. SDK ve Go runtime tamponları da toplam ölçümdedir.

**Dar CDP yüzeyi korundu, bakım kapsamı büyütüldü.** Tam Playwright eşdeğeri hedeflemek pahalıdır; gerekli küçük yüzeyi manifest ve conformance ile kanıtlamak daha uygulanabilir. Buna karşılık auto-wait/frame/ref/cancel davranışının bedeli uygulama tahminine alındı. Desteklenmeyen komutun sessiz no-op olması başarı sayılmaz.

**Sheets kapsamı korundu, kalıcılık artırıldı.** İlk Google değerini dar bir izinle gösterir. Dosya oluşturmada belirsiz cevap veya kullanıcı müdahalesi gibi durumlarda otomatik exactly-once iddiası yoktur. Token yönetimi ve kalıcı job/row kaydı ilk entegrasyonun parçasıdır; sona bırakılmaz.

**60 oturum / 500 MB hedefi gevşetilmedi.** Bu hedef yapısal iş sınıfının final kabul testinde korunur. Kullanıcının hedefinin görsel/mixed dahil bütün işler için karşılandığı ayrıca kanıt gerektirir. İki gerçek sağlayıcıyla 60-live testi bütçe veya kota yüzünden yapılmazsa koşul açık kalır. 60 boş sekme veya 60 işi küçük havuzda sırayla çalıştırmak eşdeğer kabul değildir.

## Bilerek ertelenen kapsam

SaaS/multi-tenant hosting, billing/dashboard, tam native Claude/GPT computer toolset uyumluluğu, MCP plugin dağıtımı, Gmail ve mevcut bütün Drive dosyalarına erişim, gelişmiş pointer/drag, canlı JS heap migration. Bunlar kullanıcıyla MVP'nin ilk değerini gördükten sonra ayrı önceliklendirilir.

## Açık kalan kararlar ve kanıtlar

- Gerçek hedef siteler/corpus ve dağıtım/lisans tercihi kullanıcı/P0 girdisidir.
- Lightpanda sürümü, Go/CDP/provider SDK sürümleri ve process topolojisi henüz seçilmedi; pinleme P0 teslimidir.
- 500 MB hedefi, egress uygulanabilirliği ve engine uyumluluğu henüz test edilmedi.
- Live API quota/harcama ve OAuth hesap koşulları gerçek hesapta henüz doğrulanmadı.
- Eşzamanlı insan düzenlemesi ve genel internette çok kiracılı güvenlik garantisi MVP kapsamı değildir.

Plan yalnız dokümantasyon olarak teslim edildi. Uygulama ve entegrasyon başlangıcı kullanıcı onayını bekler.
