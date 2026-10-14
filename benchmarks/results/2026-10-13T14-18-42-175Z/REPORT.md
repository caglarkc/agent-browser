# Browser lab run
Policy: jev. Paid API calls: 18.
Results: 1 PASS, 3 FAIL, 0 UNSUPPORTED.

| Task | Profile | Status | Total ms | Calls | Reason |
|---|---|---|---:|---:|---|
| trusted-pointer | chromium-rendered | PASS | 1626 | 2 |  |
| trusted-pointer | chromium-semantic | FAIL | 1414 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-semantic | FAIL | 896 | 2 | Independent fixture oracle did not confirm exactly one correct result |
| trusted-pointer | lightpanda-enhanced | FAIL | 5604 | 12 | Independent fixture oracle did not confirm exactly one correct result |

Fresh startup included. Scripted success measures driver/fixture compatibility, not model intelligence. Canvas PASS uses fixture-defined coordinates, not AI vision. macOS sampled browser RSS is not Linux cgroup memory or a 60-session capacity result.