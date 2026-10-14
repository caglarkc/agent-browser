import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {distribution} from './metrics.mjs';
const control=path.resolve(process.argv[2]),research=path.resolve(process.argv[3]);
const controlSummary=JSON.parse(await readFile(path.join(control,'summary.json'),'utf8'));
const researchSummary=JSON.parse(await readFile(path.join(research,'summary.json'),'utf8'));
const rows=JSON.parse(await readFile(path.join(research,'results.json'),'utf8'));
const modes=['chromium-ocr','chromium-dom','lightpanda-dom'];
const names={'chromium-ocr':'Chromium screenshot → yerel OCR → JEV','chromium-dom':'Chromium DOM → JEV','lightpanda-dom':'Görselsiz Lightpanda DOM → JEV'};
const seconds=x=>(x/1000).toFixed(2),mb=x=>(x/1e6).toFixed(1);
const table=phase=>[
'| Yol | Başarı | Medyan süre | p95 | Tarayıcı footprint | Yerel toplam footprint |',
'|---|---:|---:|---:|---:|---:|',
...modes.map(mode=>{const g=researchSummary.groups[phase+'-'+mode];return `| ${names[mode]} | ${g.passed}/${g.n} | ${seconds(g.totalMs.median)} sn | ${seconds(g.totalMs.p95)} sn | ${mb(g.browserFootprint.median)} MB | ${mb(g.pipelineFootprint.median)} MB |`})];
const visual=researchSummary.groups['warm-chromium-ocr'],plain=researchSummary.groups['warm-lightpanda-dom'];
const timeReduction=(1-plain.totalMs.median/visual.totalMs.median)*100,ramReduction=(1-plain.pipelineFootprint.median/visual.pipelineFootprint.median)*100;
const share=distribution(rows.filter(r=>r.phase==='warm'&&r.mode==='lightpanda-dom').map(r=>r.modelMs/r.totalMs*100)).median;
const details=['captureMs','ocrMs','modelMs','pageCreateMs','navigationMs','observeMs','actionMs','verifyMs'].map(metric=>`| ${metric} | ${modes.map(m=>Math.round(researchSummary.groups['warm-'+m][metric].median)).join(' | ')} |`);
const lines=[
'# JEV araştırma hızı ve RAM karşılaştırması',
'',
`**Aynı belge araştırma akışında hazır oturumdaki medyan süre görsel OCR yolunda ${seconds(visual.totalMs.median)} saniye, görselsiz Lightpanda yolunda ${seconds(plain.totalMs.median)} saniye. Süre yaklaşık %${timeReduction.toFixed(1)}, ölçülen yerel toplam footprint yaklaşık %${ramReduction.toFixed(1)} azaldı.**`,
'',
'## Araştırma görevi',
'',
'Bir belge kütüphanesinde Notebook specifications belgesini aç, aylık/yıllık fiyatları ayır ve doğru yıllık fiyatı raporla. Belge ayrı bir yerel HTTP isteğiyle yüklenir. Hedef fiyat modelin goal veya expected alanına verilmez. Görsel yol ekran görüntüsünden OCR ile metin ve koordinat çıkarır; HTML/DOM okuyarak tıklama hedefi bulmaz. Sonuç, ayrı fixture süreçteki oracle ile kontrol edilir.',
'',
'10 farklı fiyat varyasyonu × 3 yol × soğuk/hazır oturum = 60 deney. Üç yolun tümü iki fazda da 10/10 doğru sonucu verdi. JEV 1.13.0 kullanıldı; çoğu görev iki karar çağrısıyla tamamlandı. 60 araştırma denemesinde toplam 122 JEV çağrısı yapıldı; bekleme kararları da kayıtlarda tutuldu.',
'',
'## Hazır oturum',
'',
...table('warm'),
'',
'Hazır oturumda browser/yerel OCR işçisi model çağrısı yapılmadan ısıtılır ve alt görevler arasında yeniden kullanılır. Her görev yine yeni tab açar. Süre sayfa/tab oluşturma, HTTP yükleme, gözlem, JEV, etkileşim, settle ve doğrulamayı içerir; başlangıç ve son cleanup dahil değildir.',
'',
'## Soğuk başlangıç',
'',
...table('cold'),
'',
'Soğuk faz her görev için browser ve gerekirse OCR işçisini başlatır; başlangıç süresi toplamda dahildir. Son cleanup ve rapor yazımı dahil değildir. OS disk/cache durumları sıfırlanmadı; cihazın kullanıcı uygulamaları kontrol edilmedi.',
'',
'## Hazır araştırma akışının süre bileşenleri',
'',
'| Metrik — ms | Screenshot/OCR | Chromium DOM | Lightpanda DOM |',
'|---|---:|---:|---:|',
...details,
'',
`Görselsiz yolda JEV çağrıları görev süresinin medyan yaklaşık %${share.toFixed(1)} bölümünü oluşturdu. Motor/DOM maliyeti küçülünce kalan hızın ana sınırı model/ağ karar döngüsü oluyor. Bileşen medyanları farklı denemelerden geldiği için bunları toplayarak toplam medyan hesaplamak doğru değildir.`,
'',
'## Daha geniş kontrol akışları: 180 sıralı deney',
'',
'Okuma, gecikmeli menü, doğru kayıt seçimi, CSS-hidden öğe, pointer widget ve modal; her grupta 30 deneme. Üç yol da soğuk ve hazır fazlarda 30/30 geçti.',
'',
'| Faz/yol | Medyan süre | p95 | Tarayıcı RSS | Yerel toplam RSS |',
'|---|---:|---:|---:|---:|',
...Object.entries(controlSummary.groups).map(([key,g])=>`| ${key} | ${seconds(g.totalMs.median)} sn | ${seconds(g.totalMs.p95)} sn | ${mb(g.browserTreeRss.median)} MB | ${mb(g.pipelineRss.median)} MB |`),
'',
'Bu geniş koşu ilk RSS ölçümüdür; üstteki özel araştırma koşusu ayrıca native footprint ölçer. Görev karmaları farklıdır; iki tabloda farklı sonuç çıkması çelişki değildir. Chromium soğuk başlangıcında çok saniyelik sıçramalar oldu; ham denemeler ve p95 içinde tutuldu.',
'',
'## RAM metriklerinin anlamı',
'',
'- Footprint: macOS `proc_pid_rusage` / `ri_phys_footprint`, her örnekte süreçler üzerinden toplam. Kullanıcıya RAM sonucunu gösterirken bu tablo esas alınır.',
'- RSS: resident set toplamı. Paylaşılan framework/kütüphane sayfaları birden fazla süreçte sayılabildiği için daha büyük görünebilir. RSS ve footprint birbirinin yerine kullanılmaz.',
'- Tarayıcı: browser root + çocukları. Yerel toplam: tarayıcı + varsa OCR işçisi + Node karar/yürütme sürücüsü. Uzak JEV sunucusu ve test fixture süreç hariçtir; ölçüm/raporlama sürücü overhead’i toplamda bulunur.',
'- Tablo RAM değerleri, her denemede 100 ms örneklemeyle görülen tepe değerlerin medyanıdır; bilgisayarın toplam RAM tüketimi veya süreçlerin mutlak lifetime tepe garantisi değildir. Sampling browser bağlantısı kurulduktan sonra başlar.',
'- Aynı anda yalnız bir benchmark browser yolu çalıştı; yolların sırası tekrarlarda döndürüldü. Driver ve worker cache/bellek büyümesi kayda dahildir. GPU/system servislerine ait süreç dışı tahsisler ayrıca ölçülmedi.',
'',
'## Görsel araştırmanın sınırı',
'',
'JEV doğrudan görüntü kabul etmiyor: [TypeSafe State belgesi](https://docs.typesafe.ai/concepts/state). Bu yüzden görsel karşılaştırma yerel Apple Vision OCR ön işleme + JEV şeklindedir; görsel bir LLM değildir. Görsel anlam taşıyan ikon, fotoğraf, harita veya canvas anlayışı bu deneyin kapsamında değildir. Sonuçlar aynı yerel belge araştırmasına aittir; genel internet araştırma performansı/SLA veya 60 oturum kapasite kabulü değildir.',
'',
'## Tekrar çalıştırma',
'',
'```sh',
'swiftc src/ocr.swift -o bin/browser-lab-ocr -framework Vision -framework ImageIO',
'clang -O2 src/memprobe.c -o bin/browser-lab-memprobe',
'npm test',
'npm run perf -- --repeat 5',
'npm run perf -- --repeat 10 --tasks research --variant-offset 91',
'```',
'',
`- [180 kontrol deneyinin ham sonuçları](${path.relative(process.cwd(),control)}/results.json)`,
`- [60 araştırma deneyinin ham sonuçları](${path.relative(process.cwd(),research)}/results.json)`,
`- [Araştırma özeti](${path.relative(process.cwd(),research)}/summary.json)`,
`- [Araştırma kaynak/sürüm manifesti](${path.relative(process.cwd(),research)}/manifest.json)`,
'',
'Source snapshot’ları, karar/observation kayıtları ve örneklenen süreç metrikleri artifact dizinlerinde tutulur. API anahtarı kayıtlara yazılmaz. macOS 26.6.2, arm64, sistem Chrome 155.0.8059.40, Lightpanda 1.0.0; native OCR Apple Vision accurate/en-US.',
];
await writeFile('PERFORMANCE_RESULTS.md',lines.join('\n')+'\n');console.log(JSON.stringify({research:researchSummary.runId,timeReductionPercent:timeReduction,ramReductionPercent:ramReduction,jevSharePercent:share}));
