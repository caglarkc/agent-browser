# Kaynaklar ve kanıt sınırı

Araştırma tarihi: 2 Ekim 2026. Yalnız ürün sahiplerinin resmi dokümanları, resmi kaynak kodu ve platform dokümanları kullanıldı. Aşağıdaki bağlantılar incelenmiş kaynaklardır; MVP kabul testlerinin sonuçları değildir.

| ID | Kaynak | Plandaki kullanım |
|---|---|---|
| S01 | [Lightpanda mimarisi](https://lightpanda.io/docs/core-concepts/architecture-overview) | Engine capability sınırı ve oturum topolojisini doğrulama |
| S02 | [Lightpanda benchmark yöntemi](https://lightpanda.io/docs/core-concepts/benchmarks) | Vendor ölçümü ile ürün kabul ölçümünü ayırma |
| S03 | [Lightpanda serve seçenekleri](https://lightpanda.io/docs/reference/cli/serve) | Bağlantı limitlerini test etme |
| S04 | [Lightpanda Playwright bağlantısı](https://lightpanda.io/docs/usage/cdp/playwright) | Driver capability spike |
| S05 | [Lightpanda lisans dosyası](https://github.com/lightpanda-io/browser/blob/main/LICENSING.md) | P0 dağıtım/lisans kapısı |
| S06 | [Playwright CDP bağlantısı](https://playwright.dev/docs/api/class-browsertype#browser-type-connect-over-cdp) | İki motor için conformance ve driver sınırı |
| S07 | [Playwright context izolasyonu](https://playwright.dev/docs/browser-contexts) | Cookie/storage test referansı |
| S08 | [Chromium süreç mimarisi](https://www.chromium.org/developers/design-documents/multi-process-architecture/) | Veri ayrılığı ve süreç çökme etkisini ayrı değerlendirme |
| S09 | [Linux cgroup v2](https://docs.kernel.org/admin-guide/cgroup-v2.html) | Aggregate bellek, OOM ve swap ölçümü |
| S10 | [Go GC rehberi](https://go.dev/doc/gc-guide) | Controller bellek ayarı ve sınırların yorumu |
| S11 | [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling) | Responses adaptör sözleşmesi ve call-id döngüsü |
| S12 | [OpenAI resmi SDK'ları](https://developers.openai.com/api/docs/libraries) | Go istemci seçimi ve sürüm sabitleme |
| S13 | [Claude tool use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/overview) | Messages adaptörü, tool-result döngüsü |
| S14 | [Claude Go SDK](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/go) | Go istemci seçimi |
| S15 | [Claude browser use](https://platform.claude.com/docs/en/agents-and-tools/tool-use/browser-use-tool) | Native toolset uyumluluğunu ayrı faza bırakma |
| S16 | [Google Sheets izinleri](https://developers.google.com/workspace/sheets/api/scopes) | İlk Google entegrasyonunun dar kapsamı |
| S17 | [Google Desktop OAuth](https://developers.google.com/identity/protocols/oauth2/native-app) | Yerel CLI bağlantı akışı |
| S18 | [Google Web Server OAuth](https://developers.google.com/identity/protocols/oauth2/web-server) | İleride sunucu dağıtımı için ayrı akış |
| S19 | [Google OAuth ve token koşulları](https://developers.google.com/identity/protocols/oauth2) | Test/üretim farkı ve yeniden bağlanma |
| S20 | [Google Sheets kotaları](https://developers.google.com/workspace/sheets/api/limits) | Yazıcı kuyruğu, batch ve backoff |
| S21 | [Gmail izinleri](https://developers.google.com/workspace/gmail/api/auth/scopes) | İlk MVP kapsamından çıkarma gerekçesi |

## Nasıl yorumlanmalı?

- Belgelenmiş capability, seçilecek engine sürümünde başarılı uygulama anlamına gelmez; P0 manifesti ve test sonucu gerekir.
- Vendor benchmarkları farklı görev/topoloji/metriklerle çalışabilir. Bu projedeki 60-session toplam bellek eşiğine doğrudan çevrilmez.
- Teknik eşikler, iş paketleri, araç adları, bellek bütçesi ve süre tahminleri proje tasarımıdır; vendor beyanı değildir.
- Lightpanda lisansının ürün dağıtımına etkisi için burada hukuki sonuç verilmez; pinlenen sürüm ve gerçek dağıtım modeli değerlendirilir.
- API/OAuth belgeleri hesap erişimini, kota tahsisini veya üretim uygunluğunu kanıtlamaz. Gerçek hesap kontrolleri onay sonrası yapılır.
- Sürümler P0'da release/commit SHA ve artifact SHA256 ile kaydedilir. `main` bağlantıları araştırma referansıdır; üretimde değişken branch/nightly kullanılmaz.

## Bu aşamada yapılmış ve yapılmamış işler

Proje klasörü oluşturuldu; plan ve kaynak araştırması yapıldı; ilk taslak bir teknik değerlendirme turundan geçirildi. Ürünün runtime'ı kurulmadı, API-backed uygulama çalıştırılmadı, Google hesabı bağlanmadı. 60-session bellek, performans veya E2E test sonucu henüz yoktur.
