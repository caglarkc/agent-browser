# Agent Browser Runtime

Agent'lar için kaynak tüketimi ölçülen, GPT ve Claude ile kullanılabilen tarayıcı runtime MVP'si. İsim geçicidir.

**Durum: plan hazırlandı; bir teknik revizyon turu tamamlandı; uygulama kullanıcı onayını bekliyor.**

## Belgeler

- [Revize MVP planı](docs/MVP_PLAN.md): ürün kapsamı, mimari, entegrasyonlar, iş paketleri, testler ve kabul kapıları.
- [Teknik değerlendirme ve revizyon](docs/TECHNICAL_REVIEW.md): ilk kararların eleştirisi ve değişikliklerin gerekçesi.
- [Resmi kaynaklar](docs/SOURCES.md): kaynak/karar eşlemesi ve kanıt sınırları.
- [İlk taslak v0.1](docs/archive/MVP_PLAN_v0.1.md): değerlendirme öncesi sürüm; uygulamada final plan esas alınır.

## Önerilen MVP

Tek işletmecili CLI/localhost API; koşullu Lightpanda engine ve görsel işler için Chromium; ortak browser araçları; OpenAI Responses ve Anthropic Messages; uygulamanın oluşturduğu Google Sheet'e görev sonucu yazma.

Performans hedefi: desteklenen yapısal görevlerde **60 canlı ve ilerleyen oturum, bütün ürün bileşenleri dahil tepe bellek ≤500.000.000 byte**. 400 MB sonraki optimizasyon hedefidir. Görsel/mixed çalışma ayrıca ölçülür; bu sınıf 500 MB sınırını geçerse hedefin bütün ürün senaryolarında karşılandığı söylenmez.

Onay sonrası ilk paket **P0**: sürüm/lisans/uyumluluk/güvenlik uygulanabilirliği, oturum topolojisi ve erken bellek ölçümü. P0 başarı sonucu nihai ürün kapasite kanıtı değildir; entegre sistemin kabulü G2 testlerinde yapılır.

## Onayda incelenecek ürün kararları

1. İlk kullanıcı ve dağıtım: geliştirici, tek güvenilir işletmeci, yerel/self-hosted kullanım.
2. İlk Google kapsamı: uygulamanın oluşturduğu Sheets dosyasına sonuç yazma.
3. Bellek kapsamı: yapısal ve görsel/mixed çalışma için ayrı, açık kapasite raporları.
4. P0 girdileri: gerçek hedef siteler, dağıtım/lisans tercihi, model erişimi ve gerçek API test harcama sınırı.

Henüz uygulama kodu veya dış servis entegrasyonu başlatılmadı. Bu klasör planlama teslimidir.
