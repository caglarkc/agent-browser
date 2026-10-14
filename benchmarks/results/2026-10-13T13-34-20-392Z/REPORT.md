# Browser lab run
Policy: scripted. Paid API calls: 0.
Results: 26 PASS, 5 FAIL, 2 UNSUPPORTED.

| Task | Profile | Status | Total ms | Calls | Reason |
|---|---|---|---:|---:|---|
| read | chromium-rendered | PASS | 605 | 0 |  |
| read | chromium-semantic | PASS | 573 | 0 |  |
| read | lightpanda-semantic | PASS | 286 | 0 |  |
| form | chromium-rendered | PASS | 1237 | 0 |  |
| form | chromium-semantic | PASS | 1204 | 0 |  |
| form | lightpanda-semantic | PASS | 889 | 0 |  |
| upload | chromium-rendered | PASS | 916 | 0 |  |
| upload | chromium-semantic | PASS | 892 | 0 |  |
| upload | lightpanda-semantic | PASS | 581 | 0 |  |
| menu | chromium-rendered | PASS | 932 | 0 |  |
| menu | chromium-semantic | PASS | 895 | 0 |  |
| menu | lightpanda-semantic | PASS | 580 | 0 |  |
| overlay | chromium-rendered | PASS | 917 | 0 |  |
| overlay | chromium-semantic | PASS | 889 | 0 |  |
| overlay | lightpanda-semantic | PASS | 578 | 0 |  |
| lazy | chromium-rendered | PASS | 915 | 0 |  |
| lazy | chromium-semantic | PASS | 887 | 0 |  |
| lazy | lightpanda-semantic | PASS | 579 | 0 |  |
| shadow | chromium-rendered | PASS | 760 | 0 |  |
| shadow | chromium-semantic | PASS | 746 | 0 |  |
| shadow | lightpanda-semantic | PASS | 425 | 0 |  |
| iframe | chromium-rendered | PASS | 752 | 0 |  |
| iframe | chromium-semantic | PASS | 750 | 0 |  |
| iframe | lightpanda-semantic | FAIL | 5208 | 0 | Expected control did not appear |
| css-hidden | chromium-rendered | PASS | 755 | 0 |  |
| css-hidden | chromium-semantic | FAIL | 732 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | lightpanda-semantic | FAIL | 423 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | chromium-rendered | PASS | 762 | 0 |  |
| pointer | chromium-semantic | FAIL | 729 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-semantic | FAIL | 424 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| canvas | chromium-rendered | PASS | 755 | 0 |  |
| canvas | chromium-semantic | UNSUPPORTED | 460 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 167 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |

Fresh startup included. Scripted success measures driver/fixture compatibility, not model intelligence. Canvas PASS uses fixture-defined coordinates, not AI vision. macOS sampled browser RSS is not Linux cgroup memory or a 60-session capacity result.