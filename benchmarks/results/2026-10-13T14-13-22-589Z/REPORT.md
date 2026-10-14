# Browser lab run
Policy: jev. Paid API calls: 155.
Results: 21 PASS, 9 FAIL, 0 UNSUPPORTED.

| Task | Profile | Status | Total ms | Calls | Reason |
|---|---|---|---:|---:|---|
| read | chromium-rendered | PASS | 1563 | 1 |  |
| read | chromium-semantic | PASS | 1365 | 1 |  |
| read | lightpanda-semantic | PASS | 552 | 1 |  |
| form | chromium-rendered | PASS | 2634 | 5 |  |
| form | chromium-semantic | PASS | 2671 | 5 |  |
| form | lightpanda-semantic | PASS | 2218 | 5 |  |
| menu | chromium-rendered | PASS | 2560 | 4 |  |
| menu | chromium-semantic | PASS | 2402 | 4 |  |
| menu | lightpanda-semantic | PASS | 1803 | 4 |  |
| autocomplete | chromium-rendered | FAIL | 1448 | 2 | Policy returned BLOCKED |
| autocomplete | chromium-semantic | PASS | 2580 | 5 |  |
| autocomplete | lightpanda-semantic | FAIL | 1121 | 2 | Policy returned BLOCKED |
| records | chromium-rendered | FAIL | 5858 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| records | chromium-semantic | FAIL | 6153 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| records | lightpanda-semantic | FAIL | 5086 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| read | chromium-semantic | PASS | 1353 | 1 |  |
| read | lightpanda-semantic | PASS | 555 | 1 |  |
| read | chromium-rendered | PASS | 1147 | 1 |  |
| form | chromium-semantic | PASS | 2875 | 5 |  |
| form | lightpanda-semantic | PASS | 2232 | 5 |  |
| form | chromium-rendered | PASS | 3084 | 5 |  |
| menu | chromium-semantic | PASS | 2310 | 4 |  |
| menu | lightpanda-semantic | PASS | 1635 | 4 |  |
| menu | chromium-rendered | PASS | 2120 | 4 |  |
| autocomplete | chromium-semantic | PASS | 2472 | 5 |  |
| autocomplete | lightpanda-semantic | PASS | 2079 | 5 |  |
| autocomplete | chromium-rendered | FAIL | 2745 | 4 | Independent fixture oracle did not confirm exactly one correct result |
| records | chromium-semantic | FAIL | 6157 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| records | lightpanda-semantic | FAIL | 5421 | 12 | Independent fixture oracle did not confirm exactly one correct result |
| records | chromium-rendered | FAIL | 5946 | 12 | Independent fixture oracle did not confirm exactly one correct result |

Fresh startup included. Scripted success measures driver/fixture compatibility, not model intelligence. Canvas PASS uses fixture-defined coordinates, not AI vision. macOS sampled browser RSS is not Linux cgroup memory or a 60-session capacity result.