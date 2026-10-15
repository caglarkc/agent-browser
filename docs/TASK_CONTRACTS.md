# Görev, işlem ve yürütme sözleşmeleri

> Tarihsel belge: 15 Ekim 2026 itibarıyla agent odaklı tarayıcının güncel kapsamı [BROWSER_REQUIREMENTS.md](BROWSER_REQUIREMENTS.md), uygulama/limit/kabul planı [BROWSER_PLAN.md](BROWSER_PLAN.md) ile belirlenir. Aşağıdaki eski kapsam ve G/K eşikleri güncel ürünün kabul koşulu değildir.

Sürüm: 2.0. Tarih: 2 Ekim 2026. [MVP planının](MVP_PLAN.md) normatif eki. Bu belge uygulanacak tasarımdır; örnek fixture adresleri henüz çalışan servis değildir.

## 1. Güvenilir görev tanımı

İş kabulünde şablon sürümü/hash'i sabitlenir. Model girdisi yalnız bu şablonun açık alanlarını doldurabilir; serbest metin origin, yetki, doğrulayıcı veya yan etki bütçesini değiştiremez. Bilinmeyen alanlar ve sınır dışı değerler reddedilir. Her görev aşağıdaki alanları taşır:

| Alan | Sözleşme |
|---|---|
| Kimlik | job_id, client_request_key, canonical request hash, template_id/version/hash |
| Kaynak ve hedef | Tam origin listesi, izinli akışlar, gerekiyorsa method/path/body kuralı; redirect politikası |
| İş nesnesi | entity_type/entity_id, beklenen sürüm, değişmez alanlar ve karşılaştırma normalizasyonu |
| İzin | İzin verilen adımlar, alanlar, değer/sınırları, en çok dış yan etki sayısı; credential ref |
| İşlem anlamı | dom_semantic veya rendered_user_input; gerekli capability listesi |
| Doğrulama | Güvenilir verifier_id/version, beklenen son durum, kanıt kaynağı, deadline ve yanlış-pozitif testleri |
| Tekrar | Safe read; server-idempotent mutation; veya non-replayable; crash reconciliation yöntemi |
| Kaynak | 30 tur, 180 saniye toplam deadline, model/token/harcama bütçesi, sonuç boyut sınırı |
| Teslim | local veya sheets; sabit dosya/sheet kimliği ya da operatörün provision ettiği hedef; model değiştiremez |

Para, kimlik, tarih ve metin karşılaştırmaları şablonda belirlenir; örneğin para integer minor-unit + currency ile karşılaştırılır. Modelin yuvarlama veya locale tahmini kabul edilmez. URL'ler canonicalize edilip tekrar politikadan geçer; `source_url` değerinin kendisi yeni ağ erişim yetkisi değildir.

### Örnek R2 sözleşmesi

Aşağıdaki örnek replay/fixture için başlangıç şablonudur; gerçek domain, secret veya bütçe değildir. JSON şeması uygulamada ayrıca üretilecek ve doğrulanacaktır.

```json
{
  "template_id": "R2-test-form-create",
  "template_version": 1,
  "model_mode": "replay",
  "allowed_origins": ["https://forms.fixture.test"],
  "entity": {"type": "product", "id": "sku-42", "expected_version": "v7"},
  "operation": {
    "type": "create_test_request",
    "allowed_fields": {"product_id": "sku-42", "quantity": 1},
    "max_external_commits": 1,
    "commit_precondition": "server_checks_entity_version",
    "replay_class": "server_idempotent"
  },
  "interaction_profile": "dom_semantic",
  "verifier_id": "fixture-receipt-v1",
  "required_evidence": ["request_id", "product_id", "quantity", "committed_version"],
  "limits": {"turns": 30, "execution_ms": 150000, "total_ms": 180000, "result_bytes": 100000},
  "delivery": {"kind": "local"}
}
```

İş kabulünde server idempotency key'i job'dan türetilir ve kaydedilir; örnek JSON'a model tarafından yazılmaz. Canlı modda provider/model ve harcama rezervasyonu eksikse çağrı başlatılmaz. `dom_semantic` burada yalnız bu kontrollü formun açık destek taahhüdüdür; her formda geçerli değildir.

## 2. İlk görev şablonları ve verifier

| Şablon | Girdi ve izin | Başarı kanıtı | Yanlış başarı örneği / güvenli duruş |
|---|---|---|---|
| R1 — Kayıt oku | Kaynak, kayıt kimliği, istenen alanlar; tanımlı salt okuma gezinmesi | Controller'ın modelden ayrı okuduğu kayıt/provenance; fixture'da beklenen kayıt; gerçek sitede bağımsız parse/API/receipt ve kaynak zamanı | Başka ürünün fiyatı, eski kayıt, eksik alan, model tahmini → doğrulama FAIL/UNKNOWN |
| R2 — Test formu oluştur | Test/staging hesabı veya açık yetkili dar akış; entity/sürüm/izinli alanlar; tek commit | Hedefin receipt/read-after-write kaydı: doğru entity/değer, job korelasyonu ve tek kayıt | Toast mesajı, doğru metin ama yanlış kayıt, receipt kaybı, iki commit → UNKNOWN veya FAIL; kör submit yok |
| V1 — Görsel hedef seç | Sabit test canvas'ı; yalnız screenshot'tan öğrenilebilen bilgi; izinli seçim | Gerçek görüntüden seçim + modelden saklı fixture durumunda doğru target_id | Placeholder resim, DOM'a gizlenmiş cevap, eski screenshot veya yanlış canvas hedefi → FAIL |

R1 doğrulaması kaynağın iddiasına uygun çıkarımdır; aynı sitenin iki yüzeyinin eşleşmesi bağımsız dünya gerçeği sayılmaz. Kanıt seviyesi sonuçta `source_matched`, `authoritative_receipt` veya `fixture_ground_truth` olarak saklanır. Modelin kendi yanıtını ikinci kez okuması verifier değildir.

Verifier, controller'ın sürümlü kodu ve güvenilir şablonuyla seçilir. Model keyfi assertion/JavaScript/endpoint veremez. Verifier secret'ları browser/modelden ayrıdır; çıktı şeması, süre ve ağ sınırı vardır. Beklenen fixture cevapları modele, prompt'a veya browser DOM'una sızdırılmaz.

Verifier sonucu `PASS`, `FAIL`, `UNKNOWN` ve evidence_ref/reason_code içerir. `PASS` için tüm zorunlu alanlar karşılaştırılır. `FAIL` yanlış son durumu kanıtlar. `UNKNOWN` yeterli kanıt bulunmadığını belirtir; geçici bekleme sınırlı retry ile çözülemezse yürütme `EXECUTION_UNKNOWN` olur. Evidence hash'i veri bütünlüğü içindir; untrusted kaynağı güvenilir yapmaz.

Gerçek site adaptörü; minimum 5 akış/3 domain destek listesinde endpoint/kanıt/sürüm/izin kaydıyla bulunur. R2 mutasyonu güvenilir biçimde doğrulanamıyorsa o akış destek dışıdır. Eksik gerçek site erişimi fixture ile kapatılmaz. Auth gerekli R1/R2 akışları sadece proje için ayrılmış hesaplarda sınanır.

## 3. Araçlar ve işlem profilleri

| Araç | Sözleşme |
|---|---|
| navigate | Politika kapsamındaki URL; document/frame lifecycle; status ve timeout açık |
| observe / find | Scope/cursor/truncated; DOM veya AX türü; belirsiz eşleşmeleri gizlemez |
| click | Ref ve beklenen nesne kimliği; görevin işlem profili; action-time kontrol |
| fill / select_option | İzinli field/value; input/change/autosave etkileri şablon kapsamında |
| press_key | Sınırlı tuşlar ve bağlam; Enter/Space gibi submit tetikleri yan etkili sayılır |
| wait | Bilinen koşul + sınırlı timeout; uyuyarak başarı varsayımı yok |
| screenshot | Gerçek render; viewport/region, pixel cap, crop/scale metadata |
| pointer_click / scroll | Screenshot sürümü ve koordinat dönüşümü; doğru frame/viewport; gerçek render şart |
| finish | Sonuç önerisi; controller doğrulaması başlatır; kendi başına tamamlanma değildir |

Agent'a shell veya arbitrary JS aracı verilmez. Adaptörde kullanılan kontrollü JS, sabit/testli koddur. Mevcut backend'de daha güçlü komutlar varsa allowlist üzerinden kapatılır; model bunlara CLI kaçışıyla erişemez.

`dom_semantic`: tanımlı DOM öğesine işlem ve beklenen DOM/form olayları; gerçek görünürlük, hit-test ve kullanıcı eylemi eşdeğerliği vaat etmez. `rendered_user_input`: tek hedef, görünürlük, gerekli kararlılık, enabled/editable ve click için hit-test/örtülme kontrolleri; viewport/iframe dönüşümü. Desteklenmeyen kontrol `UNSUPPORTED_CAPABILITY` üretir. Her motor/profil eşlemesi K2 conformance'ında doğrulanır.

Observation alanları: session_id, job_id, run_generation, observation_version, frame_id, document_epoch, observation_kind, url, capabilities, nodes, cursor, truncated. Ref, session + frame/document + node kimliğine bağlıdır. Node'da role/name/value/state ile şablonun entity binding'i bulunur. Bağlama kurulamazsa yan etkili işlem reddedilir. Sayfa mutation'ı controller sıra numarasından bağımsızdır.

Action-time kontrol; ref'nin hâlâ aynı nesneyi temsil etmesi, beklenen role/name/state, entity_id/version, form hedefi ve değerleri kapsar. Kontrol ile dispatch arası yarış için eldeki atomiklik açık yazılır. Kritik R2 commit'inde hedef sistemin entity/version precondition kontrolü gerekir. DOM'u kilitleyerek genel internette atomiklik sağlandığı iddia edilmez.

İzinli origin üzerinde izinsiz kayıt/değer değişikliği de `POLICY_DENIED` olur. Fill, select, Enter ve sayfa JS'inin otomatik gönderimleri ayrı denetlenir. Salt okuma şablonu keyfi form doldurma yetkisi vermez. Browser interception yapılamayan ve sunucu kontrolü olmayan yazma akışı otomatik desteklenmez.

## 4. Üç ayrı durum makinesi

### 4.1 Oturum

`SESSION_CREATING → SESSION_READY ↔ SESSION_BUSY → SESSION_CLOSING → SESSION_CLOSED`.

Motor kaybı `SESSION_LOST`; quarantine/cleanup bitene kadar aynı oturum yeni işe verilmez. Görev tamamlanması oturumu terminal hale getirmez. Aynı oturumda ardışık işler olabilir; bir anda en fazla bir aktif yürütme lease'i vardır. Cookie/storage'ın korunması yeni işin başka hesaba erişim izni kazandığı anlamına gelmez. İşler arası auth kapsamı değişirse yeni izole oturum gerekir.

### 4.2 Yürütme

`EXECUTION_ACCEPTED → EXECUTION_RUNNING ↔ WAITING_PROVIDER/NEEDS_INPUT → EXECUTION_VERIFYING → EXECUTION_VERIFIED`.

Kanıtlı hata `EXECUTION_FAILED`; hiç belirsiz in-flight etki kalmadan iptal `EXECUTION_CANCELLED`; sonucu kanıtlanamayan gönderim veya doğrulama `EXECUTION_UNKNOWN`. Terminal duruma gelmiş başarısız deneme otomatik RUNNING'e dönmez. `EXECUTION_UNKNOWN` yalnız kaydedilmiş kanıtla reconcile edilip VERIFIED/FAILED olabilir; bu yeni bir web denemesi değildir. Bilinmeyen sonuç çözülmeden yan etkili yeni deneme açılmaz.

`job cancel` yeni model/tool dispatch'ini derhal kapatır ve generation'ı geçersiz kılar. Gönderilmiş etkiyi geri almaz. Sonuç gerçekten oluşmuşsa uzlaştırma bunu kaydeder; `cancel_requested` audit alanı kalır. Doğrulanmış web sonucunu sonradan iptal etmek mümkün değildir; teslimi durdurmak ayrı komuttur.

`job resume`, yalnız şablonun desteklediği insan girdisini doğrular ve yeni generation açar; iş kimliği, toplam süre ve harcama sıfırlanmaz. CAPTCHA/2FA'nın aşıldığı varsayılmaz. Son tarih geçmişse iş tekrar yürütülmez; gerekirse yeni iş/izin gerekir.

### 4.3 Teslim ve kullanıcıya görünen sonuç

Yerel işte `DELIVERY_NOT_REQUIRED`. Sheets işinde doğrulanmış sonuç transaction'ından sonra `DELIVERY_PENDING → DELIVERY_IN_FLIGHT → DELIVERY_VERIFIED`. Bilinmeyen yanıt `DELIVERY_UNKNOWN →` sınırlı readback uzlaştırması; deadline/kota/credential sorunu `DELIVERY_BLOCKED`; farklı row içeriği `DELIVERY_CONFLICT`.

| Kullanıcıya görünen durum | Koşul |
|---|---|
| RUNNING / NEEDS_INPUT | Yürütme devam ediyor; teslim başarısı henüz yok |
| RESULT_PENDING | EXECUTION_VERIFIED + teslim henüz doğrulanmadı |
| COMPLETED | EXECUTION_VERIFIED + DELIVERY_VERIFIED veya DELIVERY_NOT_REQUIRED |
| FAILED / CANCELLED | Kanıtlı yürütme hatası veya güvenle sonlanmış iptal |
| OUTCOME_UNKNOWN | Yürütmenin dış etkisi/sonucu çözülemedi |

`COMPLETED` sonradan uzlaştırmayla oluşabilir; `deadline_missed=true` değişmez. Geç başarı SLA payını iyileştirmez. API execution_state, delivery_state, cancellation_requested, deadline_missed ve reason_code alanlarını birlikte döndürür. Teslim durumu yürütme durumunu geriye taşımaz.

## 5. Dispatch, tekrar ve generation kontrolü

Kontrol zarfı controller tarafından atanır: job_id, execution_id, run_generation, command_id, session lease, template hash, deadline. Bunlar modelin serbest seçim alanları değildir. Her dispatch öncesi aktif lease/generation, süre, maliyet, iş nesnesi ve politika tekrar doğrulanır.

Yan etkili işlem için sıralama:

1. Kotalar ve sonuç alanı önceden rezerve edilmiş olmalı; contract ve entity precondition doğrulanır.
2. Intent `PREPARED`, canonical parametre hash'i ve replay sınıfıyla kalıcı transaction'a yazılır.
3. Dispatch öncesi `DISPATCHING` kalıcılaştırılır. Bu andan itibaren kayıp cevap olası dış etki sayılır.
4. Tek dispatch yapılır. Yanıt/kanıt `ACKNOWLEDGED` olarak kaydedilir; verifier gerçek son durumu okur.
5. PASS ise immutable result + execution VERIFIED + outbox aynı transaction'da commit edilir.

`PREPARED` kaydı dispatch'e geçilmediği kanıtlandığında güvenli devam edebilir. `DISPATCHING` kaydı, gönderilmeden önce çökülmüş olsa bile, yeniden başlatmada ihtiyatlı biçimde bilinmeyen sonuç olarak uzlaştırılır. Server idempotency desteği şablonda kanıtlandıysa aynı key/payload ile tekrar mümkündür; farklı key üretilemez. Transport timeout tek başına işlemin yapılmadığını kanıtlamaz.

Controller ve worker geç yanıtları tamamlanmış/başka generation'a uygulamaz. Salt sonuç alma/audit, yeni mutasyon değildir. Worker'ın daha önce aldığı komut hâlâ çalışıyor olabiliyorsa session lease'i serbest bırakılmaz; worker sonlandırılır/izole edilir ve dış etki uzlaştırılır. Yalnız context cancel çağrısı bu güvenceyi sağlamış sayılmaz.

HTTP `job start` istemci anahtarı + payload hash'iyle idempotent kabul edilir. İstemci anahtarı aynıysa yeni iş/yan etki oluşturulmaz. Başarısız işin bilinçli yeniden denenmesi yeni anahtar ve önceki job'a bağlanan açık denemedir. Sonuç retention'ından bağımsız minimal dedupe kayıtları en az 30 gün korunur; unresolved kayıtlar çözülene kadar tutulur. Bu pencere dışı tekrar için exactly-once vaat edilmez; API dokümanı eski isteği yeni iş gibi yeniden göndermemeyi ve önce status/reconcile kullanmayı belirtir.

## 6. Çökme ve iptal karar tablosu

| Kesinti noktası | Yeniden başlatma / iptal davranışı | Yasak davranış |
|---|---|---|
| Kabul transaction'ı öncesi | Aynı request key ile güvenli tekrar | Kalıcı kayıt yokken accepted yanıtı |
| Intent PREPARED | Dispatch edilmediği durum makinesinden doğrulanır; koşullar yeniden kontrol edilir | Eski entity precondition ile devam |
| DISPATCHING / kayıp browser cevabı | Receipt/server idempotency kontrolü; yoksa UNKNOWN | Formu kör yeniden gönderme |
| Yan etki oluştu, result transaction'ı yazılmadı | Kaydedilmiş intent üzerinden verifier ile reconcile | Baştan bütün görevi çalıştırma |
| Result + outbox commit edildi | Yalnız teslim işçisi devam eder | Model/browser loop'unu tekrar açma |
| Sheets yazıldı, cevap/local ACK kayboldu | Ayrılmış aynı row ve gerçek hücre değerlerini oku | Append veya yeni row ayırma |
| Cancel sonrası geç model/tool yanıtı | Eski generation'ın dispatch'i reddedilir; mevcut etki audit/reconcile | Sonraki işe ait session'da eski action çalıştırma |
| Disk-full / corrupt DB | Yeni admission/dispatch durur; health unhealthy; operator restore/reconcile | Kayıp durumu boş store sayıp yeniden başlatma |

Disk tam dolduğunda son audit kaydının bile yazılamayabileceği kabul edilir; önceki kalıcı intent ve kurtarma rezervi temel savunmadır. Tüm fiziksel arızalarda sıfır veri kaybı iddiası yoktur. Bozuk store ile otomatik yeni DB oluşturulmaz.

## 7. Yönetim yüzeyi ve hata kodları

CLI/HTTP: session create/status/close; job start/status/cancel/resume/reconcile; delivery status/retry/stop; result export; health/readiness/metrics. Resume/reconcile/delivery retry operatör yetkisindedir, model araçları değildir. Controller `delivery retry` sırasında yalnız aynı immutable sonucu kullanır. Readiness admission kapalıyken bunu bildirir; health sürecin canlı olmasıyla tüm işlerin çalışabildiğini karıştırmaz.

`delivery stop`, henüz gönderilmemiş denemeleri durdurup `DELIVERY_BLOCKED` ve `OPERATOR_STOP` nedenini kaydeder; gönderilmiş isteğin readback uzlaştırmasını engellemez. `session close`, aktif yürütme varsa önce aynı cancel/uzlaştırma kurallarını uygular; kapanan browser dış sistemdeki sonucu geri almaz.

Hatalar: UNSUPPORTED_CAPABILITY, STALE_OBSERVATION, ENTITY_MISMATCH, AMBIGUOUS_ELEMENT, POLICY_DENIED, NAVIGATION_TIMEOUT, DEADLINE_EXCEEDED, RESOURCE_LIMIT, STORAGE_UNAVAILABLE, IDEMPOTENCY_CONFLICT, SESSION_LOST, PROVIDER_LIMIT, VERIFICATION_FAILED, OUTCOME_UNKNOWN, DELIVERY_CONFLICT. Her hata retryable/replay_class/evidence/reason taşır; model hata adına bakarak otomatik retry yetkisi çıkaramaz.

Bu sözleşmenin kabul kanıtları K1–K11, K15 ve K17 testleridir. Bugünkü durumları **NOT_RUN**; test ayrıntıları [ACCEPTANCE.md](ACCEPTANCE.md) içindedir.
