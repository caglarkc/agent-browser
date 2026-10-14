# Canlı site test sonuçları

Kaynak: `benchmarks/results/live-2026-10-13T15-52-00-491Z`. 84 denemelik önceki tur ayrı tutuldu: [LIVE_BASELINE_RESULTS.md](LIVE_BASELINE_RESULTS.md). Bu rapor düzeltilmiş adapter v2 ek turunu kapsar. 42 deneme; 14 hedef varyantı, 1 tekrar ve 3 mod. Adapter sürümü: 2. Her deneme yeni tarayıcı açar. JEV tek karar modelidir; görsel mod screenshot → yerel OCR → JEV'dir.

| Site | Özellik / zorluk | Chrome DOM | Screenshot/OCR | Lightpanda DOM |
|---|---|---:|---:|---:|
| [books](https://books.toscrape.com/) | Test kataloğu / 1 | 2/2 | 2/2 | 2/2 |
| [quotes-js](https://quotes.toscrape.com/js/) | Test JS sayfalama / 2 | 2/2 | 2/2 | 2/2 |
| [python](https://docs.python.org/3/library/index.html) | Üretim dokümantasyonu / 2 | 2/2 | 1/2 | 2/2 |
| [mdn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects) | Yoğun üretim referansı / 3 | 2/2 | 2/2 | 2/2 |
| [ajax-oscars](https://www.scrapethissite.com/pages/ajax-javascript/) | Test AJAX tablosu / 3 | 2/2 | 2/2 | 2/2 |
| [github](https://github.com/react/react/issues) | Üretim Issues filtresi / 4 | 2/2 | 1/2 | 0/2 |
| [osm](https://www.openstreetmap.org/way/5013364) | Üretim harita sitesinde detay/geçmiş / 5 | 0/2 | 0/2 | 0/2 |

| Mod | Başarı | Başarılı deneme medyanı (s) | Ortak başarılı hedeflerde medyan (s) | Tarayıcı tepe footprint medyanı (MiB) | Toplam yerel tepe footprint medyanı (MiB) |
|---|---:|---:|---:|---:|---:|
| chromium-dom | 12/14 | 6.97 | 6.97 | 376.81 | 483.09 |
| chromium-ocr | 10/14 | 11.07 | 11.07 | 386.71 | 538.69 |
| lightpanda-dom | 10/14 | 2.82 | 2.96 | 17.17 | 83.79 |

Ortak başarılı hedef/tekrar sayısı: 9. Başarı oranları farklıyken yalnız başarılı denemelerin hızı üstünlük kanıtı değildir. Bellek sütunları da yalnızca bu ortak başarılı hedefleri kullanır. Başarısızlıklar başarı oranının paydasında ve ham sonuçlarda kalır; tüm denemelerin süre/bellek dağılımları summary.json dosyasındadır.

Başarısızlıklar:

- chromium-dom: 1 × Premature DONE; 1 × Step or time limit.
- chromium-ocr: 3 × Step or time limit; 1 × Model BLOCKED.
- lightpanda-dom: 1 × Premature DONE; 1 × Cannot read properties of undefined (reading 'dispatchEvent'); 1 × Model BLOCKED; 1 × Step or time limit.

Ağ/API hatası, gezinme sırasında JavaScript bağlamının yok olması, yanlış/erken DONE ve adım sınırı farklı nedenlerdir; bunlar tek başına JEV modelinin başarı oranı olarak yorumlanmamalıdır. Denemeler tüm tarayıcı + gözlem + karar yığınının başarısını ölçer.

Zorluk site özelliklerini anlatır; OSM görevi harita yorumlamaz. Form doldurma, dosya yükleme, giriş ve uzun çok kaynaklı araştırma test edilmedi. Bu turda Accept-Language bütün modlarda en-US olarak ayarlandı; motorların UA ve render farkları devam eder. İki hedef varyantı ve az tekrar, genel başarı yüzdesi veya üretim kapasitesi çıkarmaya yetmez. Pilot sonuçlar bu rapora dahil değildir.

Doğrulama ve ölçüm ayrıntıları: [LIVE_TEST_PROTOCOL.md](LIVE_TEST_PROTOCOL.md). Ham sonuçlar, karar izleri, screenshotlar ve kullanılan kaynaklar artifact klasöründe bulunur.
