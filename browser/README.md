# Agent Browser core

[Development history and change rationale](../docs/DEVELOPMENT_HISTORY.md) records problems, fixes, evidence and remaining work across the lab and browser product.

A1 introduces the browser's trusted local SDK and machine JSON-lines CLI. It launches our source-pinned, patched Lightpanda binary directly. It has no JEV dependency, Chrome path, OCR, screenshots, human browsing interface or credential API.

```sh
cd browser
npm ci --ignore-scripts
npm run engine:build
npm test
npm run measure
```

The runtime binary is `bin/lightpanda`, verified against `engine/manifest.json` before every worker launch. [Engine build instructions](engine/README.md) describe the exact upstream commit, native patch, toolchain and source verification. Puppeteer Core is pinned to 25.13.0. The original `../lab/bin/lightpanda` is used only by an explicitly labelled regression probe; it is never a fallback. The macOS memory helper at `../lab/bin/browser-lab-memprobe` provides physical footprint; when unavailable, the sampler keeps footprint null and reports RSS separately.

## SDK

```js
import {BrowserHost} from './src/host.mjs';

const host = new BrowserHost({stateDir: '/tmp/my-agent-browser-profiles'});
try {
  host.defineProfile({id: 'research', principalId: 'synthetic-account', policyId: 'fixtures-only'});
  const session = await host.openProfile('research');
  const tab = await host.newTab('research');
  await host.navigate(tab.id, 'http://127.0.0.1:8767/page');
  const state = await host.inspect(tab.id);
  // Pass structured state to a caller; A1 has no model loop.
} finally {
  await host.close();
}
```

`principalId` and `policyId` bind a profile's identity; they are metadata, not enforced A2 agent grants. `navigate` accepts literal loopback HTTP fixture URLs only. This input check is not a network sandbox: page scripts/redirects are not yet subject to mandatory egress filtering. A1 is for trusted synthetic fixtures, without real accounts or sensitive data.

## Machine commands

`npm run cli --silent` consumes one JSON object per line: `{ "id": 1, "method": "capabilities", "args": [] }`. Results have the same request ID. Methods are allowlisted in `src/cli.mjs`; EOF/SIGINT/SIGTERM close workers. This trusted local transport exposes no HTTP listener and has no human navigation panel. A2 authentication/OS isolation and A4 private input are not implemented here.

| API | Contract |
|---|---|
| `defineProfile({id, principalId, policyId})` | Immutable binding in this host; duplicate IDs rejected |
| `openProfile(id)` | Reserves worker quota and an atomic on-disk profile lock; returns fresh worker/session IDs |
| `profiles()`, `tabs(profileId)` | Bounded lifecycle metadata; no raw CDP endpoint |
| `newTab(profileId)` | Creates a real native page and an opaque tab ID |
| `navigate/back/forward/reload/inspect(tabId, …)` | Per-profile serialized operations; native history, document epoch, bounded page text |
| `closeTab/closeProfile/close()` | Invalidates old IDs, terminates worker before releasing the profile lock |
| `events(afterSequence)` | Bounded lifecycle history; explicit gap when older events were evicted |
| `suspend(tabId)` | Explicit UNSUPPORTED_CAPABILITY; never reload masquerading as resume |

## Native tabs and profile state

One active profile owns one Lightpanda process and native Session. Its explicit tabs are independent native Pages/CDP targets, with separate DOM, history, document epoch and ongoing JS activity. Cookies/localStorage are shared by their normal origin/profile rules; sessionStorage is tab-specific and survives navigation. Same-origin iframes use the top-level tab's sessionStorage. Native opener copying is tested separately, including noopener. Iframe loading is explicitly enabled; there is no rendering UI.

The host subscribes to a small opt-in native event and emits `PROFILE_STATE_CHANGED {profileId, sessionId, generation, kind:"cookies"}` when the profile cookie jar changes, including logout. The event contains no cookie name/value. It signals a state change, without inferring that a particular application is logged in or out. Profiles remain ephemeral until A5.

The patch, original engine restriction and A1 acceptance evidence are described in [ADR 001](../docs/adr/001-a1-worker-profile-topology.md) and [A1 results](../docs/A1_RESULTS.md). Full popup target/lifetime handling, rich observation, DOM Storage events and per-agent authorization remain later work. Explicit native tab creation and same-profile storage are the A1 path.

Profile locks coordinate hosts using the same `stateDir`. A lock is not silently stolen based on a PID check; after an abruptly killed host, verify that its workers are gone before operator recovery. Cross-host OS identity/network isolation and crash recovery are later stages. These local locks do not claim isolation against a hostile process with the host's filesystem privileges.

## Early measurement

`npm run measure` defaults to 600 seconds per supported topology. It serially attempts 1 profile × 1 tab, 1 profile × 10 tabs, and 4 profiles × 1 tab. Every topology runs active JS, periodic fixture fetches, inspect checks every 5 seconds and reloads every 30 seconds. Each tab must advance its DOM timer between checks; retained text with stalled JS fails. Reload explicitly starts a fresh counter baseline. The shared one-profile/one-worker baseline serves both the tab-count and profile-count comparisons.

Raw manifests, source snapshots, samples, check results and events are written to ignored `browser/artifacts/a1-*`. Setup and sustained distributions are separate. Product memory counts one shared Node host/measurement driver plus each unique worker process tree once. A separate fixture child is excluded; measurement overhead in the driver is included. RSS is not physical footprint. A sampled 2 GiB resource guard is not an OS hard cap or a 500 MB acceptance result.

Exit code 2 means the full A1 topology gate did not pass. A short harness check can use `--seconds 2`; it is not the ten-minute experiment. Interrupted runs remain in their own directories and are not pooled into the published result. Compact evidence is published in `browser/results/` and the A1 report after a complete measurement run.

## Extended A1 resource diagnostics

```sh
caffeinate -i npm run measure:resources
# Short harness validation only:
npm run measure:resources -- --smoke
```

The macOS-only probe builds from `native/resource-probe.c` using the system C compiler; `npm test` also builds it on macOS. It reads native physical footprint/RSS, cumulative CPU, disk I/O, faults, context switches, wakeups, threads, file descriptors and socket descriptors. Mach CPU times are converted to nanoseconds using the actual machine timebase and checked against Node's independent CPU counter. Missing measurements remain null; PID reuse and counter resets invalidate the interval.

The full matrix uses fresh host processes: 12 synthetic workloads/topologies for 30 seconds each, repeated in reverse order, followed by a 600-second 4-profile/32-tab active soak. It includes idle, active, 32 tabs in one profile, 32 tabs across 4/8 profiles, 5000-node DOM pages, CPU work, 64 KiB/250 ms fetches and tab churn. Raised quotas are recorded diagnostic overrides, not new defaults. Every case closes its workers and observes the remaining host for 5 seconds.

The product includes the host/measurement driver and worker trees; the separately measured fixture backend is excluded. Raw records retained by the measurement driver affect its memory trend. CPU 100% means one logical core; physical footprint is separate from RSS, kernel disk bytes from logical writes, and fixture HTTP body bytes from wire traffic. System-wide CPU, swap and compression counters provide interference context. Power, GPU and temperature are unavailable; they are not reported as zero. This macOS synthetic experiment does not claim Linux/cgroup or 60-profile capacity acceptance.

Evidence goes to ignored `artifacts/a1-resources-*`; complete runs can be verified/published with `node scripts/report-resources.mjs artifacts/<run-id>` after copying the matching `test-manifest.json` and `test.tap` from `test:record` into the run. The [extended resource report](../docs/A1_RESOURCE_RESULTS.md) records results, limitations and evidence links. The original [A1 acceptance report](../docs/A1_RESULTS.md) remains the baseline.

The extended report distinguishes functional PASS from an open network-memory retention finding. A zero CDP body-capture budget reduces memory but does not eliminate the observed growth. The fetch resolver/reference lifetime is a source-level candidate, pending a minimal engine regression and patch comparison. Product defaults and the native engine patch were not changed by these diagnostics.

After the main matrix, run the follow-ups serially with idle sleep inhibited (not concurrently with other performance cases):

```sh
caffeinate -i node scripts/diagnose-cpu-contention.mjs artifacts/<run-id>/followups/cpu
caffeinate -i node scripts/diagnose-network-memory.mjs artifacts/<run-id>/followups/network
node scripts/verify-resource-followups.mjs artifacts/<run-id>
```

Publication rejects observation gaps above 3 seconds and duration overruns above 5 seconds. The network follow-up also enforces these during collection. An interrupted first follow-up set was excluded; its old PASS marker is explicitly rejected by the recorded verifier test. The optional post-run GC command is unsupported by this engine and stays UNAVAILABLE. Plotting/interpretation helpers are offline analysis tools; matplotlib is optional and not a runtime dependency.

### A1 memory regression

The native fetch-root fix and bounded inspector capture policy are described in [A1_MEMORY_FIX](../docs/A1_MEMORY_FIX.md). Capture ceilings are engine limits, not a whole-process RAM cap. After building the pinned engine and resource probe, create a fresh output directory and copy the published `protocol.json` from `results/a1-memory-fix-2026-10-16/` into it **before** measurements. Record a new `recordedAt` timestamp without changing the gates, then run:

```sh
caffeinate -i node scripts/diagnose-network-memory.mjs artifacts/memory-check/network-120
caffeinate -i node scripts/diagnose-network-memory.mjs artifacts/memory-check/network-600 --case=default-continuous --seconds=600
node scripts/verify-memory-fix.mjs artifacts/memory-check results/a1-resources-2026-10-16T07-29-23-666Z/followups/network
```

The verifier checks workload/probe identity, timing, progress, cleanup and the pre-recorded memory gates. Use a new output directory per experiment. A rejected run must be retained and explained, not silently overwritten. On platforms without `caffeinate`, use an equivalent sleep inhibitor; the resource probe currently requires macOS.

For native Debug regressions, run `make test F=cdp` and the `WebApi: fetch`, `WebApi: Cache`, `Session:`, `Frame:` and `WebApi: Storage` filters in the patched source tree with the pinned version/toolchains. The failing baseline reproduction and exact settled-root test excerpt are preserved in the new evidence. Optional standalone chart generation uses `python scripts/plot-memory-fix.py <memory-evidence> <baseline-network>` with matplotlib.
