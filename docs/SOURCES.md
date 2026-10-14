# Kaynaklar, kararlar ve kanıt sınırları

Araştırma/revizyon tarihi: **2 Ekim 2026**. v2.0. Birincil dokümanlar ve ürün sahiplerinin depoları kullanılır. Aşağıdaki kaynaklar bu projenin test sonucu değildir. Sayısal ürün eşikleri, görev sözleşmeleri ve süre bütçeleri proje tasarımıdır.

## 1. Kaynak ve kullanım eşlemesi

| ID | Birincil kaynak | Karara katkısı / sınırı |
|---|---|---|
| S01 | [Lightpanda mimarisi](https://lightpanda.io/docs/core-concepts/architecture-overview) | Render/layout sınırı, browser/session mimarisi, mevcut agent/MCP yolları; capability sürümde test edilir |
| S02 | [Lightpanda benchmark](https://lightpanda.io/docs/core-concepts/benchmarks) | Vendor yöntemi ve PSS ölçümü; resident agent + toplam cgroup bütçesine doğrudan aktarılmaz |
| S03 | [Lightpanda serve](https://lightpanda.io/docs/reference/cli/serve) | CDP bağlantı seçenekleri; bağlantı/oturum eşitliği varsayılmaz |
| S04 | [Lightpanda Playwright kullanımı](https://lightpanda.io/docs/usage/cdp/playwright) | CDP uyumluluk adayı; tam Playwright davranışı kanıtı değil |
| S05 | [Lightpanda lisansı](https://github.com/lightpanda-io/browser/blob/main/LICENSING.md) / [raw dosya](https://raw.githubusercontent.com/lightpanda-io/browser/main/LICENSING.md) | AGPL-3.0-only beyanı; gerçek artifact/dağıtım üzerinden değerlendirme gerekir |
| S06 | [Playwright CDP](https://playwright.dev/docs/api/class-browsertype#browser-type-connect-over-cdp) | Native protokol ve CDP kapsam farkı; deneyde yollar ayrı etiketlenir |
| S07 | [Playwright context izolasyonu](https://playwright.dev/docs/browser-contexts) | Cookie/storage testleri; OS güvenlik sınırının yerine geçmez |
| S08 | [Chromium süreç mimarisi](https://www.chromium.org/developers/design-documents/multi-process-architecture/) | Süreç/çökme etkisi; kaynak/izolasyon ölçümü için bağlam |
| S09 | [Linux cgroup v2](https://docs.kernel.org/admin-guide/cgroup-v2.html) | Memory peak/current/events/swap; referans ortamda kernel desteği doğrulanır |
| S10 | [Go GC rehberi](https://go.dev/doc/gc-guide) | Go seçilirse bellek ayarları; toplam runtime hard cap'i değildir |
| S11 | [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling) | Responses araç döngüsü/şema; kesin model desteği gerçek smoke testi ister |
| S12 | [OpenAI SDK listesi](https://developers.openai.com/api/docs/libraries) | Seçilen dile uygun resmi transport adayı; sürüm P0'da pinlenir |
| S13 | [Claude tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) | Messages araç döngüsü; model/tool protokolü sözleşme testi |
| S14 | [Claude Go SDK](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/go) | Go seçilirse aday SDK; dil kararı yerine geçmez |
| S15 | [Claude browser use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/browser-use-tool) | Native toolset ayrı kapsam; projede parity vaadi yok |
| S16 | [Sheets izinleri](https://developers.google.com/workspace/sheets/api/scopes) | drive.file ve dosya düzeyi yetki; satır politikası controller'da |
| S17 | [Desktop OAuth](https://developers.google.com/identity/protocols/oauth2/native-app) | Yerel loopback/PKCE/client tipi; Linux import ayrı operasyon |
| S18 | [Web Server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server) | Sonraki remote web akışını Desktop'tan ayırma |
| S19 | [Google OAuth/token koşulları](https://developers.google.com/identity/protocols/oauth2) | Hesap/test modu ve token yenileme; canlı canary yerine geçmez |
| S20 | [Sheets kotaları](https://developers.google.com/workspace/sheets/api/limits) | Read/write bucket, batch, byte sınırı ve backoff tasarımı |
| S21 | [Gmail izinleri](https://developers.google.com/workspace/gmail/api/auth/scopes) | Gmail'in ilk kapsam dışında tutulmasının bağlamı |
| S22 | [Vercel agent-browser](https://github.com/vercel-labs/agent-browser) | Mevcut native daemon, iki motor, ref/araç yüzeyi; reuse baseline'ı, güvenlik/500 MB kanıtı değil |
| S23 | [Lightpanda agent](https://lightpanda.io/docs/guides/lightpanda-agent-tutorial) | Mevcut model/agent yolu; aynı prompt/loop korunamıyorsa ayrı ürün karşılaştırması |
| S24 | [Lightpanda MCP](https://lightpanda.io/docs/usage/mcp) | Mevcut tool/session yüzeyi; güçlü evaluate yetkisi sınırlanmalı |
| S25 | [Playwright actionability](https://playwright.dev/docs/actionability) | Görünürlük/kararlılık/örtülme/input semantiği için referans |
| S26 | [SQLite transactions](https://www.sqlite.org/transactional.html) | Olgun işlemsel depolama alternatifi; dış servisle atomiklik sağlamaz |
| S27 | [SQLite WAL](https://www.sqlite.org/wal.html) | Checkpoint/reader/yerel filesystem konuları; RAM/disk bütçesi proje ölçümüdür |
| S28 | [SQLite PRAGMA](https://www.sqlite.org/pragma.html) | Durability/cache/foreign-key ayarlarının doğru seçimi ve okunarak doğrulanması |

## 2. Araştırmanın sınırı

Bu revizyonda mevcut backend alternatifleri, actionability, SQLite, provider araç protokolü ve Google OAuth/kota kaynakları gözden geçirildi. Önceki listedeki diğer kaynaklar bağlam olarak korundu; her sayfanın her iddiası yeniden test edilmiş sayılmaz. Belge açıklaması ile seçilmiş binary'nin davranışı farklı olabilir.

`main`/güncel doküman URL'leri değişebilir. P0, seçilmiş release/commit, indirme/artifact SHA256, lisans metni ve inceleme tarihini manifestte saklar. Bugün henüz seçilmemiş sürümler için SHA veya uygunluk sonucu uydurulmaz. Kaynak erişilemiyorsa alternatif resmi raw/mirror kullanımı ve doğrulanamayan alan raporlanır.

Vendor performans oranları bu projenin kabul eşiği değildir. Model kalitesi ve fiyat/kota hesabı için gerçek seçilmiş hesap/model kullanılır; eski benchmark sonucu güncel ürün iddiasına dönüştürülmez. Lisansın kapalı/açık dağıtıma etkisi için burada hukuki sonuç verilmez; ayrı süreç tek başına lisans uygunluğunu belirlemez.

## 3. Mevcut kanıt

- Mevcut: plan v2.0, görev/durum sözleşmeleri, ölçüm protokolü ve bulgu eşlemesi.
- Mevcut değil: kurulu runtime, motor/provider sürüm seçimi, gerçek site izin listesi, canlı model/Google entegrasyonu, G0/G2 ölçüm sonucu.
- Geçerlilik: kaynak kontrolü teknik tasarımı destekler; bütün runtime testleri yapılana kadar NOT_RUN kalır.
