# Browser lab run
Policy: scripted. Paid API calls: 0.
Results: 6 PASS, 2 FAIL, 0 UNSUPPORTED.

| Task | Profile | Status | Total ms | Calls | Reason |
|---|---|---|---:|---:|---|
| read | chromium-rendered | FAIL | 701 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| read | lightpanda-semantic | FAIL | 291 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| form | chromium-rendered | PASS | 1141 | 0 |  |
| form | lightpanda-semantic | PASS | 739 | 0 |  |
| menu | chromium-rendered | PASS | 1479 | 0 |  |
| menu | lightpanda-semantic | PASS | 1082 | 0 |  |
| shadow | chromium-rendered | PASS | 797 | 0 |  |
| shadow | lightpanda-semantic | PASS | 427 | 0 |  |

Fresh startup included. Scripted success measures driver/fixture compatibility, not model intelligence. Canvas PASS uses fixture-defined coordinates, not AI vision. macOS sampled browser RSS is not Linux cgroup memory or a 60-session capacity result.