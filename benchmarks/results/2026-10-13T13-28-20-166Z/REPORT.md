# Browser lab run
Policy: scripted. Paid API calls: 0.
Results: 24 PASS, 1 FAIL, 2 UNSUPPORTED.

| Task | Profile | Status | Total ms | Calls | Reason |
|---|---|---|---:|---:|---|
| read | chromium-rendered | PASS | 1622 | 0 |  |
| read | chromium-semantic | PASS | 1761 | 0 |  |
| read | lightpanda-semantic | PASS | 522 | 0 |  |
| form | chromium-rendered | PASS | 1935 | 0 |  |
| form | chromium-semantic | PASS | 2313 | 0 |  |
| form | lightpanda-semantic | PASS | 920 | 0 |  |
| upload | chromium-rendered | PASS | 1729 | 0 |  |
| upload | chromium-semantic | PASS | 1745 | 0 |  |
| upload | lightpanda-semantic | PASS | 584 | 0 |  |
| menu | chromium-rendered | PASS | 1595 | 0 |  |
| menu | chromium-semantic | PASS | 1945 | 0 |  |
| menu | lightpanda-semantic | PASS | 588 | 0 |  |
| overlay | chromium-rendered | PASS | 1700 | 0 |  |
| overlay | chromium-semantic | PASS | 1916 | 0 |  |
| overlay | lightpanda-semantic | PASS | 595 | 0 |  |
| lazy | chromium-rendered | PASS | 1865 | 0 |  |
| lazy | chromium-semantic | PASS | 2124 | 0 |  |
| lazy | lightpanda-semantic | PASS | 753 | 0 |  |
| shadow | chromium-rendered | PASS | 1611 | 0 |  |
| shadow | chromium-semantic | PASS | 1561 | 0 |  |
| shadow | lightpanda-semantic | PASS | 428 | 0 |  |
| iframe | chromium-rendered | PASS | 1637 | 0 |  |
| iframe | chromium-semantic | PASS | 1698 | 0 |  |
| iframe | lightpanda-semantic | FAIL | 5227 | 0 | Expected control did not appear |
| canvas | chromium-rendered | PASS | 906 | 0 |  |
| canvas | chromium-semantic | UNSUPPORTED | 1605 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 347 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |

Fresh startup included. Scripted success measures driver/fixture compatibility, not model intelligence. Canvas PASS uses fixture-defined coordinates, not AI vision. macOS sampled browser RSS is not Linux cgroup memory or a 60-session capacity result.