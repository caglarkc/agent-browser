# JEV image-free validation
Run: 2026-10-13T14-28-53-678Z. Cases: 90. API calls: 174. Images sent to JEV: 0.

## Entire suite — unsupported cases remain in the denominator

| Profile | Success | Rate | Incorrect/duplicate commit cases | False completion claims | Median successful time |
|---|---:|---:|---:|---:|---:|
| lightpanda-enhanced | 90/90 | 100.0% | 0 | 0 | 1067 ms |

## Per task

| Task | lightpanda-enhanced |
|---|---:|
| read | 10/10 |
| form | 10/10 |
| upload | 10/10 |
| menu | 10/10 |
| overlay | 10/10 |
| lazy | 10/10 |
| shadow | 10/10 |
| autocomplete | 10/10 |
| records | 10/10 |

## Structural core (declared before final validation)

Read, form, upload, menu, overlay, lazy loading, shadow DOM, autocomplete, record identity. Boundary families: iframe, CSS-hidden duplicate labels, pointer, trusted pointer, canvas. Whole-suite scores above remain the main coverage result.

| Profile | Core success | Rate | Descriptive Wilson 95% interval |
|---|---:|---:|---|
| lightpanda-enhanced | 90/90 | 100.0% | 95.9%–100.0% |

## Limits

- Synthetic task families; repeated/related variants are not independent real websites. Wilson intervals are descriptive under an independence assumption, not a general-web confidence bound.
- Field values are supplied by the trusted task contract; no free-form text generation or high-level LLM planning is tested.
- Chromium-rendered still sends zero images to JEV, but uses real layout and browser-generated input. Lightpanda-enhanced uses style filtering and synthetic untrusted pointer events, not real layout.
- Memory is sampled process-tree RSS on macOS; not a Linux total-product cgroup capacity test.

Raw outcomes are in results.json. Request decisions and observed state are in trace.jsonl. Source and binary hashes are in manifest.json. Historical development failures are retained in separate directories and must not be merged into this frozen validation run.