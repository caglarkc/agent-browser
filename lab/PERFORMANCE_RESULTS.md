# JEV araştırma hızı ve RAM karşılaştırması

**Aynı belge araştırma akışında hazır oturumdaki medyan süre görsel OCR yolunda 1.08 saniye, görselsiz Lightpanda yolunda 0.67 saniye. Süre yaklaşık %38.3, ölçülen yerel toplam footprint yaklaşık %82.6 azaldı.**

## Araştırma görevi

Bir belge kütüphanesinde Notebook specifications belgesini aç, aylık/yıllık fiyatları ayır ve doğru yıllık fiyatı raporla. Belge ayrı bir yerel HTTP isteğiyle yüklenir. Hedef fiyat modelin goal veya expected alanına verilmez. Görsel yol ekran görüntüsünden OCR ile metin ve koordinat çıkarır; HTML/DOM okuyarak tıklama hedefi bulmaz. Sonuç, ayrı fixture süreçteki oracle ile kontrol edilir.

10 farklı fiyat varyasyonu × 3 yol × soğuk/hazır oturum = 60 deney. Üç yolun tümü iki fazda da 10/10 doğru sonucu verdi. JEV 1.13.0 kullanıldı; çoğu görev iki karar çağrısıyla tamamlandı. 60 araştırma denemesinde toplam 122 JEV çağrısı yapıldı; bekleme kararları da kayıtlarda tutuldu.

## Hazır oturum

| Yol | Başarı | Medyan süre | p95 | Tarayıcı footprint | Yerel toplam footprint |
|---|---:|---:|---:|---:|---:|
| Chromium screenshot → yerel OCR → JEV | 10/10 | 1.08 sn | 1.81 sn | 365.9 MB | 534.3 MB |
| Chromium DOM → JEV | 10/10 | 0.86 sn | 1.32 sn | 357.5 MB | 447.7 MB |
| Görselsiz Lightpanda DOM → JEV | 10/10 | 0.67 sn | 0.84 sn | 11.0 MB | 93.0 MB |

Hazır oturumda browser/yerel OCR işçisi model çağrısı yapılmadan ısıtılır ve alt görevler arasında yeniden kullanılır. Her görev yine yeni tab açar. Süre sayfa/tab oluşturma, HTTP yükleme, gözlem, JEV, etkileşim, settle ve doğrulamayı içerir; başlangıç ve son cleanup dahil değildir.

## Soğuk başlangıç

| Yol | Başarı | Medyan süre | p95 | Tarayıcı footprint | Yerel toplam footprint |
|---|---:|---:|---:|---:|---:|
| Chromium screenshot → yerel OCR → JEV | 10/10 | 2.25 sn | 4.61 sn | 362.4 MB | 509.0 MB |
| Chromium DOM → JEV | 10/10 | 1.62 sn | 2.96 sn | 352.7 MB | 413.7 MB |
| Görselsiz Lightpanda DOM → JEV | 10/10 | 0.84 sn | 0.93 sn | 10.4 MB | 69.4 MB |

Soğuk faz her görev için browser ve gerekirse OCR işçisini başlatır; başlangıç süresi toplamda dahildir. Son cleanup ve rapor yazımı dahil değildir. OS disk/cache durumları sıfırlanmadı; cihazın kullanıcı uygulamaları kontrol edilmedi.

## Hazır araştırma akışının süre bileşenleri

| Metrik — ms | Screenshot/OCR | Chromium DOM | Lightpanda DOM |
|---|---:|---:|---:|
| captureMs | 80 | 0 | 0 |
| ocrMs | 237 | 0 | 0 |
| modelMs | 516 | 533 | 499 |
| pageCreateMs | 48 | 56 | 5 |
| navigationMs | 14 | 14 | 2 |
| observeMs | 0 | 6 | 3 |
| actionMs | 4 | 8 | 2 |
| verifyMs | 1 | 1 | 1 |

Görselsiz yolda JEV çağrıları görev süresinin medyan yaklaşık %74.7 bölümünü oluşturdu. Motor/DOM maliyeti küçülünce kalan hızın ana sınırı model/ağ karar döngüsü oluyor. Bileşen medyanları farklı denemelerden geldiği için bunları toplayarak toplam medyan hesaplamak doğru değildir.

## Daha geniş kontrol akışları: 180 sıralı deney

Okuma, gecikmeli menü, doğru kayıt seçimi, CSS-hidden öğe, pointer widget ve modal; her grupta 30 deneme. Üç yol da soğuk ve hazır fazlarda 30/30 geçti.

| Faz/yol | Medyan süre | p95 | Tarayıcı RSS | Yerel toplam RSS |
|---|---:|---:|---:|---:|
| cold-chromium-dom | 1.58 sn | 9.40 sn | 912.4 MB | 995.1 MB |
| cold-chromium-ocr | 1.95 sn | 8.46 sn | 917.1 MB | 1064.3 MB |
| cold-lightpanda-dom | 0.69 sn | 2.64 sn | 32.8 MB | 123.1 MB |
| warm-chromium-dom | 1.12 sn | 3.35 sn | 918.3 MB | 998.5 MB |
| warm-chromium-ocr | 1.34 sn | 2.76 sn | 928.1 MB | 1073.4 MB |
| warm-lightpanda-dom | 0.46 sn | 1.31 sn | 34.9 MB | 144.2 MB |

Bu geniş koşu ilk RSS ölçümüdür; üstteki özel araştırma koşusu ayrıca native footprint ölçer. Görev karmaları farklıdır; iki tabloda farklı sonuç çıkması çelişki değildir. Chromium soğuk başlangıcında çok saniyelik sıçramalar oldu; ham denemeler ve p95 içinde tutuldu.

## RAM metriklerinin anlamı

- Footprint: macOS `proc_pid_rusage` / `ri_phys_footprint`, her örnekte süreçler üzerinden toplam. Kullanıcıya RAM sonucunu gösterirken bu tablo esas alınır.
- RSS: resident set toplamı. Paylaşılan framework/kütüphane sayfaları birden fazla süreçte sayılabildiği için daha büyük görünebilir. RSS ve footprint birbirinin yerine kullanılmaz.
- Tarayıcı: browser root + çocukları. Yerel toplam: tarayıcı + varsa OCR işçisi + Node karar/yürütme sürücüsü. Uzak JEV sunucusu ve test fixture süreç hariçtir; ölçüm/raporlama sürücü overhead’i toplamda bulunur.
- Tablo RAM değerleri, her denemede 100 ms örneklemeyle görülen tepe değerlerin medyanıdır; bilgisayarın toplam RAM tüketimi veya süreçlerin mutlak lifetime tepe garantisi değildir. Sampling browser bağlantısı kurulduktan sonra başlar.
- Aynı anda yalnız bir benchmark browser yolu çalıştı; yolların sırası tekrarlarda döndürüldü. Driver ve worker cache/bellek büyümesi kayda dahildir. GPU/system servislerine ait süreç dışı tahsisler ayrıca ölçülmedi.

## Görsel araştırmanın sınırı

JEV doğrudan görüntü kabul etmiyor: [TypeSafe State belgesi](https://docs.typesafe.ai/concepts/state). Bu yüzden görsel karşılaştırma yerel Apple Vision OCR ön işleme + JEV şeklindedir; görsel bir LLM değildir. Görsel anlam taşıyan ikon, fotoğraf, harita veya canvas anlayışı bu deneyin kapsamında değildir. Sonuçlar aynı yerel belge araştırmasına aittir; genel internet araştırma performansı/SLA veya 60 oturum kapasite kabulü değildir.

## Tekrar çalıştırma

```sh
swiftc src/ocr.swift -o bin/browser-lab-ocr -framework Vision -framework ImageIO
clang -O2 src/memprobe.c -o bin/browser-lab-memprobe
npm test
npm run perf -- --repeat 5
npm run perf -- --repeat 10 --tasks research --variant-offset 91
```

- [180 kontrol deneyinin ham sonuçları](../benchmarks/results/perf-2026-10-13T14-59-49-800Z/results.json)
- [60 araştırma deneyinin ham sonuçları](../benchmarks/results/perf-2026-10-13T15-09-50-495Z/results.json)
- [Araştırma özeti](../benchmarks/results/perf-2026-10-13T15-09-50-495Z/summary.json)
- [Araştırma kaynak/sürüm manifesti](../benchmarks/results/perf-2026-10-13T15-09-50-495Z/manifest.json)

Source snapshot’ları, karar/observation kayıtları ve örneklenen süreç metrikleri artifact dizinlerinde tutulur. API anahtarı kayıtlara yazılmaz. macOS 26.6.2, arm64, sistem Chrome 155.0.8059.40, Lightpanda 1.0.0; native OCR Apple Vision accurate/en-US.
