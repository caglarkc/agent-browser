# Browser karşılaştırma laboratuvarı

Bu ortam, JEV/Laya'nın piksel yerine küçük bir işlem tablosuyla tarayıcı kullanmasını sınar. Ana ürün runtime'ı veya 60 oturum kapasite doğrulaması değildir.

Güncel deney kapsamı, aşamalar ve yorum sınırları: [JEV test protokolü](JEV_TEST_PROTOCOL.md).

## Araştırma hızı ve RAM

[Performans sonuçları](PERFORMANCE_RESULTS.md): sıralı 180 kontrol deneyi ve 60 belge araştırma deneyi; screenshot/OCR, Chromium DOM ve görselsiz Lightpanda yolları. Soğuk/hazır oturum, süre bileşenleri, RSS ve native footprint ayrı ölçüldü.

## JEV ile kapsamlı doğrulama

[Sonuç ve karar raporu](JEV_RESULTS.md): 830 senaryoluk üç ana deney ve 6 gerçek-site okuma kontrolü; görselsiz Lightpanda + bağımsız doğrulayıcı ile son core koşusu 90/90. Genel site uyumluluğu sınırları raporda ayrı gösterilir.

## İlk doğrulama — 13 Ekim 2026

- `npm test`: 5/5 PASS; stale hedef, örtülme, CSS görünürlüğü, typed cevap ve bağımsız oracle kontrolleri.
- `doctor`: Chromium ve Lightpanda PASS; anahtarın değeri gösterilmeden mevcut olduğu doğrulandı.
- [Son ücretsiz fixture koşusu](../benchmarks/results/2026-10-13T13-34-20-392Z/REPORT.md): 33 case; 26 PASS, 5 FAIL, 2 UNSUPPORTED. Rendered Chromium 11/11; Chromium semantic 8 PASS + 2 FAIL + 1 UNSUPPORTED; Lightpanda semantic 7 PASS + 3 FAIL + 1 UNSUPPORTED.
- CSS-hidden ve pointer testleri iki semantic yolda başarısız; Lightpanda iframe gözleminde child frame görünmüyor (`contentDocument` yok ve CDP yalnız ana frame'i sunuyor). Bu pinlenmiş motor/driver bileşiminin bulgusudur; tüm sürümlere genellenmez.
- [Son canlı JEV menü koşusu](../benchmarks/results/2026-10-13T13-31-36-475Z/REPORT.md): üç profil 3/3 PASS, toplam 9 API çağrısı. Önceki 12 çağrılı koşu tekrar eden menü seçimi nedeniyle FAIL oldu; geçmiş aksiyonların karar girdisine eklenmesi sonrası yeni koşu başarılı. Her iki koşu saklandı; hazırlık boyunca toplam **21 canlı çağrı** yapıldı. Maliyet faturası hesaplanmadı.
- Son fixture koşusunda app console/page error ve cleanup hatası yok. İlk canlı koşuların Chrome console kaydında yalnız favicon 404 vardı; fixture server daha sonra 204 cevabı verecek şekilde düzeltildi.
- Form screenshot'ı masaüstü 1000×700 viewport'ta kontrol edildi: Ada, Research, terms ve Saved doğru. Mobil tasarım/gerçek siteler test edilmedi.
- Laya protokol bağlantısı hazır, gerçek Laya inference **NOT_RUN**. Üç tekrar benchmark ve Linux kapasite testi **NOT_RUN**.

## Kurulu ortam

- macOS arm64; Node 25.8.2; sistem Chrome 155.0.8059.40.
- Puppeteer Core sürümü package-lock.json ile sabittir.
- Lightpanda 1.0.0 macOS arm64 binary'si `bin/lightpanda` altında. SHA-256: `955440053a84754dd64c62f970449a56a2b350cdf43ea5f2e809a73047b8173d`.
- Browser plugin/skill katalogda bulunmadığı için düzenli Puppeteer/CDP otomasyonu kullanıldı; karşılaştırma da doğrudan bu driver'ı gerektirir.

## Dört deney yolu

| Profil | Motor | Gözlem ve etkileşim |
|---|---|---|
| chromium-rendered | Chrome headless | DOM/etiket tablosu; layout, örtülme kontrolü; gerçek mouse/keyboard girdisi |
| chromium-semantic | Aynı Chrome | Aynı temel tablo; koordinatsız DOM aktivasyonu ve input/change; modelde görüntü yok; motorun grafik hattı hâlâ var |
| lightpanda-semantic | Lightpanda | Aynı koordinatsız gözlem/yürütme; gerçek grafik hattı yok |
| lightpanda-enhanced | Lightpanda | CSS style ile görünürlük eleme ve sentetik pointer olayları; gerçek grafik hattı yok |

Chromium semantic / Lightpanda semantic aynı uygulama sözleşmesini karşılaştırır. Chromium rendered / semantic işlem anlamı farkını da değiştirir; bu fark yalnız motor hızına atfedilemez. Görselsiz tabloda visibility alanı **unknown-without-layout** olarak işaretlenir; gizli öğeler görünür varsayılmaz. Gözlem okuyucusu tam accessible-name algoritması değildir.

## Çalıştırma

```sh
cd agent-browser/lab
npm ci --ignore-scripts
npm run install:lightpanda
npm test
npm run doctor
npm run smoke
```

`doctor`, fixture/karar doğrulama testleri ve `smoke` ücretli API çağrısı yapmaz. Güncel `smoke` 14 görev × 4 profil çalıştırır. Bazı boundary testlerinde FAIL veya UNSUPPORTED beklenebilir; bunlar silinmez ve uyumluluk başarı oranını düşürür. Herhangi bir FAIL komutun çıkış kodunu 1 yapar; bu runner'ın bozuk olduğu anlamına gelmez. Doctor veya contract test hatası ise altyapı sorunudur.

```sh
# 3 tekrar; profil sırası tekrarlarda döndürülür.
npm run benchmark
# İlk canlı deney: tek görev, üç profil, bütün koşuda en fazla 12 çağrı.
node src/cli.mjs run --policy jev --tasks menu \
  --profiles chromium-rendered,chromium-semantic,lightpanda-semantic \
  --repeat 1 --max-calls 12
# Bütün görevler, toplam en fazla 30 çağrı; kalan işler NOT_RUN kalır.
npm run jev
# Form için hedef değerler görev sözleşmesinden sağlanır; ayrı metin LLM'i yok.
node src/cli.mjs run --policy jev --tasks form --profiles lightpanda-semantic --max-calls 8
# Manuel fixture sayfası
npm run serve
```

API anahtarı `.env` dosyasında, izin 0600; Git dışında. Değeri raporlara yazılmaz, tarayıcı süreçlerinin environment'ına aktarılmaz. Fixture koşularında sentetik sayfalar; canlı koşularda ziyaret edilen sayfa gözlemleri karar API’sine gönderilir. Bir çağrı en fazla 15 saniye; otomatik API retry yok. Bütün koşu için `--max-calls` zorunlu bütçe, pozitif tam sayı; kullanıcı sınırsız kullanıma izin verdiğinde `--max-calls 0` ile sınırsız. Bu bir **nakit harcama garantisi değildir**; provider fiyatı/faturası burada hesaplanmaz. 401/403 durumunda anahtar veya hesap yetkisi doğrulanmamıştır; error body kaydedilmez.

## Görevler ve bağımsız doğrulama

1. Tablo/metin okuma.
2. Input, select, checkbox ve tek form gönderimi.
3. Gerçek dosya input'u ve dosya içeriği.
4. Gecikmeli dinamik menü.
5. Modal kapatma ve ardından action.
6. IntersectionObserver ile kaydırmada yüklenen kayıt.
7. Açık shadow root içindeki control.
8. Aynı origin iframe.
9. CSS ile gizlenmiş aynı adlı control: yapısal görünürlük sınırı.
10. Pointerdown'a bağlı widget: DOM click / tarayıcı input farkı.
11. Canvas: görsel bilgi sınırı.

Modelin DONE cevabı kanıt sayılmaz. Yazma görevlerinde server belleğindeki gerçek payload ve commit sayısı kontrol edilir; yalnız bir doğru commit PASS alır. Model oracle/expected payload'u almaz. Read görevi gözlemdeki fiyattan çıkarımla doğrulanır. Scripted politika observed label sırasını kullanır: agent zekâsı ölçmez. Canvas'ın rendered/scripted yolu fixture-defined koordinat kullanır: görüntü anlayan AI başarısı değildir. JEV/canvas ve görselsiz canvas UNSUPPORTED kalır.

Stale node/etiket/değer kontrolü vardır; gönderilmiş mutasyon otomatik tekrar edilmez. Bu, genel webde atomik commit garantisi değildir. Kontroller ve oracle yalnız bu fixture kapsamını doğrular. Upload dosyası test tarafından belirlenir; model keyfi host dosyası seçemez.

## Laya bağlantısı

Aynı `DecisionClient`, Jev-compatible localhost `/v1/systemone` sunucusuna bağlanabilir:

```sh
DECISION_URL=http://127.0.0.1:8000/v1/systemone \
  node src/cli.mjs run --policy jev --tasks menu --max-calls 12
```

Bu komutta `jev` politika adı, typed-decision protokolünü belirtir. TypeSafe anahtarı localhost Laya'ya gönderilmez. Laya model ağırlıkları veya sunucusu **kurulmadı/test edilmedi**. Gerçek modele bağlamadan JEV/Laya eşdeğerliği iddia edilmez. Yeni sağlayıcı için mevcut snapshot/şema ve oracle korunmalı, model sürümü ayrıca kaydedilmeli.

## Kanıt ve ölçüm sınırları

Her koşuda `artifacts/<tarih>/manifest.json`, `results.json`, `trace.jsonl`, `REPORT.md` ve rendered screenshot'ları çıkar. Manifest binary/source hash'leri, model isteği, backend sürümü, sıra ve bağımlılığı içerir. Startup, navigation, gözlem, action, model ve toplam süreler ayrıdır. Her case temiz browser ile başlar; toplam süre başlangıcı içerir. Her action sonrası tüm profillerde aynı 150 ms settle beklemesi vardır; bu aşama saf performans optimizasyon benchmark'ı değildir.

Bellek 100 ms örneklenen browser process tree RSS toplamıdır; paylaşılan sayfaları çift sayabilir, kısa tepeleri kaçırabilir. Harness RSS ayrıca gösterilir. Fixture server ve hosted model bu browser metriğinde yoktur. macOS RSS sonucu ürünün 500 MB hedefini kanıtlamaz. Sonraki kapasite testi Linux'ta bütün ürün süreçlerini kapsayan cgroup memory.peak, concurrency ve uzun koşu gerektirir.

Screenshot kanıtını üretme süresi `evidenceMs` olarak ayrıca tutulur; toplam görev süresinden ve cleanup süresinden ayrıdır. Modelin işini etkileyen network, browser startup ve navigation toplam süreye dahildir.

Bu fixture'lar genel internet uyumluluğu, gerçek hesap işlemleri, Sheets teslimi veya üretim izolasyonunu doğrulamaz. FAIL, UNSUPPORTED ve NOT_RUN ayrı tutulur; başarısız işler paydadan çıkarılmaz.

## Canlı site karşılaştırması

`LIVE_REPEAT=2 npm run live` yedi canlı sitede iki hedef varyantını Chromium DOM, screenshot/OCR ve Lightpanda DOM ile dener. Her deneme yeni tarayıcı açar. JEV yalnızca mevcut gözlem ve hedefi alır; bağımsız doğrulayıcı beklenen sonucu kontrol eder. Anahtar `.env` dosyasından okunur.

Ayrıntılar: [LIVE_TEST_PROTOCOL.md](LIVE_TEST_PROTOCOL.md). Sonuç üretmek için `npm run live:report -- artifacts/live-<tarih>`; rapor [LIVE_RESULTS.md](LIVE_RESULTS.md) olarak yazılır. Başarı oranı, ortak başarılı hedeflerin süresi, browser ve tüm yerel sürecin fiziksel footprint belleği birlikte raporlanır.
