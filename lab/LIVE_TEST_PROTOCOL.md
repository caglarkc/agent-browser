# Canlı JEV tarayıcı karşılaştırması

Yalnızca JEV karar verir. Chromium DOM, Chromium screenshot → yerel Apple Vision OCR → JEV, ve Lightpanda DOM aynı hedefleri çözer. JEV görüntü kabul etmediği için görsel mod doğrudan vision-model karşılaştırması değildir.

Yedi canlı alan, her biri iki hedef varyantı: Books to Scrape (ürün + fiyat), Quotes to Scrape JS (sayfalama), Python (modül bulma), MDN (nesne referansı), Scrape This Site AJAX (yıl tablosu), GitHub Issues (durum filtresi), OpenStreetMap (nesne detay/geçmiş). İlk üç scraping sitesi kamuya açık test siteleridir; diğerleri üretim siteleridir. Zorluk etiketleri site özelliklerine göre verilmiştir. Özellikle OSM görevi harita yorumlama değil detay/geçmiş gezinmesidir.

Her deneme yeni tarayıcı ve profil açar; giriş, çerez aktarımı, hesap, dosya yükleme, paylaşım veya dışarıya yazma yapılmaz. Mod sırası hedefler ve tekrarlar arasında döner. Bu soğuk başlangıç deneyidir. 35 saniyelik yumuşak sınır ve 14 JEV kararı vardır; başlamış bir ağ/araç çağrısı sınırı aşabilir. Timeout ve başarısız denemeler paydada tutulur.

JEV yalnızca doğal dil hedefi, mevcut gözlem ve son altı eylemi görür. Beklenen adres, ürün fiyatı ve AJAX film listesi ayrı doğrulayıcıdadır. Varyantlar değişir fakat hedef seti sabittir; yeni görülmemiş sitelerde genelleme veya modelin ön eğitimde bu siteleri bilmediği iddia edilmez.

DOM adayları CSS ile gizlenmiş öğeleri eler, ekran dışı öğeleri de kapsar ve 65'lik gruplar halinde sunulur. Daha fazla kontrol inceleme eylemi yalnızca DOM modunda bulunur. OCR yalnızca 1000×700 screenshot piksellerini kullanır; DOM ile tıklama eşleştirmesi yapılmaz. URL bilgisi bütün modlarda mevcuttur. Görsel mod bir sayfayı görmek için kaydırmalıdır; farklı gözlem maliyetleri ölçümün konusudur.

Doğrulama JEV'in DONE kararını kabul etmez. Ürün için doğru detay adresi ve açık fiyat raporu gerekir; fiyat bağımsız HTTP ürün yanıtından alınır. AJAX için bağımsız yayınlanmış JSON uç noktasındaki tüm film başlıkları sayfanın tablo satırlarında bulunmalıdır. Diğer görevlerde doğru adres veya Issues filtresi ve kullanılabilir doküman gerekir. Erişim engelleri başarı değildir.

Süre başlangıç, ilk yükleme, gözlem/OCR, JEV ve eylem/doğrulama olarak kaydedilir. Toplam süre temizlik ve rapor yazımını dışlar. RAM 100 ms örneklemeli süreç ağacı RSS ve macOS fiziksel footprint ölçümüdür; tarayıcı, OCR ve Node sürücüsü ayrı takip edilir. İlk başlatma öncesi bellek ölçülmez. Uzak JEV sunucusunun RAM'i bilinmez. Ağ, canlı içerik ve OS cache değişkenliği sonuçları etkiler. 84 denemelik adapter v1 turu varsayılan dil/UA ayarlarını kullandı; OpenStreetMap Chrome’da Türkçe, Lightpanda’da İngilizce görünebildi. Adapter v2 ek turu bütün modlarda Accept-Language en-US,en;q=0.9 ayarlar. UA ve render farkları devam eder; salt model karşılaştırması yapılmaz. Az örnekli p95 kapasite tahmini değildir.

Pilot sürümün OCR'a uygulanamayan MORE eylemi sunması ve yinelenen fiyat adayları düzeltilmiştir. Pilot ve son sürüm kaynakları/artifact'ları ayrı tutulur; pilot sonuçlar final toplama karıştırılmaz.

Çalıştırma: `LIVE_REPEAT=2 node src/live.mjs`. Anahtar mevcut ignore edilmiş `.env` dosyasından okunur, alt süreçlere aktarılmaz. Sonuçlar `benchmarks/results/live-*/` altındadır.

Adapter v1: 84 deneme (14 hedef × 3 mod × 2 tekrar), LIVE_BASELINE_RESULTS.md. Adapter v2: DOM için yalnızca kontrol grubu ilerleme, gözlenmiş bağlantı adresi ve ortak Accept-Language; salt gözlem/doğrulamada gezinme bağlamı kesintisine üçe kadar yeniden okuma. Tıklamalar veya JEV API çağrıları otomatik yeniden gönderilmez. v2 ek turu 42 denemedir (14 hedef × 3 mod × 1 tekrar); iki tur birbirine karıştırılmadan raporlanır.
