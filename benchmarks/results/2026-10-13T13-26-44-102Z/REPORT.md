# Browser lab run
Policy: scripted. Paid API calls: 0.
Results: 17 PASS, 8 FAIL, 2 UNSUPPORTED.

| Task | Profile | Status | Total ms | Calls | Reason |
|---|---|---|---:|---:|---|
| read | chromium-rendered | FAIL | 1369 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| read | chromium-semantic | FAIL | 1498 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| read | lightpanda-semantic | FAIL | 303 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| form | chromium-rendered | FAIL | 6166 | 0 | Expected control did not appear |
| form | chromium-semantic | FAIL | 5586 | 0 | Expected control did not appear |
| form | lightpanda-semantic | FAIL | 5251 | 0 | Expected control did not appear |
| upload | chromium-rendered | PASS | 2392 | 0 |  |
| upload | chromium-semantic | PASS | 1556 | 0 |  |
| upload | lightpanda-semantic | PASS | 604 | 0 |  |
| menu | chromium-rendered | PASS | 1696 | 0 |  |
| menu | chromium-semantic | PASS | 1734 | 0 |  |
| menu | lightpanda-semantic | PASS | 585 | 0 |  |
| overlay | chromium-rendered | PASS | 2269 | 0 |  |
| overlay | chromium-semantic | PASS | 1842 | 0 |  |
| overlay | lightpanda-semantic | PASS | 581 | 0 |  |
| lazy | chromium-rendered | PASS | 1913 | 0 |  |
| lazy | chromium-semantic | PASS | 2019 | 0 |  |
| lazy | lightpanda-semantic | PASS | 756 | 0 |  |
| shadow | chromium-rendered | FAIL | 6118 | 0 | Expected control did not appear |
| shadow | chromium-semantic | PASS | 869 | 0 |  |
| shadow | lightpanda-semantic | PASS | 425 | 0 |  |
| iframe | chromium-rendered | PASS | 1502 | 0 |  |
| iframe | chromium-semantic | PASS | 1727 | 0 |  |
| iframe | lightpanda-semantic | FAIL | 5217 | 0 | Expected control did not appear |
| canvas | chromium-rendered | PASS | 903 | 0 |  |
| canvas | chromium-semantic | UNSUPPORTED | 1274 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 175 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |

Fresh startup included. Scripted success measures driver/fixture compatibility, not model intelligence. Canvas PASS uses fixture-defined coordinates, not AI vision. macOS sampled browser RSS is not Linux cgroup memory or a 60-session capacity result.