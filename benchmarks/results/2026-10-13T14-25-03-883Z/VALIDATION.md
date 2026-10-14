# JEV image-free validation
Run: 2026-10-13T14-25-03-883Z. Cases: 180. API calls: 546. Images sent to JEV: 0.

## Entire suite — unsupported cases remain in the denominator

| Profile | Success | Rate | Incorrect/duplicate commit cases | False completion claims | Median successful time |
|---|---:|---:|---:|---:|---:|
| chromium-rendered | 89/90 | 98.9% | 1 | 0 | 1933 ms |
| lightpanda-enhanced | 88/90 | 97.8% | 1 | 0 | 1311 ms |

## Per task

| Task | chromium-rendered | lightpanda-enhanced |
|---|---:|---:|
| read | 10/10 | 10/10 |
| form | 10/10 | 9/10 |
| upload | 10/10 | 10/10 |
| menu | 10/10 | 10/10 |
| overlay | 10/10 | 10/10 |
| lazy | 10/10 | 10/10 |
| shadow | 9/10 | 9/10 |
| autocomplete | 10/10 | 10/10 |
| records | 10/10 | 10/10 |

## Structural core (declared before final validation)

Read, form, upload, menu, overlay, lazy loading, shadow DOM, autocomplete, record identity. Boundary families: iframe, CSS-hidden duplicate labels, pointer, trusted pointer, canvas. Whole-suite scores above remain the main coverage result.

| Profile | Core success | Rate | Descriptive Wilson 95% interval |
|---|---:|---:|---|
| chromium-rendered | 89/90 | 98.9% | 94.0%–99.8% |
| lightpanda-enhanced | 88/90 | 97.8% | 92.3%–99.4% |

## Limits

- Synthetic task families; repeated/related variants are not independent real websites. Wilson intervals are descriptive under an independence assumption, not a general-web confidence bound.
- Field values are supplied by the trusted task contract; no free-form text generation or high-level LLM planning is tested.
- Chromium-rendered still sends zero images to JEV, but uses real layout and browser-generated input. Lightpanda-enhanced uses style filtering and synthetic untrusted pointer events, not real layout.
- Memory is sampled process-tree RSS on macOS; not a Linux total-product cgroup capacity test.

Raw outcomes are in results.json. Request decisions and observed state are in trace.jsonl. Source and binary hashes are in manifest.json. Historical development failures are retained in separate directories and must not be merged into this frozen validation run.