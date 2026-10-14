# JEV görüntüsüz kullanım deneyi — 13 Ekim 2026

Kullanıcı bu deneylerde JEV API kullanımına sınır koymadı. `--max-calls 0` koşu genelinde sınırsız çağrı anlamına gelir; her iş yine en fazla 12 karar ve 20 saniye yürütme penceresiyle sınırlıdır. Sonuçlar süresiz tekrar denenmez.

## Sorular

1. JEV'e piksel göndermeden standart web görevleri tamamlanabiliyor mu?
2. Aynı görevler grafik hattı olmayan Lightpanda'da ne kadar çalışıyor?
3. Başarısızlıklar gözlem şeması, JEV kararı, input adaptörü veya motor kapsamından hangisine bağlı?
4. Modelin DONE kararı ve tekrarlı eylemleri bağımsız kontrol olmadan güvenilir mi?

## Koşular

| Aşama | Varyasyonlar | Kapsam | Amaç |
|---|---|---|---|
| İlk tanı | Sabit corpus, iki tekrar | 11 görev × 3 profil = 66 | Gerçek JEV ile önceki driver testlerini sınamak |
| Geliştirme tanısı | 1–2; form şeması için 3–6 | Yeni autocomplete/record ve enhanced adapter | Fixture durum gösterimi, bounded combobox wait, seçenek/current-value ayrımı |
| Sabit kapsam koşusu | 3–12 | 14 görev × 4 profil × 10 = 560 | Büyük corpus, açık boundary testleri, kod koşu boyunca değişmez |
| Düzeltilmiş şema doğrulaması | 13–22 | 9 core görev × 2 profil × 10 = 180 | Önceden kullanılmamış varyasyonlarda şema ve sonuç kontrolü |
| İşçi + bağımsız doğrulayıcı | 23–32 | 9 core görev × enhanced Lightpanda × 10 = 90 | Sonuç oluştuğunda işi kapatarak mükerrer gönderim/DONE bağımlılığını kaldırmak |
| Gerçek site okuma | Üç dokümantasyon domain'i | 3 site × 2 profil = 6 | Gerçek ağ/JS içeriğinde JEV'in observed link seçimi ve GET navigation |

Koşuların source hash'leri farklıdır. Geliştirme sonuçları son doğrulama puanına eklenmez. Farklı varyasyonlarda yapılan sürüm karşılaştırmaları aynı girdili kontrollü nedensel deney değildir; bir iyileştirmenin etkisi yalnız bu karşılaştırmadan kesin miktarla çıkarılamaz.

## Sabit core ve boundary aileleri

Core: ürün fiyatı seçme; input/select/checkbox/form; dosya içeriği yükleme; gecikmeli menü; modal; kaydırmayla içerik yükleme; açık shadow root; autocomplete seçimi; aynı adlı düğmelerin doğru kayıt kimliğiyle eşleştirilmesi.

Boundary: iframe; CSS ile gizli aynı adlı düğme; pointerdown widget; `isTrusted` isteyen pointer; canvas. Boundary testleri toplam başarı paydasından çıkarılmaz. Core tablosu yalnız belirli kullanım kapsamı için ayrıca gösterilir.

Varyasyonlar hedef değerleri, kategori/şehir/kayıt numarasını, yüklenme gecikmesini, hazır form alanlarını, başlangıç checkbox durumunu, bazı öğelerin sırasını ve okuma distractor'larını değiştirir. Hepsi aynı uygulama ailelerinin sentetik varyasyonlarıdır; 10 tekrar, 10 bağımsız gerçek site değildir.

## Dört profil

- `chromium-rendered`: JEV'e sıfır görüntü; Chrome layout/hit-test ve gerçek input kullanılır.
- `chromium-semantic`: JEV'e sıfır görüntü; DOM aktivasyonu, gerçek Chrome motoru arka planda grafik özelliklerini korur.
- `lightpanda-semantic`: koordinatsız DOM aktivasyonu; grafik hattı yok.
- `lightpanda-enhanced`: grafik hattı yok; motorun desteklediği CSS style özellikleriyle gizli öğe eleme ve sentetik pointer event sequence. Bunlar gerçek layout ve trusted input garantisi değildir.

Trusted-event başarısızlığı mevcut adaptör/engine yolunun sınırıdır; grafik hattı olmayan her motorun güvenilir input üretmesinin teorik olarak imkânsız olduğu anlamına gelmez. Canvas, bu modelin aldığı gözlemde seçimi yapacak görsel/semantik bilgi olmadığı için UNSUPPORTED'dır; başka bir gözlem protokolünün bunu hiç çözemeyeceği iddia edilmez.

## Doğruluk

JEV tek `Choice` ile mevcut gözlemden bir işlem/öğe seçer; keyfi selector, JavaScript veya koordinat üretmez. Alan metinleri güvenilir görev sözleşmesinde sağlanır. Bu çalışma serbest metin üretimini veya üst düzey plan kurmayı test etmez.

Read görevinde doğru fiyat JEV tarafından gözlemdeki gerçek fiyat adaylarından seçilir. Beklenen fiyat modelin goal'ünde veya expected/oracle alanında verilmez. Yazmalarda server'daki gerçek payload ve commit sayısı kontrol edilir; tam bir doğru kayıt dışında hiçbir sonuç PASS olmaz. DONE beyanı tek başına yeterli değildir.

`--verify-each-step` modunda bağımsız doğrulayıcı dış sonuç görünür görünmez döngüyü bitirir. Doğru tek sonuç PASS; yanlış sonuç FAIL kalır. Bu kontrol modele doğru next action'ı söylemez, alanı doldurmaz veya tıklama yapmaz. Üretimde aynı güvenilirlik için hedefe uygun bağımsız receipt/readback gerekir. Genel internette böyle bir oracle'ın mevcut olduğu varsayılmaz.

## Ölçüm ve iddia sınırı

- Birincil sonuç: bütün girişimler dahil doğrulanmış başarı. API hataları, yanlış sonuçlar, mükerrer kayıtlar ve UNSUPPORTED durumları saklanır.
- Görüntü: model isteklerinin şeması metin/structured JSON'dır; `imagesSentToModel=0`. Chromium screenshot'ları yalnız yerel kanıt içindir, API'ye gönderilmez.
- Süre: temiz browser startup/navigation dahil. Koşular aynı host'ta kısmen eşzamanlı çalıştığından hızlar keşif ölçümüdür; kontrollü isolated performance benchmark değildir.
- Bellek: macOS browser tree RSS örneklemesi; shared sayfalar çift sayılabilir, tepe kaçabilir. Bütün ürün 500 MB/60 session kabulü değildir.
- Wilson aralıkları tekrarların bağımsızlığı varsayımıyla betimseldir. Aynı fixture aileleri ilişkili olduğundan genel web için istatistiksel güven garantisi vermez.
- Gerçek site testi yalnız observed link seçimi ve aynı origin GET navigation'dır; gerçek form gönderimi, upload veya hesap işi değildir.

## Yeniden çalıştırma

```sh
node src/cli.mjs run --policy jev --repeat 10 --vary --variant-offset 3 --max-calls 0
node src/cli.mjs run --policy jev --tasks read,form,upload,menu,overlay,lazy,shadow,autocomplete,records \
  --profiles chromium-rendered,lightpanda-enhanced --repeat 10 --vary --variant-offset 13 --max-calls 0
node src/cli.mjs run --policy jev --tasks read,form,upload,menu,overlay,lazy,shadow,autocomplete,records \
  --profiles lightpanda-enhanced --repeat 10 --vary --variant-offset 23 --max-calls 0 --verify-each-step
node src/public-read.mjs
node src/summarize.mjs artifacts/KOŞU_DİZİNİ
```

Geçmiş koşunun tam tekrarında manifestteki **aynı source hash'leri** kullanılmalıdır; yukarıdaki komutları son kodla çalıştırmak önceki gözlem şemasını geri getirmez. Lightpanda 1.0.0 sabit, sistem Chrome güncellenebilir; sürümler her manifest/result kaydında tutulur.
