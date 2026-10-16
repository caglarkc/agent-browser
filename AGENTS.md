# Agent Browser çalışma kuralları

## Ürün ve plan

- Güncel ürün gereksinimleri `docs/BROWSER_REQUIREMENTS.md`, uygulama sırası ve kabul kapıları `docs/BROWSER_PLAN.md` içindedir.
- Tarayıcı Lightpanda tabanlı ve tamamen agent odaklıdır. İnsan sayfa görüntülemez, gezinmez veya kontrolü devralmaz; tek insan bağlantısı hassas veri giriş eklentisidir.
- Tarayıcı aşamalarını sırayla tamamla; JEV/model entegrasyonunu A6 öncesinde öne alma. Chromium fallback ile başarısızlığı kapatma.
- Motor kaynak pinlerini, patch ve test kanıtlarını birlikte güncel tut. Tarihsel benchmark/source snapshot’larını değiştirme.

## Her tamamlanan işte commit ve push

Kullanıcının sürekli talimatı: **Tamamlanan her işi, ilgili doğrulamaları yaptıktan sonra commit et ve GitHub’a push et.** Bu kural kod, motor patch’i, testler, sonuç kanıtları, belgeler ve plan değişikliklerini kapsar. Kullanıcı o iş için açıkça farklı bir talimat vermedikçe yalnız yerel diff bırakmak teslim sayılmaz; tekrar commit/push izni isteme.

- İşe ait değişiklikleri inceleyip uygun testleri çalıştır; sonuç ve sınırlamaları belgelerde doğru yansıt.
- İlgisiz kullanıcı değişikliklerini commit’e katma. Secret, credential, `.env`, bağımlılık/derleme cache’i ve ignore edilmiş motor binary’sini yükleme; yeniden üretilebilir kaynak/patch ve gerekli güvenli kanıtları sürümle.
- İlgili değişiklikleri anlamlı commit mesajıyla kaydet ve çalışılan dalı yapılandırılmış GitHub remote’una gönder. Force push veya geçmişi yeniden yazma yapma.
- Push sonrasında uzak dalın commit SHA’sını yerel HEAD ile karşılaştır ve çalışma ağacını kontrol et. Son yanıtta commit ve push durumunu bildir.
- Push başarısızsa nedeni ve yerel commit durumunu açıkça bildir; GitHub’a gönderilmiş gibi tamamlandı deme.
