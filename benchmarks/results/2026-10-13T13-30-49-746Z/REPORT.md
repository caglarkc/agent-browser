# Browser lab run
Policy: scripted. Paid API calls: 0.
Results: 2 PASS, 4 FAIL, 0 UNSUPPORTED.

| Task | Profile | Status | Total ms | Calls | Reason |
|---|---|---|---:|---:|---|
| css-hidden | chromium-rendered | PASS | 895 | 0 |  |
| css-hidden | chromium-semantic | FAIL | 742 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| css-hidden | lightpanda-semantic | FAIL | 450 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | chromium-rendered | PASS | 796 | 0 |  |
| pointer | chromium-semantic | FAIL | 730 | 0 | Independent fixture oracle did not confirm exactly one correct result |
| pointer | lightpanda-semantic | FAIL | 424 | 0 | Independent fixture oracle did not confirm exactly one correct result |

Fresh startup included. Scripted success measures driver/fixture compatibility, not model intelligence. Canvas PASS uses fixture-defined coordinates, not AI vision. macOS sampled browser RSS is not Linux cgroup memory or a 60-session capacity result.