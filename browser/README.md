# Agent Browser core

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
