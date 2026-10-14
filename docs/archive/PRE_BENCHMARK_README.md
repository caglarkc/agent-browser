> Historical planning snapshot; the root README describes the runnable prototype and current benchmarks.

# Agent Browser Runtime

Geliştiricilerin tanımlı web görevlerini GPT veya Claude ile çalıştırması, işlem sonucunu doğrulaması ve Google Sheets'e teslim etmesi için yerel/self-hosted runtime projesi. İsim geçicidir.

**Durum: plan v2.0 — bağımsız değerlendirme sonrası kapsamlı revizyon. Uygulama ve kapasite doğrulaması henüz yapılmadı.**

## Belgeler

- [Yerel karşılaştırmalı test laboratuvarı](../../lab/README.md): Chromium/rendered, Chromium/semantic ve Lightpanda/semantic yolları; sentetik görevler, JEV bağlantısı ve bağımsız sonuç doğrulaması. Ürün kapasite kabulünün yerine geçmez.

- [Açık kaynak teknik araştırması — 12 Ekim 2026](../../docs/research/RESEARCH.md): 20 kanonik proje, kaynak incelemesi, benchmark sınırları ve backend kısa listesi.
- [MVP planı](../../docs/MVP_PLAN.md): ürün sınırı, mimari seçenekler, depolama, entegrasyonlar, iş paketleri ve karar kapıları.
- [Görev ve yürütme sözleşmeleri](../../docs/TASK_CONTRACTS.md): neye izin verilir, ne doğrulanır, hangi işlem tekrar edilebilir; oturum/görev/teslim durumları.
- [Kabul ve ölçüm protokolü](../../docs/ACCEPTANCE.md): corpus, mevcut çözümlerle karşılaştırma, aynı yük altında bellek/başarı/gecikme ve test matrisi.
- [Bulgu–düzeltme–kanıt eşlemesi](../../docs/TECHNICAL_REVIEW.md): önceki 19 bulgu ve bağımsız değerlendirmedeki 8 bulgunun karşılıkları.
- [Kaynaklar](../../docs/SOURCES.md): birincil kaynaklar, kullanım amacı ve kanıt sınırları.
- [v1.0 planı](../../docs/archive/v1.0/docs/MVP_PLAN.md) ve [v0.1 taslağı](../../docs/archive/MVP_PLAN_v0.1.md): tarihçe; güncel uygulama sözleşmesi değildir.

## Başlangıç kararı

Önce gerçek görevler ve doğrulama yöntemi belirlenir; mevcut `agent-browser`, Lightpanda araçları ve referans Chromium/Playwright yolu aynı corpus ile karşılaştırılır. Gereken yönetim, yetki ve kalıcı teslim işlevleri ince bir katman olarak eklenir. Özel Go/CDP katmanı ancak ölçülmüş boşlukla seçilir; iki motora destek iki özel driver yazma zorunluluğu değildir.

İlk çalışan kesit: **bir görev türü, bir seçilmiş backend, bir sağlayıcı, bağımsız sonuç doğrulaması ve kalıcı yerel sonuç**. Ardından Sheets teslimi; sonra ikinci sağlayıcı ve görsel yol eklenir. Nihai MVP iki sağlayıcıyı ve gerçek Chromium görüntüsünü içerir. Kesit teslimi nihai MVP kabulü sayılmaz.

## Kapasite hedefi

Desteklenen yapısal görevlerde **60 canlı oturum, bütün ürün bileşenleri dahil tepe bellek ≤500.000.000 byte**. Aynı canlı koşuda doğrulanmış görev başarısı ≥%90, tamamlanan iş hızı ≥18/dakika ve cezalı uçtan uca p95 ≤150 saniye hedeflenir; ayrıntılı payda ve süre tanımı [kabul protokolündedir](../../docs/ACCEPTANCE.md). Bu eşikler tasarım hedefidir, ölçüm sonucu değildir. 400 MB sonraki optimizasyon hedefidir.

Görsel/mixed profil ayrıca ölçülür. Bu profil 500 MB'ı aşarsa bütün kullanım sınıfları için hedef sağlanmış sayılmaz; sonuç başarısız/eksik kapsam olarak açık kalır. Boş oturum, sırayla açılıp kapanan küçük havuz veya düşük görev başarısı kapasite geçişi sağlamaz.

## Sonraki çalışma

P0 araştırması önerilen **8 geliştirici günlük zaman sınırında** yürütülür; bu bir teslim garantisi değildir. Çıkış: görev sözleşmeleri, karşılaştırma ölçümleri, izolasyon kanıtı, bellek payı hesabı, seçilen backend ve sonraki paketlerin yeniden tahmini. Önceki 6–9 hafta toplam tahmini yürürlükten kaldırılmıştır.

Gerçek siteler, dağıtım/lisans tercihi, Linux ölçüm ortamı ve canlı API bütçesi henüz belirlenmedi. Bunların eksikliği ilgili kapıyı açık bırakır; fixture başarısıyla gerçek saha uygunluğu ilan edilmez. Bu revizyon yalnız plan belgelerini günceller; ücretli API kullanımı, hesap bağlama ve runtime uygulamasını başlatmaz.
