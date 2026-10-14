# Browser lab run
Policy: scripted. Paid API calls: 0.
Results: 26 PASS, 5 FAIL, 2 UNSUPPORTED.

| Task | Profile | Status | Total ms | Calls | Reason |
|---|---|---|---:|---:|---|
| read | chromium-rendered | PASS | 671 | 0 |  |
| read | chromium-semantic | PASS | 587 | 0 |  |
| read | lightpanda-semantic | PASS | 287 | 0 |  |
| form | chromium-rendered | PASS | 1237 | 0 |  |
| form | chromium-semantic | PASS | 1205 | 0 |  |
| form | lightpanda-semantic | PASS | 889 | 0 |  |
| upload | chromium-rendered | PASS | 915 | 0 |  |
| upload | chromium-semantic | PASS | 892 | 0 |  |
| upload | lightpanda-semantic | PASS | 580 | 0 |  |
| menu | chromium-rendered | PASS | 912 | 0 |  |
| menu | chromium-semantic | PASS | 886 | 0 |  |
| menu | lightpanda-semantic | PASS | 577 | 0 |  |
| overlay | chromium-rendered | PASS | 917 | 0 |  |
| overlay | chromium-semantic | PASS | 890 | 0 |  |
| overlay | lightpanda-semantic | PASS | 575 | 0 |  |
| lazy | chromium-rendered | PASS | 918 | 0 |  |
| lazy | chromium-semantic | PASS | 879 | 0 |  |
| lazy | lightpanda-semantic | PASS | 577 | 0 |  |
| shadow | chromium-rendered | PASS | 768 | 0 |  |
| shadow | chromium-semantic | PASS | 743 | 0 |  |
| shadow | lightpanda-semantic | PASS | 424 | 0 |  |
| iframe | chromium-rendered | PASS | 779 | 0 |  |
| iframe | chromium-semantic | PASS | 741 | 0 |  |
| iframe | lightpanda-semantic | FAIL | 5205 | 0 | Expected control did not appear |
| css-hidden | chromium-rendered | PASS | 754 | 0 |  |
| css-hidden | chromium-semantic | FAIL | 731 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | lightpanda-semantic | FAIL | 424 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | chromium-rendered | PASS | 763 | 0 |  |
| pointer | chromium-semantic | FAIL | 738 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-semantic | FAIL | 421 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| canvas | chromium-rendered | PASS | 749 | 0 |  |
| canvas | chromium-semantic | UNSUPPORTED | 479 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 166 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |

Fresh startup included. Scripted success measures driver/fixture compatibility, not model intelligence. Canvas PASS uses fixture-defined coordinates, not AI vision. macOS sampled browser RSS is not Linux cgroup memory or a 60-session capacity result.