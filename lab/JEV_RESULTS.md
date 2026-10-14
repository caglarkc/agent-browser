# JEV görüntüsüz kullanım: deney sonucu

**Sonuç: JEV, tanımlı yapısal web görevlerinde görüntü girdisi olmadan yeterince başarılı bir yürütme işçisi olabilir. Ancak grafik motorunu tamamen kaldırmak bütün sitelerde aynı davranışı korumuyor; güvenilir sonuç doğrulaması ve destek sınırı gerekiyor.**

## Ölçülen sonuçlar

| Deney | Sonuç | Kapsam |
|---|---:|---|
| Sabit ilk kapsam — Chromium/layout, JEV görüntüsüz | 126/140 (%90,0) | 14 aile, boundary dahil |
| Sabit ilk kapsam — sade Lightpanda/DOM | 91/140 (%65,0) | Aynı aileler |
| Sabit ilk kapsam — iyileştirilmiş görselsiz Lightpanda | 106/140 (%75,7) | CSS style filtreleme + sentetik pointer |
| Düzeltilmiş şema — Chromium/layout | 89/90 (%98,9) | 9 core aile, yeni varyasyonlar |
| Düzeltilmiş şema — görselsiz Lightpanda | 88/90 (%97,8) | Aynı core aileler |
| Bağımsız doğrulayıcı sonucu görünce işi kapatan Lightpanda | 90/90 (%100) | 9 core aile, üçüncü yeni varyasyon grubu |
| Gerçek site okuma/gezinme | 6/6 | Playwright, TypeSafe, Lightpanda dokümantasyonu; iki motor |

İlk kapsam koşusunda 560, düzeltilmiş şema koşusunda 180, doğrulayıcı koşusunda 90 değerlendirme vardı: toplam 830; ayrıca altı gerçek-site okuma kontrolü. İlk tanı/geliştirme denemeleri bu puanlara eklenmedi. Bütün denemelerde JEV’e gönderilen görüntü sayısı **0**.

Tanı koşuları dahil bu çalışma sırasında 974 senaryo değerlendirmesi ve 3032 canlı JEV API çağrısı kaydedildi. API faturası/para karşılığı hesaplanmadı.

## Ne çalıştı?

Fiyatı doğru ürüne bağlama; input/select/checkbox ve form; gerçek dosya input’u ve dosya içeriği; gecikmeli menü; modal; kaydırmayla yüklenen içerik; açık shadow root; autocomplete seçimi; aynı adlı düğmelerin doğru kayıt bağlamına bağlanması. Son kontrol koşusunda her aile 10/10 geçti. Alan değerleri görev sözleşmesinden sağlandı; JEV serbest metin üretmedi veya yüksek seviyeli plan kurmadı.

## Hangi sınırlar kaldı?

- Lightpanda 1.0.0 + bu driver yolunda iframe 0/10; child document/target gözlemde bulunmuyor.
- CSS-hidden aynı adlı öğe, yalın DOM yollarında 5/10; öğe sırasına bağlı tesadüfi başarı. Lightpanda’nın desteklediği style özellikleriyle eleme eklenince 10/10.
- Pointerdown widget, yalın DOM click yollarında 0/10; sentetik pointer sequence ile enhanced Lightpanda’da 10/10.
- Browser-generated trusted pointer şartı: Chromium 10/10, görselsiz adaptör 0/10. Bu mevcut input yolunun sınırı; bütün renderless motorlar için teorik imkânsızlık kanıtı değil.
- Canvas: tüm JEV yollarında UNSUPPORTED. Mevcut gözlem ve araç listesi görsel seçim için gerekli bilgi/eylemi sunmuyor; model çağrısıyla tahmin yapılıp başarı ilan edilmedi.

## Modeli tek başına bırakmak neden yeterli değil?

İlk büyük koşuda 31 yanlış tamamlandı beyanı bağımsız oracle tarafından reddedildi. Prefilled formda mevcut dropdown seçimi ile olası seçeneklerin yeterince ayrılmaması etkiliydi. Şema düzeltildikten sonra yeni doğrulama grubunda bu hata kalmadı; yine de biri Chromium, biri Lightpanda’da olmak üzere iki shadow görevi tekrarlı commit nedeniyle başarısız oldu. Bir Lightpanda formunun gerçek sonucu doğru olduğu halde karar cevabının probability doğrulaması reddedildi; muhafazakâr biçimde FAIL olarak korundu.

Üçüncü kontrol koşusunda hedefe özel bağımsız doğrulayıcı dış sonucu görünce işi kapattı. 90/90 doğru tek sonuç, sıfır yanlış kayıt, sıfır mükerrer kayıt. Doğrulayıcı JEV’e hangi butona basacağını söylemedi; yalnız gerçek sonucu doğrulayıp yeni eylemleri durdurdu. Üretimde bunun için güvenilir receipt/readback gerekir.

Son görselsiz koşuda 174 JEV çağrısı kullanıldı. Temiz browser başlangıcı dahil görev medyanı yaklaşık 1.07 saniye, p95 yaklaşık 2.05 saniye. Bunlar sentetik yerel görevlerdir; koşular aynı host’ta kısmen çakıştığından izole hız karşılaştırması/SLA değildir.

## Karar

JEV + küçük, açık anlamlı işlem tablosu + hedefe özel bağımsız doğrulayıcı üzerine bir ilk ürün kesiti kurmak için yeterli olumlu kanıt var. Normal DOM görevlerinde görselsiz motor uygun aday. CSS/görünürlük, iframe ve input davranışları capability manifestinde açıkça tanımlanmalı. Native girdi/layout gerektiren işler Chromium yolunda kalabilir; bunun için JEV’e screenshot göndermek şart değildir. Gerçek görsel seçim gerektiren işler ayrı bir gözlem/model yolu ister.

Bu sonuç genel internet, CAPTCHA, gerçek kullanıcı hesabı, Sheets teslimi, açık uçlu planlama veya 60 oturum/500 MB kabulü değildir. Varyasyonlar aynı uygulama ailelerine bağlı; 90/90, dünyanın bütün sitelerinde %100 başarı garantisi vermez. Desteklenen gerçek iş akışlarında yeni canary’ler gerekir.

## Kanıt

- [İlk kapsam: görev tablosu](../benchmarks/results/2026-10-13T14-19-10-625Z/VALIDATION.md)
- [Düzeltilmiş şema: görev tablosu](../benchmarks/results/2026-10-13T14-25-03-883Z/VALIDATION.md)
- [Doğrulayıcı: görev tablosu](../benchmarks/results/2026-10-13T14-28-53-678Z/VALIDATION.md)
- [Gerçek site sonuçları](../benchmarks/results/public-read-2026-10-13T14-21-24-262Z/results.json)
- [Deney protokolü](JEV_TEST_PROTOCOL.md)

Her koşunun results.json, trace.jsonl ve manifest.json dosyaları korunur. Üç ana koşunun source snapshot’ları manifest SHA-256 değerleriyle birebir doğrulandı. 8/8 bağımsız contract/browser test geçti. FAIL ve UNSUPPORTED kayıtları silinmedi.
