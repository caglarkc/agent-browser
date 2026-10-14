# Canlı site test sonuçları

Kaynak: `benchmarks/results/live-2026-10-13T15-38-19-789Z`. 84 deneme; 14 hedef varyantı, 2 tekrar ve 3 mod. Her deneme yeni tarayıcı açar. JEV tek karar modelidir; görsel mod screenshot → yerel OCR → JEV'dir.

| Site | Özellik / zorluk | Chrome DOM | Screenshot/OCR | Lightpanda DOM |
|---|---|---:|---:|---:|
| [books](https://books.toscrape.com/) | Test kataloğu / 1 | 4/4 | 4/4 | 4/4 |
| [quotes-js](https://quotes.toscrape.com/js/) | Test JS sayfalama / 2 | 4/4 | 4/4 | 4/4 |
| [python](https://docs.python.org/3/library/index.html) | Üretim dokümantasyonu / 2 | 4/4 | 3/4 | 2/4 |
| [mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects) | Yoğun üretim referansı / 3 | 4/4 | 3/4 | 4/4 |
| [ajax-oscars](https://www.scrapethissite.com/pages/ajax-javascript/) | Test AJAX tablosu / 3 | 4/4 | 4/4 | 4/4 |
| [github](https://github.com/react/react/issues) | Üretim Issues filtresi / 4 | 4/4 | 2/4 | 3/4 |
| [osm](https://www.openstreetmap.org/way/5013364) | Üretim harita sitesinde detay/geçmiş / 5 | 0/4 | 0/4 | 0/4 |

| Mod | Başarı | Başarılı deneme medyanı (s) | Ortak başarılı hedeflerde medyan (s) | Tarayıcı tepe footprint medyanı (MiB) | Toplam yerel tepe footprint medyanı (MiB) |
|---|---:|---:|---:|---:|---:|
| chromium-dom | 24/28 | 6.21 | 6.98 | 374.24 | 566.05 |
| chromium-ocr | 20/28 | 10.47 | 10.47 | 394.06 | 658.92 |
| lightpanda-dom | 21/28 | 2.88 | 2.87 | 17.55 | 211.98 |

Ortak başarılı hedef/tekrar sayısı: 19. Başarı oranları farklıyken yalnız başarılı denemelerin hızı üstünlük kanıtı değildir. Bellek sütunları da yalnızca bu ortak başarılı hedefleri kullanır. Başarısızlıklar başarı oranının paydasında ve ham sonuçlarda kalır; tüm denemelerin süre/bellek dağılımları summary.json dosyasındadır.

Başarısızlıklar:

- chromium-dom: 4 × Step or time limit.
- chromium-ocr: 2 × Execution context was destroyed, most likely because of a navigation.; 3 × Step or time limit; 3 × Model BLOCKED.
- lightpanda-dom: 5 × Step or time limit; 2 × Model BLOCKED.

Ağ/API hatası, gezinme sırasında JavaScript bağlamının yok olması, yanlış/erken DONE ve adım sınırı farklı nedenlerdir; bunlar tek başına JEV modelinin başarı oranı olarak yorumlanmamalıdır. Denemeler tüm tarayıcı + gözlem + karar yığınının başarısını ölçer.

Zorluk site özelliklerini anlatır; OSM görevi harita yorumlamaz. Form doldurma, dosya yükleme, giriş ve uzun çok kaynaklı araştırma test edilmedi. Tarayıcıların varsayılan dil/UA ayarları eşitlenmedi; OpenStreetMap gözlemleri dil bakımından farklılaşabildi. İki hedef varyantı ve az tekrar, genel başarı yüzdesi veya üretim kapasitesi çıkarmaya yetmez. Pilot sonuçlar bu rapora dahil değildir.

Doğrulama ve ölçüm ayrıntıları: [LIVE_TEST_PROTOCOL.md](LIVE_TEST_PROTOCOL.md). Ham sonuçlar, karar izleri, screenshotlar ve kullanılan kaynaklar artifact klasöründe bulunur.
