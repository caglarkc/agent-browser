# Agent Browser Runtime — açık kaynak teknik araştırması

Tarih: 12 Ekim 2026. Karar desteği; performans sertifikası veya kapsamlı güvenlik denetimi değildir.

## 1. Sonuç

**Yeni bir genel amaçlı tarayıcı otomasyon çatısı yazmak için henüz gerekçe yok.** Tarayıcı kontrolü, model araçları, oturum yönetimi, veri çıkarımı ve hatta Sheets iş akışları mevcut projelerde bulunuyor. Bizim savunulabilir ürün iddiamız: belirlenmiş görevlerde bağımsız doğrulanmış sonuç, dış sistemlere güvenilir teslim, arıza sonrası doğru davranış ve bütün bileşenler dahil ölçülmüş kapasite.

Önerilen kısa liste:

1. **agent-browser:** Chromium/Lightpanda yollarını aynı araç yüzeyiyle kıyaslamak için ilk aday.
2. **PinchTab:** Go + HTTP + Chrome oturum yönetimini yeniden yazmadan kullanmak için güçlü aday.
3. **Lightpanda native:** düşük bellek hedefinin gerçek adaylarından biri; agent-browser üzerinden kullanımla ayrı karşılaştırılmalı.
4. **Stagehand ve browser-use:** hazır agent/SDK yolunun geliştirme süresini ne kadar kısalttığını gösterecek rakip taban çizgileri.
5. **Playwright:** uyumluluk ve doğrulama için Chromium referansı.

Bunların hepsini aynı ürüne eklemek önerilmiyor. Önce dar deneyle en fazla iki ürün backend'i seçilmeli. **İncelenen kanıtlarda bizim 60 aktif bağımsız oturum / bütün ürün ≤500 MB / ≥%90 doğrulanmış başarı sözleşmesini karşılayan sonuç bulunmadı.** Bu, hedefin imkânsız olduğunu değil, henüz kanıtlanmadığını gösteriyor.

## 2. Yöntem ve kanıt sınırı

20 ayrı kanonik proje/değerlendirme deposu tarandı; ayrıca Plasmate'in eski bir fork'u kontrol edilip asıl depo bulundu. Sekiz ana adayda seçilmiş kaynak, test veya kaynak yönlendirme dosyaları incelendi. PinchTab, agent-browser ve Lightpanda için yerel kaynak checkout'u; diğer derin adaylarda GitHub ağaçları ve seçilmiş ham dosyalar kullanıldı. Kalan projeler belge/lisans/mimari ön eleme düzeyindedir.

Kanıt türleri:

- **Kod:** işlevin bir implementasyonu görüldü. Çalıştığı veya tüm uç durumları kapsadığı anlamına gelmez.
- **Test:** ilgili test kodu bulundu/okundu. Bu araştırmada testlerin geçtiği iddia edilmiyor.
- **Yayıncı ölçümü:** proje ekibinin sonucu ve yöntemi incelendi; bağımsız tekrar yapılmadı.
- **Ön eleme:** README, lisans ve mimari kapsam incelendi; detaylı kaynak denetimi yapılmadı.

Ücretli model çağrısı, kurulum, repo betiği veya benchmark çalıştırılmadı. Kaynaklar çalıştırılmadan okundu. Disk kapasitesi tam checkout'ları sınırladığı için seçilmiş dosya indirmesine geçildi. Yıldızlar başarı metriği olarak kullanılmadı. GitHub release kaydı, varsayılan dal ve paket registriesindeki dağıtım sürümü birbirinin yerine kullanılmadı.

## 3. Ekosistem haritası

| Proje | Asıl katman / başardığı somut iş | Sınır / bizim kullanımımız | Lisans sinyali |
|---|---|---|---|
| [agent-browser](https://github.com/vercel-labs/agent-browser) | Rust CLI/daemon, snapshot/ref, CDP, farklı motor seçimi | Görev sonucu ve kalıcı teslim bizim sorumluluğumuz; ilk backend adayı | Apache-2.0 |
| [PinchTab](https://github.com/pinchtab/pinchtab) | Go HTTP servisi, Chrome instance/profil/tab yönetimi, agent araçları | Chrome maliyeti devam eder; Go kontrol katmanına doğrudan alternatif | MIT |
| [Lightpanda](https://github.com/lightpanda-io/browser) | Zig/V8 motor, CDP/MCP, native agent, yapısal web işlemleri | Web uyumluluğu ve görsel çıktı sınırlı; hafif yol adayı | Varsayılan AGPL-3.0-only |
| [browser-use](https://github.com/browser-use/browser-use) | Python agent döngüsü, DOM/görsel araçlar, geçmiş ve değerlendirme | Yerel kütüphane ile bulut/özel model sonuçları ayrılmalı | MIT |
| [Stagehand](https://github.com/browserbase/stagehand) | Model destekli act/observe/extract, kodla karışık otomasyon | Güncel main v4 ile v3 belgeleri karıştırılmamalı; güçlü SDK alternatifi | MIT |
| [Skyvern](https://github.com/Skyvern-AI/skyvern) | Görsel agent, workflow ve Sheets blokları | Daha geniş operasyonel kapsam; bulut hizmetleri ayrıca incelenmeli | AGPL-3.0 |
| [Steel](https://github.com/steel-dev/steel-browser) | Chrome session API, CDP, profil/durum ve gözlemleme | Agent akıl yürütmesi veya bağımsız iş sonucu doğrulaması değil | Apache-2.0 |
| [Playwright MCP](https://github.com/microsoft/playwright-mcp) | Playwright araçlarını MCP üzerinden erişilebilir kılar | Kaynak implementasyonu Playwright monoreposuna taşınmış; güvenlik sınırı değil | Apache-2.0 |
| [Playwright CLI](https://github.com/microsoft/playwright-cli) | Coding agent için komut tabanlı tarayıcı kullanımı | MCP'nin tek seçenek olmadığını gösterir; runtime dışı referans | Apache-2.0, API metadata |
| [Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp) | Chrome hata ayıklama ve performans araçları | Geliştirici teşhis aracı; görev kuyruğu/teslim runtime'ı değil | Apache-2.0 |
| [Browserless](https://github.com/browserless/browserless) | Servis olarak tarayıcı, kapasite ve kuyruk yönetimi | Community/Enterprise/Cloud kapsamı farklı; doğrudan izinli lisans grubuna konamaz | SSPL-1.0 veya ticari |
| [Crawl4AI](https://github.com/unclecode/crawl4ai) | Crawl, markdown/veri çıkarımı, bellek uyarlamalı dispatch | Okuma ağırlıklı işler için; concurrency azaltmak 60 canlı oturum kanıtı değil | Apache-2.0 |
| [Firecrawl](https://github.com/mendableai/firecrawl) | Scrape/crawl/extract API ve self-host kodu | Cloud kapsamı yerel kurulumla eşit varsayılamaz | AGPL-3.0 çekirdek; bileşen kontrolü gerekli |
| [chromedp](https://github.com/chromedp/chromedp) | Go üzerinden CDP kontrolü | İnce özel Go katmanı gerekirse temel; agent/workflow değil | MIT |
| [Rod](https://github.com/go-rod/rod) | Go tarayıcı otomasyon kütüphanesi | chromedp'ye alternatif; tek başına ürün değil | MIT |
| [h5i](https://github.com/h5i-dev/h5i) | Rust browser ve web güvenliği araçları; capability bildirimi | Güncel repo daha geniş güvenlik workspace'i; hazır Chromium eşdeğeri varsayılmaz | Apache-2.0 |
| [Plasmate](https://github.com/plasmate-labs/plasmate) | Rust/V8, Semantic Object Model ve CDP alt kümesi | Erken motor alternatifi; 500+ oturum yol haritasında | Apache-2.0 |
| [BrowserGym](https://github.com/ServiceNow/BrowserGym) | Browser agent değerlendirme ortamı | Test altyapısı; runtime veya RAM sonucu değil | Alt paket/dataset lisansı ayrıca kontrol edilmeli |
| [BU benchmark](https://github.com/browser-use/benchmark) | Görev/rubrik, runner ve judge | Kütüphane başarısıyla benchmark runner başarısı aynı şey değil | API lisans alanı boş; yeniden dağıtım için kontrol gerekli |
| [Lightpanda agent-benchmarks](https://github.com/lightpanda-io/agent-benchmarks) | Aynı modelle farklı araç yüzeyi kıyaslamaları | Yayıncı koşuları, küçük split ve uzun timeout; bizim kabul yerine geçmez | Apache-2.0 |

Lisans sütunu mimari eleme içindir; transitif bağımlılıkları, dataset şartlarını veya ürün dağıtımının bütün yükümlülüklerini kapatmaz.

## 4. Derin inceleme

### 4.1 PinchTab — özel Go kontrol servisine en doğrudan alternatif

**Vaat ve gerçek yapı:** Chrome'u Go HTTP API ile yönetmek, agent'a daha küçük çıktılar vermek ve birden fazla instance/profil/tab organize etmek. `internal/session` içinde grant/store/lifecycle kodu ve concurrency/race testleri; `internal/bridge` içinde eylem ve snapshot uygulamaları var. Bu kapsam yalnızca örnek bir CLI değil.

**Somut kritik bulgular:**

- `POST /actions` ve `/macro` alt adımlar başarısız olsa da HTTP 200 dönebiliyor. Adaptör `failed` sayısını ve her adımın `success/code/error` alanını değerlendirmeli. HTTP başarısı görev başarısı olamaz. [Endpoint sözleşmesi](https://github.com/pinchtab/pinchtab/blob/a62662027f233444c579c29fbe42ad90df0d5bc7/docs/endpoints.md#L226)
- Güncel kod Chrome process ağacı RSS'sini ve CDP `Performance.getMetrics` ile sayfa sayaçlarını ayrı topluyor. Yanıt vermeyen target'ları ayrıca sayıyor. Arama indeksindeki eski “heap tahmini” belgesi güncel kaynakla uyuşmuyor. Bununla birlikte tab metrics endpoint'i instance toplamını gösteriyor; tab başına RAM diye toplanamaz. RSS toplamı da ürün cgroup ölçümünün yerine geçmez. [Ölçüm kodu](https://github.com/pinchtab/pinchtab/blob/a62662027f233444c579c29fbe42ad90df0d5bc7/internal/bridge/observe/metrics.go)
- Host allowlist ilkelinde boş liste izinli kabul ediliyor. Ürünümüz explicit deny-by-default istiyorsa bu davranışı konfigürasyon/üst politika kapatmalı. Tek host eşleştirme fonksiyonu, ağ izolasyonunun bütününü kanıtlamaz. [Kod](https://github.com/pinchtab/pinchtab/blob/a62662027f233444c579c29fbe42ad90df0d5bc7/internal/security/allowlist.go)

**Başarı kanıtı:** Yayıncı token benchmark'ında maliyet avantajı yaklaşık %9,5–20,3; ancak koşul başına n=2–5, geliştiriciyle birlikte tasarlanmış fixture'lar ve yüksek varyans var. Güzel mühendislik sinyali; genel saha üstünlüğü değil. Küçük binary, Chrome dahil küçük bellek anlamına gelmiyor. [Yöntem ve sınırlamalar](https://github.com/pinchtab/pinchtab/blob/a62662027f233444c579c29fbe42ad90df0d5bc7/docs/benchmark.md)

**Karar:** P0'da mutlaka yer almalı. Yeni bir Go oturum/orchestration servisi yazmadan önce bu çözümün eksikleri ölçülmeli.

### 4.2 agent-browser — motor kıyaslaması için en temiz başlangıç

**Kodda görülen:** Rust native browser katmanı engine seçimini yönetiyor; Lightpanda için ayrı launch/initialize yolu, target discovery timeout'ları ve hata sonrası bağlantı temizleme testleri var. Chrome'a özel seçenekler Lightpanda yolunda erken reddediliyor. Özellikle profile, storage-state, headed, extension ve WebGPU eşdeğerliği varsayılmıyor. [Browser uygulaması ve testleri](https://github.com/vercel-labs/agent-browser/blob/d9570915f4dd6504dee4070379d2c4f79d81dbb2/cli/src/native/browser.rs)

**Teknik kazanım:** Aynı komut/araç yüzeyiyle motor değiştirebilmek, motor kazancını model/prompt kazancından ayırmamızı kolaylaştırır. CLI'nin arkasındaki daemon ve browser süreçleri bellek hesabına dahil edilmeli. Bir CLI çağrısının tamamlanması iş verisinin doğru olduğunu göstermez.

**Risk:** Storage-state ve profile destek farkı, “hata olunca başka motora kaldığı yerden geç” yaklaşımını zorlaştırır. Fallback yeni bir oturum/yeniden kimlik doğrulama gerektirebilir; yazma işleminden sonra otomatik tekrar mükerrer işlem yaratabilir.

**Karar:** İlk backend ve karşılaştırma aracı için güçlü aday. Kendi CDP driver'ımızı yazma ihtiyacını azaltıyor. Ayrı task verifier/outbox yine gerekli.

### 4.3 Lightpanda — hafıza açısından umut verici; web eşdeğerliği koşullu

**Kodda görülen:** Ayrı motor, native MCP ve agent modülleri mevcut. Güncel kodda `screenshot.zig` metin yerleşiminden PNG üretimi yapıyor; README PNG/PDF'yi text-only rendering olarak tanımlıyor. Bu “screenshot fonksiyonu yok” şeklindeki eski varsayımı düzeltir; fakat CSS/canvas/video görsel doğruluğu kabulünü karşılamaz. [PNG uygulaması](https://github.com/lightpanda-io/browser/blob/44e378d6113d40a6ef1e66ff8b27e1da34ef1647/src/browser/screenshot.zig), [güncel README](https://github.com/lightpanda-io/browser/blob/44e378d6113d40a6ef1e66ff8b27e1da34ef1647/README.md)

**Bellek kanıtı:** Yayıncı demo crawler'ı 933 URL üzerinde 25 Lightpanda process için 123M, 100 process için 410,2M tepe PSS raporluyor; Chrome karşılığı farklı process/tab topolojisi kullanıyor. Campfire deneyi ise seçilmiş bir sayfanın 100 yüklemesi. Ölçümler 100 ms örneklemeli; bütün runtime cgroup'u, 60 oturumun uzun süreli işi, model geçmişi veya teslim deposu dahil değil. Bu sonuçlar adaylığı destekler, bizim RAM kabulünü geçirmez. [Benchmark yöntemi](https://github.com/lightpanda-io/demo/blob/main/BENCHMARKS.md)

**Agent kanıtı:** `agent-benchmarks` aynı modelle farklı motor/araç yüzeylerini ayırıyor. Küçük AssistantBench ve GAIA split'lerinde iyi yayıncı sonuçları bulunuyor; koşular 1800 saniyeye kadar izin veriyor. Aynı repodaki 448 görevlik WebBench READ pilotu %25,4; üstelik kanonik WebBench judge'ı değil. Dolayısıyla tek yüksek skor “genel webde ≥%90” demek değil. Mayıs araç kıyasındaki “agent-browser MCP sunmuyor” gibi tarihsel açıklamalar da bugünkü kaynak için kullanılmamalı. [Değerlendirme deposu](https://github.com/lightpanda-io/agent-benchmarks)

**Karar:** Lightpanda native ile agent-browser+Lightpanda ayrı deney olmalı. Uyumluluk başarısızlıkları paydadan çıkarılmamalı. Gerçek görsel işler için Chromium yolu korunmalı.

### 4.4 browser-use — hazır agent döngüsü; başarı alanına dikkat

**Kodda görülen:** Agent döngüsü, araç kaydı, geçmiş, model değerlendirmesi ve browser lifecycle/security watchdog'ları var. Ayrı judge varsayılan olarak etkin; ayrıca model belirtilmezse ana model kullanılıyor. `_judge_and_log` açıkça judge sonucunun agent'ın `last_result.success` bildirimini değiştirmediğini söylüyor. [Agent kodu, özellikle 1593–1645](https://github.com/browser-use/browser-use/blob/c75e8476e26d18b7617643bc2ae082fae8eae431/browser_use/agent/service.py#L1593)

**Ürün etkisi:** `success=true` bizim bağımsız doğrulama kapımızı geçirmez. Judge verisi ayrı okunmalı; R2 gibi dış yazmalarda yetkili sistemden alınmış sonucun doğrulanması gerekir. Domain/IP kontrol kodu ve testleri olumlu; navigation sonrası redirect kontrolü görmek bütün outbound trafiğin önceden kesildiğini kanıtlamaz. [Security watchdog](https://github.com/browser-use/browser-use/blob/c75e8476e26d18b7617643bc2ae082fae8eae431/browser_use/browser/watchdogs/security_watchdog.py)

**Benchmark ayrımı:** Güncel BU Bench V2.1 200 görev kullanıyor. Runner BrowserCode ve model ayarlarıyla çalışıyor; önceki 60 görevlik alt küme grafiğiyle doğrudan kıyaslanamaz. Browser-use Python paketini kurmak aynı model, bulut tarayıcı, fetch hizmetleri ve judge bileşimini elde etmek değildir. [Benchmark](https://github.com/browser-use/benchmark), [runner](https://github.com/browser-use/benchmark/blob/1e0e2f1ed12d3dfbdfab6b7bff415ec090ff9f74/bcode_runner.py)

**Operasyonel risk sinyali:** [#5067](https://github.com/browser-use/browser-use/issues/5067) renderer crash sonrası toparlanma şikâyeti içeriyor. Bu bağımsız yeniden üretilmiş veya güncel commit'te kesin mevcut bir hata diye sunulmuyor; crash-injection testini seçmek için ipucu.

**Karar:** Özel agent loop yazmaya karşı kuvvetli baseline. İlk ürünün Python bağımlılığını kabul edip etmemek ölçüm ve operasyon kararı olmalı.

### 4.5 Stagehand — güncel mimari önceki v3 anlatısından farklı

**Kaynak bulgusu:** İncelenen main README v4 quickstart ve TypeScript/Python/Go SDK'ları gösteriyor. TS `Stagehand.create` bir browser handle'ı alıyor, RPC client kuruyor. Browser yanında çalışan extension ve onun CDP katmanı mevcut. Bu nedenle eski v3 kurucu/API/klasör örnekleri güncel main uygulamasıyla karıştırılmamalı. [SDK](https://github.com/browserbase/stagehand/blob/f261c38b4dc50c39485f924e8599c1d3c6e37dc7/packages/sdk-ts/src/stagehand.ts), [CDP](https://github.com/browserbase/stagehand/blob/f261c38b4dc50c39485f924e8599c1d3c6e37dc7/packages/extension/understudy/cdp.ts)

**Somut değer:** Kodun bildiği adımları deterministik çalıştırıp belirsiz alanlarda act/observe/extract kullanmak mümkün. Schema doğrulaması çıktı biçimini denetler; verinin gerçeğe uygunluğunu tek başına denetlemez. Cache servisinde hata durumunda normal yürütmeye dönüş var; cache hit, dış yazmanın tekrar edilmemesi garantisi değildir. [Cache servisi](https://github.com/browserbase/stagehand/blob/f261c38b4dc50c39485f924e8599c1d3c6e37dc7/packages/extension/services/cacheService.ts)

**Sürüm riski:** GitHub releases örneklemi v3 paketlerini gösterirken main v4'e yöneliyor. Bu taramada npm/PyPI dağıtımlarının tamamı doğrulanmadı. Deney öncesi paket sürümü, extension/protocol ve commit birlikte sabitlenmeli.

**Karar:** Tekrarlanan görevler için kuvvetli SDK adayı. Yeni agent mimarisi yazmadan bu yaklaşımın yeterliliği ölçülmeli. Yerel Chrome ve Browserbase bulut ekleri ayrı bütçelenmeli.

### 4.6 Skyvern — ürün kapsamı bizim fikre düşündüğümüzden yakın

**Kodda görülen:** Agent uygulaması, workflow modelleri ve doğrudan Google Sheets read/write blokları mevcut. Dolayısıyla Sheets entegrasyonu tek başına yeni bir ürün farkı değil. [Sheets blokları](https://github.com/Skyvern-AI/skyvern/blob/f5f3f28a9ce0021a1db24286928a7bff6582a1eb/skyvern/forge/sdk/workflow/models/google_sheets_blocks.py)

**Değerli hata semantiği:** Kod, yazılan aralık istenenden farklıysa işlemin dış sistemde zaten gerçekleştiğini ve append tekrarının satırları tekrar ekleyebileceğini açıklıyor. Bu, başarısız yanıtın “hiçbir şey olmadı” anlamına gelmediğine somut örnek. Bizim outbox ve unknown-outcome tasarımımız burada değer taşıyor; mevcut connector'ı almak bu sorumluluğu ortadan kaldırmıyor.

**Sınır:** Workflow/agent/görsel otomasyon kapsamı geniş; bunu düşük bellek daemon'uyla eşitlemek yanlış. Cloud'un proxy/CAPTCHA/anti-bot paketini self-host çekirdeğin özelliği gibi saymamalıyız. README'deki WebBench %64,4 sonucu yayıncı iddiasıdır; bu araştırmada runner koşulları ve sonuç dosyaları uçtan uca yeniden doğrulanmadığından sıralama için kullanılmadı. [Repo](https://github.com/Skyvern-AI/skyvern)

**Karar:** İş akışı ürününe dönüşmek istersek güçlü hazır alternatif; dar 500 MB runtime için doğrudan varsayılan temel değil.

### 4.7 Steel — tarayıcı altyapısını agent'tan ayırıyor

**Kodda görülen:** Session service içinde profil yolu, persist, cookies/localStorage, proxy, cihaz ve tarayıcı seçenekleri; session storage kodunda kalıcı saklama mekanizması bulunuyor. Seçilmiş test dosyası da var. Bunlar Chrome session API'sinin somut implementasyonu; yalnızca bulut landing page'i değil. [Session service](https://github.com/steel-dev/steel-browser/blob/1131a0222a27f391bf8f27cca6f278ddf7ace8dd/api/src/services/session.service.ts), [storage](https://github.com/steel-dev/steel-browser/blob/1131a0222a27f391bf8f27cca6f278ddf7ace8dd/api/src/services/leveldb/sessionstorage.ts)

**Sınır:** Session persist etmek, görev checkpoint'i veya dış yazma idempotency'si değildir. Chrome, API, kayıt ve yardımcı süreçler toplam maliyete girer. Bu taramada 60 bağımsız aktif session'ın tek kurulumda kaynak profili doğrulanmadı.

**Karar:** Uzaktan tarayıcı servisi/profil/gözlemleme önceliği artarsa kısa listeye alınır. İlk dar P0'da PinchTab/agent-browser ile aynı anda bütün özelliklerini entegre etmek gereksiz.

### 4.8 Playwright MCP / CLI — referans, ürünün tamamı değil

MCP deposunun `src/README.md` dosyası implementasyonun Playwright monoreposunda olduğunu açıkça söylüyor; küçük depo boyutunu az kod/eksik ürün kanıtı saymak yanlış. Bu araştırmada wrapper, bağımlılık ve test yüzeyi incelendi; monorepodaki tüm implementasyon incelenmedi. [Kaynak yönlendirmesi](https://github.com/microsoft/playwright-mcp/blob/b8b4183e099f136cbec0388a6088d4aa2f6b9685/src/README.md)

README, allowed/blocked origin ayarlarının güvenlik sınırı olmadığını ve redirect'leri kapsamadığını belirtiyor. Persistent profil paylaşımında eşzamanlılık sınırlamalarını da dikkate almak gerekiyor. CLI+skills alternatifini aynı proje özellikle öneriyor; “agent entegrasyonu mutlaka MCP olmalı” varsayımı gereksiz. [Dokümantasyon](https://github.com/microsoft/playwright-mcp)

**Karar:** Chromium doğruluk/uyumluluk referansı. Ağ sınırı için ayrıca işletim sistemi/container düzeyinde kontrol; ürün için ayrıca task/verifier/delivery katmanı gerekir.

## 5. Ön elemedeki diğer projelerden alınacak dersler

- **Crawl4AI:** Çok sayfalı okuma işlerinde markdown/extraction ve memory-adaptive dispatcher hazır. Kaynak azalınca eşzamanlı işi azaltmak kullanışlıdır; sözleşmemizde 60 resident session'ı sessizce küçük havuza düşürmenin yerine geçmez. [Repo](https://github.com/unclecode/crawl4ai)
- **Firecrawl:** Agent'a temiz web verisi sağlamada ciddi hazır kapsam var. API erişimi yeterliyse tarayıcı otomasyonunu tamamen ortadan kaldırabilir. README'deki “webin %96'sı” söylemi bizim görev evrenimizde %96 başarı veya self-host eşdeğerliği diye alınmamalı. [Repo](https://github.com/mendableai/firecrawl)
- **Browserless:** Pool/queue/session kapasite yönetiminde referans. Queue'da bekleyen istek canlı browser session değildir. SSPL/ticari lisans sınırı MIT/Apache adaylarından farklı değerlendirilmelidir. [Lisans ve ürün katmanları](https://github.com/browserless/browserless)
- **Chrome DevTools MCP:** Sorun analizi, network ve performans incelemesinde kullanışlı; production task lifecycle tasarımının yerine geçmez. [Repo](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- **chromedp / Rod:** Go seçilirse CDP taşıma/protokol katmanını yeniden yazmamak için araçlar. İlk etapta mevcut servislerin üzerine adaptör daha az bakım getirebilir. [chromedp](https://github.com/chromedp/chromedp), [Rod](https://github.com/go-rod/rod)
- **h5i:** `Capabilities` yapısı script çalıştırmanın konfigürasyona bağlı olduğunu açıkça bildiriyor. Ürünümüz de “motor destekliyor olabilir” yerine çalışma anındaki gerçek yetenekleri raporlamalı. Kendi motorunun canvas/JS modülleri bulunması tam web uyumluluğu kanıtı değil. [Capability kodu](https://github.com/h5i-dev/h5i/blob/d98074c2a03acdb9a42b289bc20f6cd5530a6573/crates/h5i-browser/src/lib.rs)
- **Plasmate:** Asıl repo `plasmate-labs/plasmate`; `dbhurley/plasmate` fork. SOM sıkıştırması ilginç. Yayınlanan byte oranları 98 denemede başarılı 82/83 girdi üzerinden; bunlar token, maliyet veya görev başarısı oranı değil. 500+ paralel session hâlâ işaretlenmemiş roadmap maddesi. Ana motor adayı yerine izleme/deney kuyruğuna alınmalı. [Kanonik repo](https://github.com/plasmate-labs/plasmate)
- **BrowserGym:** Ortam/görev/başarı ölçütünü agent'tan ayırma yaklaşımı alınmalı. Her dataset'in lisans ve kullanım koşulları ayrıca geçerli. [Repo](https://github.com/ServiceNow/BrowserGym)

## 6. Benchmark'ları neden tek liderlik tablosuna koymadım?

| Sayı/iddia | Gerçekte ölçülen | Bizim için kanıtlamadığı |
|---|---|---|
| Lightpanda 123M / 410,2M | Demo crawler, 25/100 process, peak PSS | 60 gerçek oturum + model geçmişi + store + proxy + verifier toplamı |
| PinchTab %9,5–20,3 daha düşük maliyet | Seçilmiş fixture/model/skill kombinasyonunda az sayıda tekrar | Her sitede ve yeni agent-browser sürümünde aynı avantaj |
| LP agent yüksek GAIA/AssistantBench oranları | Küçük split, belirli model, uzun timeout | Bizim 150 saniye p95 ve %90 görev kabulümüz |
| LP WebBench READ %25,4 | Farklı modelle metin judge'lı pilot | Kanonik WebBench skoru veya motorun tek başına başarısı |
| Browser-use eski 60 görev grafiği | Belirli geçmiş alt küme/stack | Güncel 200 görev runner'ı veya yerel Python paketinin başarısı |
| Plasmate yaklaşık 9–10x byte oranı | Başarılı sayfalarda serialized output küçülmesi | Token tasarrufu, %90 doğruluk veya yüksek oturum kapasitesi |
| Küçük Go/Rust binary | Diskte çalıştırılabilir dosya boyutu | Chrome dahil resident memory |

Her karşılaştırmada motor sürümü, agent kodu, model, prompt/skill, görev kümesi, timeout, judge, ağ/proxy ve cache birlikte kaydedilmeli. Bilinmeyen alanlar boş bırakılmalı; tahmini puanla sıralama yapılmamalı.

## 7. Mevcut plana etkisi

### Korunacak kararlar

- 60 session / 500 MB iddiasını ölçülecek kabul koşulu olarak tutmak.
- Yapısal ve gerçek görsel görevleri ayrı profillerde değerlendirmek.
- Session, execution ve delivery durumlarını ayırmak.
- Agent'ın başarı bildiriminden bağımsız verifier.
- Belirsiz dış yazma sonucunda kör retry yapmamak; kalıcı intent/outbox kullanmak.

### Araştırmanın getirdiği düzeltmeler / yeni karar girdileri

1. PinchTab P0 kısa listesine açıkça eklenmeli; Go kontrol servisi kurma kararı ertelenmeli.
2. Stagehand main artık v4 yaklaşımı gösteriyor; v3 belgeleriyle PoC yapılmamalı. Paket/release/commit eşlemesi önce çözülmeli.
3. Lightpanda için “hiç görüntü üretemez” denmemeli; “metin tabanlı çıktı, gerçek görsel eşdeğerlik yok” denmeli.
4. Sheets entegrasyonu farklılaştırıcı iddia olmamalı; Skyvern'in connector kapsamı karşılaştırma girdisi olmalı.
5. Agent success, judge verdict ve yetkili sistem doğrulaması üç ayrı alan olmalı.
6. Tek motordan diğerine fallback, oturum taşıma ve dış işlem tekrarının semantiğiyle birlikte test edilmeli.
7. MCP zorunlu taşıma olmamalı; CLI/HTTP/SDK yolları aynı görev sözleşmesine adapte edilebilmeli.
8. Kendi ince katmanımızın değeri “başka bir browser API” olmamalı; güvenilir iş tamamlama ve ölçülebilir kaynak kontrolü olmalı.

Bunlar araştırma önerileridir; bu turda kabul eşikleri değiştirilmedi ve implementasyon başlatılmadı.

## 8. Takip deneyleri — araştırmadan ölçüme geçiş

Önceki 8 geliştirici günlük P0 sınırını bütün ekosistemi kurarak tüketmemek için iki aşama öneriyorum.

**Aşama A: model kullanmadan uyumluluk ve kaynak elemesi.** Aynı fixture ve seçilmiş gerçek sayfalarda Chromium/Playwright referansı; agent-browser+Chromium; agent-browser+Lightpanda; Lightpanda native; PinchTab+Chrome. Navigate/snapshot/fill/read, cookie isolation, redirect/iframe, timeout ve crash temizleme denenir. Desteklenmeyen özellikler açık hata olmalı. Veri dışarı çıkış testleri controlled endpoint'lerle yapılır. Her lane'de tam process ağacı ve cgroup kaydı tutulur.

**Aşama B: agent davranışı.** A'da geçen en fazla iki backend aynı model/prompt/bütçeyle karşılaştırılır. Hazır loop'un getirisini ölçmek için browser-use veya Stagehand'den yalnız biri eklenir. Model harcaması için bütçe belirlenmeden canlı koşu başlatılmaz. Görev sayısı, tekrar sayısı ve kabul paydası mevcut ACCEPTANCE.md ile uyumlu olmalı; küçük smoke sonucu final kabul sayılmaz.

**Özellikle gereken hata enjeksiyonları:**

- PinchTab HTTP 200 içinde başarısız step.
- Agent success=true ama judge veya bağımsız verifier başarısız.
- Dış yazma tamamlandıktan sonra bağlantı kesilmesi.
- Browser/renderer crash; kalan süreçlerin temizlenmesi.
- Lightpanda'dan Chromium'a geçişte auth/session kaybı.
- Allowlist dışı redirect/subresource ve özel IP hedefleri.
- Bellek ölçümünde okunamayan target ve yavaş toplanan metrik.
- 60 boş session yerine gerçek resident iş yükü; uzun koşuda büyüme.

**Çıkış kararı:** Uyumluluk+doğruluk iyi, RAM başarısızsa kapasite hedefini düşürmek veya workload'u daraltmak açık ürün kararıdır. Daha az session çalıştırıp aynı hedefi geçmiş göstermek kabul edilmez. Hazır çözüm ihtiyacı karşılıyorsa özel runtime kapsamı küçültülür. Özel kod yalnız ölçülmüş eksiklere yazılır.

## 9. Sürüm ve yeniden izlenebilirlik

`EVIDENCE_MANIFEST.json` her repo için erişim tarihi, lisans metadata'sı, mevcutsa incelenen commit/tree SHA, kaynak dosya hash'leri ve GitHub release örneklemini içerir. README'ler ilk erişimde varsayılan daldan, seçilmiş kodlar SHA üzerinden alındı; hash'ler erişilen içeriği ayırt eder. Üç tam checkout'un SHA'ları doğrudan git HEAD'den alındı. Kaynak indirmelerinde kullanılan ref SHA'ları ayrıca commit API ile eşleştirildi; bağlantılarda commit SHA'ları kullanıldı. Git tree nesnesinin ayrı SHA'sı manifestte ayrıca tutuldu.

| Proje | İncelenen kaynak ref'i | GitHub releases API'de görülen örnek |
|---|---|---|
| PinchTab | a62662027f23 | v0.15.2, 26 Ağustos |
| agent-browser | d9570915f4dd | v0.39.0, 9 Ekim |
| Lightpanda | 44e378d6113d | 1.0.0, 2 Ekim |
| browser-use | c75e8476e26d | 0.13.11, 7 Ekim |
| Stagehand | f261c38b4dc5 | v3 paket release kayıtları; main v4 |
| Skyvern | f5f3f28a9ce0 | v1.0.55, 1 Ekim |
| Steel | 1131a0222a27 | v0.5.4-beta, 25 Ağustos; tag beta, API prerelease=false |
| Playwright MCP | b8b4183e099f | v0.0.83, 28 Eylül |

Bu tablo “tüm package registriesinde en son kararlı sürüm” tablosu değildir. Kaynak incelemesi, sürüm yayınlama sinyali ve yeniden çalıştırılmış test sonucu ayrı tutulmuştur.
