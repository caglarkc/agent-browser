# Teknik değerlendirme ve revizyon izlenebilirliği

Tarih: 2 Ekim 2026. Güncel plan: **v2.0**. İlk değerlendirme ve v1.0 belgeleri [arşivde](archive/v1.0/README.md) korunur.

Bu dosya ilk turdaki 19 bulguyu ve bağımsız incelemedeki 8 bulguyu birlikte izler. **Tasarım karşılığı yazılmış olması, teknik riskin uygulamada kapandığı anlamına gelmez.** Bugün uygulama/benchmark olmadığı için aşağıdaki bütün kanıt testleri NOT_RUN'dır. “Kapandı” ifadesi ancak ilgili kanıt üretildiğinde kullanılabilir.

## 1. Bağımsız incelemedeki 8 bulgu

| ID | Önem / sorun | v2.0 tasarım karşılığı | Kapanış kanıtı / kapı |
|---|---|---|---|
| I01 | Yüksek — mevcut çözümler karşılaştırılmadan özel runtime/driver seçilmiş | MVP §3: agent-browser iki motor, Lightpanda araçları ve Playwright baseline; eşdeğer semantik/ortam; özel adaptör için somut eksik ve ADR; Go aday | Aday karşılaştırması + K2/K12 + headroom; G0 |
| I02 | Yüksek — gerçek görev başarısı ve oracle belirsiz | TASK §1–2: R1/R2/V1, güvenilir şablon/verifier, kanıt seviyeleri, PASS/FAIL/UNKNOWN; gerçek sitelerde izinsiz/doğrulanamaz yazma yok | K1/K6/K17; G0 şablon, G1 doğrulama, G3 gerçek saha |
| I03 | Yüksek — gözlem türü ayrılmış ama işlem semantiği ayrılmamış | TASK §3: dom_semantic/rendered_user_input; görünürlük/hit-test/olay farkları; motor seçiminde capability, sessiz gevşetme yok | K2/K3; G1c |
| I04 | Yüksek — node kimliği ve izinli domain doğru iş nesnesini garanti etmiyor | TASK §1/3/5: entity_id/version, field/value, commit sayısı, precondition; same-node/different-record ve autosave/Enter; server precondition yoksa kritik write desteği yok | K4/K5/K12; G0 tasarım, G1 uygulama |
| I05 | Yüksek — 60-session bellek ile E2E kalite ayrı testlerde | ACCEPTANCE §3–4: aynı koşuda S/Q/cezalı p95/RAM/teslim/adillik; ret/geç/fallback/unknown paydada; iki sağlayıcı ayrı | K13 ve A-runtime/A-live; G2 |
| I06 | Orta/yüksek — session, execution ve delivery karışmış | TASK §4–6: üç makine, RESULT_PENDING, immutable result/outbox, generation/lease/cancel; teslim retry web görevi çalıştırmaz | K7/K10/K15; G1a/G1b |
| I07 | Orta — özel journal ve sınırsız disk pending riski | MVP §5: SQLite; transaction/intent/outbox; RAM+kalıcı pending+disk/WAL sınırları; rezervasyon, high/low watermark, admission ve recovery | K10/K11/K16; G1b/G3 |
| I08 | Orta — kapsam büyüklüğü ve temelsiz toplam takvim | MVP §2/10: G1a tek görev/backend/provider; G1b Sheets; G1c ikinci model/görsel; 8 günlük P0 timebox; G0/G1b yeniden tahmin; 6–9 hafta kaldırıldı | G0 ADR/tahmin ve ayrı kesit kabul kayıtları |

## 2. İlk turdaki 19 bulgunun korunması

| ID | İlk sorun | v2.0 karşılığı ve gerileme kontrolü | Kanıt |
|---|---|---|---|
| R01 | Ölçülmemiş MB dağılımı | MVP §9 / ACCEPTANCE §2: ölçülen taban + eksik bileşen + tepe payı; oturum başına hayali garanti yok | G0 headroom, K13 |
| R02 | Replay üretim transport/history maliyetini atlıyor | ACCEPTANCE §4–5: SDK/HTTP/image/history/store/outbox aynı ürün yolunda; A-live ayrıca zorunlu | K8/K13 |
| R03 | Native OOM yalnız bir session'a sınırlanıyor varsayımı | MVP §3/12: süreç/shard/toplam limit ve blast radius; bütün etkilenen işler görünür | K12/K14 |
| R04 | Observation version sayfa yarışını çözmüyor | TASK §3: frame/document epoch + node + entity/version; server commit precondition sınırı açık | K4 |
| R05 | CDP lifecycle bakım bedeli eksik | MVP §3: reuse önceliği; custom seçilirse command/event manifest, correlation/attach/frame/cancel ve ayrı tahmin | K2, G0 ADR |
| R06 | Egress/OS güvenliği yalnız niyet | MVP §8: OS direct-bypass engeli; alt kaynak/protokoller; TLS path kontrolünün sınırı; RAM'de proxy dahil | K12, G0 |
| R07 | Görsel minimum ve mixed bellek belirsiz | ACCEPTANCE §4: gerçek 1/2 Chromium; 59+1/58+2 mixed, iki sağlayıcı; aşım açık FAIL | K3/K13, G2 |
| R08 | Toplam başarı kategori hatasını saklıyor | ACCEPTANCE §1/3/4: sabit corpus, aile/provider/engine skoru, her görev 2/3; false PASS sıfır; örneklem sınırı | K6/K17 |
| R09 | P0 RAM final kanıt sanılıyor | MVP §9–10: G0 headroom ≠ G2 entegre kabul; NOT_RUN/BLOCKED ayrı | G0/G2 raporu |
| R10 | Operation/value wrapper anlamsız kombinasyon üretiyor | TASK §3: küçük ayrı tool şemaları, backend'e sınırlı çeviri; typed iş yetkisi | K1/K8 |
| R11 | Provider transport/SDK seçimi belirsiz | MVP §6: seçilen dilin resmi SDK önceliği, Go şartlı; pin/timeout/body/pool/retry tek sahibi | K8, G0 |
| R12 | History trimming protokolü bozuyor | MVP §6: tam turn/result/provider blokları; ilk kesitte compaction yok; kontrollü limit duruşu | K8 |
| R13 | Desktop ve remote OAuth karışıyor | MVP §7: yerel Desktop+PKCE/state; auth CLI'den Linux secret import; remote web flow sonraki faz | K9 |
| R14 | Vault/test token expiry belirsiz | MVP §7: OS store/standart AEAD, ayrı key, plaintext fallback yok; mock/live/8.gün ayrı | K9, G3 |
| R15 | Sheets cevabı sonrası local mapping kaybolabilir | MVP §5/7: row rezervasyonu ve immutable result/outbox transaction; cell readback; hash sütununa kör güven yok | K10/K15 |
| R16 | Batch/kota/RAW eksik | MVP §7: adet+byte flush limiti, read/write bucket, verification maliyeti, RAW | K9/K10/K11 |
| R17 | İnsan düzenlemesiyle fixed row yarışı | MVP §7: uygulama yönetimli tablo, conflict stop; atomik compare-and-write iddiası yok | K10 |
| R18 | 180 s job /60 dk soak ve model bekleme SLA'sı tutarsız | ACCEPTANCE §3–4: resident session'da ardışık işler, 180 s toplam, live E2E; replay 10 s adım; teklif/drain açık | K13/K15 |
| R19 | MVP kapsamı, DOM/AX ve finish doğrulaması belirsiz | MVP §2/10 ve TASK §2–4: somut kesitler, işlem profili, doğrulayıcı ve üç durum makinesi | G1a–G1c, K2/K6/K7 |

## 3. Revizyonda ayrıca netleştirilen sınırlar

- UI kontrolü ile dış sistem commit'i arasında genel atomiklik vaat edilmiyor. Kritik yan etkide hedefin sürüm/idempotency sözleşmesi gerekir; sadece tekrar DOM kontrolü yeterli kabul edilmiyor.
- Global harcama hesabı in-flight istek rezervasyonlarını içeriyor; API kullanımı ölçüm bittikten sonra kontrol edilen sınırsız maliyet olmuyor.
- Uçtan uca p95 başarısız işlere 180 saniye ceza uyguluyor; yalnız başarılı ve hızlı işler seçilmiyor. Bunun ≥%90 başarı eşiğinden daha sıkı olduğu açıklandı.
- Geç gelen sonuç gerçek audit'te saklanıyor; eski SLA başarısızlığı değiştirilmeden teslim uzlaştırılabiliyor.
- Backpressure, accepted işleri silmek yerine yeni işi sınırlıyor. Ham payload kotasına DB/WAL/index ve kurtarma payı ekleniyor.
- Kayıt hash'i, kriptografik yetki veya dış doğruluk kanıtı sayılmıyor. Sheets hücreleri yeniden canonicalize edilip karşılaştırılıyor.
- İşlem iptali, dış yan etkinin geri alınması sayılmıyor. Worker'daki eski işlem izole edilmeden session yeni işe açılmıyor.
- Sonuç ve dedupe saklama süreleri ayrılıyor; kalıcı exactly-once iddiası yok. Belirsiz kayıtlar otomatik silinmiyor.
- Mevcut backend'in güçlü araçları sınırlandırılamıyorsa yeniden kullanım adayı eleniyor. Hafif olduğu için yetki katmanı atlanmıyor.

## 4. Belge revizyonu ile teknik doğrulama ayrımı

Bu sürümde 27 bulgunun tasarım karşılığı, sorumlu iş paketi/kapısı ve test yolu yazıldı. Ölçüme bağlı konular açık kaldı: gerçek site corpus'u ve izinler, Linux ortamı, backend/lisans kararı, hesap erişimi/bütçe, 60-session kapasite, gerçek Google OAuth/teslim ve izolasyon uygulanabilirliği.

Bu açık maddeler belgedeki gizli boşluklar değildir; [MVP §13](MVP_PLAN.md) ve [kabul protokolü](ACCEPTANCE.md) altında ilerlemeyi sınırlayan girdilerdir. Kullanıcı verisi veya test sonucu olmadan bunları çözülmüş ilan etmek doğru olmaz. Belgelerin tutarlılık kontrolü runtime testlerinin yerine geçmez.
