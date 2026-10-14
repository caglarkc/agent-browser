# JEV image-free validation
Run: 2026-10-13T14-19-10-625Z. Cases: 560. API calls: 1745. Images sent to JEV: 0.

## Entire suite — unsupported cases remain in the denominator

| Profile | Success | Rate | Incorrect/duplicate commit cases | False completion claims | Median successful time |
|---|---:|---:|---:|---:|---:|
| chromium-rendered | 126/140 | 90.0% | 0 | 4 | 1599 ms |
| chromium-semantic | 101/140 | 72.1% | 6 | 11 | 1778 ms |
| lightpanda-semantic | 91/140 | 65.0% | 5 | 12 | 1298 ms |
| lightpanda-enhanced | 106/140 | 75.7% | 1 | 4 | 964 ms |

## Per task

| Task | chromium-rendered | chromium-semantic | lightpanda-semantic | lightpanda-enhanced |
|---|---:|---:|---:|---:|
| read | 10/10 | 10/10 | 10/10 | 10/10 |
| form | 6/10 | 6/10 | 6/10 | 6/10 |
| upload | 10/10 | 10/10 | 10/10 | 10/10 |
| menu | 10/10 | 10/10 | 10/10 | 10/10 |
| overlay | 10/10 | 10/10 | 10/10 | 10/10 |
| lazy | 10/10 | 10/10 | 10/10 | 10/10 |
| shadow | 10/10 | 10/10 | 10/10 | 10/10 |
| iframe | 10/10 | 10/10 | 0/10 | 0/10 |
| css-hidden | 10/10 | 5/10 | 5/10 | 10/10 |
| pointer | 10/10 | 0/10 | 0/10 | 10/10 |
| trusted-pointer | 10/10 | 0/10 | 0/10 | 0/10 |
| autocomplete | 10/10 | 10/10 | 10/10 | 10/10 |
| records | 10/10 | 10/10 | 10/10 | 10/10 |
| canvas | 0/10 | 0/10 | 0/10 | 0/10 |

## Structural core (declared before final validation)

Read, form, upload, menu, overlay, lazy loading, shadow DOM, autocomplete, record identity. Boundary families: iframe, CSS-hidden duplicate labels, pointer, trusted pointer, canvas. Whole-suite scores above remain the main coverage result.

| Profile | Core success | Rate | Descriptive Wilson 95% interval |
|---|---:|---:|---|
| chromium-rendered | 86/90 | 95.6% | 89.1%–98.3% |
| chromium-semantic | 86/90 | 95.6% | 89.1%–98.3% |
| lightpanda-semantic | 86/90 | 95.6% | 89.1%–98.3% |
| lightpanda-enhanced | 86/90 | 95.6% | 89.1%–98.3% |

## Limits

- Synthetic task families; repeated/related variants are not independent real websites. Wilson intervals are descriptive under an independence assumption, not a general-web confidence bound.
- Field values are supplied by the trusted task contract; no free-form text generation or high-level LLM planning is tested.
- Chromium-rendered still sends zero images to JEV, but uses real layout and browser-generated input. Lightpanda-enhanced uses style filtering and synthetic untrusted pointer events, not real layout.
- Memory is sampled process-tree RSS on macOS; not a Linux total-product cgroup capacity test.

Raw outcomes are in results.json. Request decisions and observed state are in trace.jsonl. Source and binary hashes are in manifest.json. Historical development failures are retained in separate directories and must not be merged into this frozen validation run.