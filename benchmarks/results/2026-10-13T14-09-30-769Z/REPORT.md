# Browser lab run
Policy: jev. Paid API calls: 192.
Results: 50 PASS, 10 FAIL, 6 UNSUPPORTED.

| Task | Profile | Status | Total ms | Calls | Reason |
|---|---|---|---:|---:|---|
| read | chromium-rendered | PASS | 1311 | 1 |  |
| read | chromium-semantic | PASS | 986 | 1 |  |
| read | lightpanda-semantic | PASS | 573 | 1 |  |
| form | chromium-rendered | PASS | 2705 | 5 |  |
| form | chromium-semantic | PASS | 2555 | 5 |  |
| form | lightpanda-semantic | PASS | 2108 | 5 |  |
| upload | chromium-rendered | PASS | 1787 | 3 |  |
| upload | chromium-semantic | PASS | 1731 | 3 |  |
| upload | lightpanda-semantic | PASS | 1336 | 3 |  |
| menu | chromium-rendered | PASS | 1786 | 3 |  |
| menu | chromium-semantic | PASS | 1803 | 3 |  |
| menu | lightpanda-semantic | PASS | 1299 | 3 |  |
| overlay | chromium-rendered | PASS | 1792 | 3 |  |
| overlay | chromium-semantic | PASS | 2032 | 3 |  |
| overlay | lightpanda-semantic | PASS | 1361 | 3 |  |
| lazy | chromium-rendered | PASS | 1817 | 3 |  |
| lazy | chromium-semantic | PASS | 2263 | 3 |  |
| lazy | lightpanda-semantic | PASS | 935 | 2 |  |
| shadow | chromium-rendered | PASS | 1606 | 2 |  |
| shadow | chromium-semantic | PASS | 1516 | 2 |  |
| shadow | lightpanda-semantic | PASS | 897 | 2 |  |
| iframe | chromium-rendered | PASS | 1471 | 2 |  |
| iframe | chromium-semantic | PASS | 1430 | 2 |  |
| iframe | lightpanda-semantic | FAIL | 529 | 1 | Policy returned BLOCKED |
| css-hidden | chromium-rendered | PASS | 1463 | 2 |  |
| css-hidden | chromium-semantic | FAIL | 1374 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | lightpanda-semantic | FAIL | 961 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | chromium-rendered | PASS | 1569 | 2 |  |
| pointer | chromium-semantic | FAIL | 5788 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-semantic | FAIL | 5208 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| canvas | chromium-rendered | UNSUPPORTED | 536 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-semantic | UNSUPPORTED | 553 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 167 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| read | chromium-semantic | PASS | 908 | 1 |  |
| read | lightpanda-semantic | PASS | 517 | 1 |  |
| read | chromium-rendered | PASS | 955 | 1 |  |
| form | chromium-semantic | PASS | 2765 | 5 |  |
| form | lightpanda-semantic | PASS | 2149 | 5 |  |
| form | chromium-rendered | PASS | 2806 | 5 |  |
| upload | chromium-semantic | PASS | 1786 | 3 |  |
| upload | lightpanda-semantic | PASS | 1297 | 3 |  |
| upload | chromium-rendered | PASS | 1753 | 3 |  |
| menu | chromium-semantic | PASS | 1762 | 3 |  |
| menu | lightpanda-semantic | PASS | 1290 | 3 |  |
| menu | chromium-rendered | PASS | 1831 | 3 |  |
| overlay | chromium-semantic | PASS | 1696 | 3 |  |
| overlay | lightpanda-semantic | PASS | 1432 | 3 |  |
| overlay | chromium-rendered | PASS | 1752 | 3 |  |
| lazy | chromium-semantic | PASS | 1794 | 3 |  |
| lazy | lightpanda-semantic | PASS | 1036 | 2 |  |
| lazy | chromium-rendered | PASS | 1848 | 3 |  |
| shadow | chromium-semantic | PASS | 1306 | 2 |  |
| shadow | lightpanda-semantic | PASS | 1051 | 2 |  |
| shadow | chromium-rendered | PASS | 1502 | 2 |  |
| iframe | chromium-semantic | PASS | 1355 | 2 |  |
| iframe | lightpanda-semantic | FAIL | 528 | 1 | Policy returned BLOCKED |
| iframe | chromium-rendered | PASS | 1517 | 2 |  |
| css-hidden | chromium-semantic | FAIL | 1343 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | lightpanda-semantic | FAIL | 895 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | chromium-rendered | PASS | 1302 | 2 |  |
| pointer | chromium-semantic | FAIL | 5754 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-semantic | FAIL | 4946 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | chromium-rendered | PASS | 1311 | 2 |  |
| canvas | chromium-semantic | UNSUPPORTED | 522 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | lightpanda-semantic | UNSUPPORTED | 166 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |
| canvas | chromium-rendered | UNSUPPORTED | 521 | 0 | Pixel-dependent task; this profile/policy has no visual execution path |

Fresh startup included. Scripted success measures driver/fixture compatibility, not model intelligence. Canvas PASS uses fixture-defined coordinates, not AI vision. macOS sampled browser RSS is not Linux cgroup memory or a 60-session capacity result.