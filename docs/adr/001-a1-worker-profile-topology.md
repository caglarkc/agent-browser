# ADR 001 A1 worker, profile and native tab topology

Decision date: 15 October 2026. Status: A1 accepted on 16 October 2026; all three 600-second topologies and native/core regression gates passed. Evidence is recorded in [A1 results](../A1_RESULTS.md).

## Decision

One BrowserHost owns immutable profile bindings and a separate native Lightpanda process per active profile. Each successful open creates fresh worker/session IDs. Profile locks use atomic directory creation in a shared state directory and release only after the owned worker stops. A profile cannot be opened concurrently by another host using that directory.

Different account principals and effective policy sets never share a worker. The shared Node process coordinates lifecycle and quotas and is counted once in product memory. A profile's native Session holds its cookie jar and origin-scoped localStorage/IndexedDB/CacheStorage. Multiple native Pages in that Session provide actual concurrent tabs, rather than independent browser connections with copied cookies.

Each Page/CDP target owns its stable root-frame handle, attached CDP sessions, node registry, frame arena, navigation state and network/lifecycle routing. A tab ID binds profile/session/worker and a native Page. Main-document navigation increments its epoch. Native back/forward is used. Navigating/closing one target destroys only its inspector contexts; siblings keep their DOM and running JS. Raw Runtime calls resolve the addressed target's default context.

sessionStorage is scoped to the top-level browsing context and origin; its same-origin iframe shares it. Every frame's navigation history is separate, preventing iframe loads from overwriting the parent's history. Native opener creation takes an independent storage snapshot; noopener does not. These opener storage semantics do not claim complete CDP popup discovery or independent popup lifetime.

Cookie mutations generate a private opt-in `Browser.profileStateChanged` event. BrowserHost deduplicates it into a profile-scoped lifecycle event without cookie names/values or URLs. It reports a state change, including mutations caused by logout, without inferring application login status.

Worker loss invalidates every tab in that worker and preserves unrelated profile workers. Closed tab IDs are not reused. Defaults remain 4 workers, 8 tabs/profile and 32 total tabs. The early measurement manifest explicitly permits 10 tabs/profile for its one-worker comparison.

## Original engine constraint and resolution

The original lab Lightpanda 1.0.0 binary (SHA-256 `955440053a84754dd64c62f970449a56a2b350cdf43ea5f2e809a73047b8173d`) rejects the second native target with `TargetAlreadyLoaded`. The explicit raw-engine regression probe retains this evidence. Upstream reproduction: [issue 1962](https://github.com/lightpanda-io/browser/issues/1962).

A source-pinned native patch replaces that restriction with multiple per-target CDP wrappers sharing one native Session. It also separates navigation/sessionStorage and event/arena ownership; removing only the guard would not satisfy the contract. [Source pin](../../browser/engine/source.json), [patch](../../browser/engine/multitab.patch), [build receipt](../../browser/engine/manifest.json) and [build workflow](../../browser/engine/README.md) make the change reviewable and reproducible. There is no automatic upstream upgrade at runtime.

## Rejected shortcuts

- Independent CDP connections/contexts presented as same-profile tabs.
- Storage copying before each action or virtual tabs implemented by reloading one Page.
- Chrome fallback.
- Sharing a worker across unrelated profiles to meet a memory target.

The only storage copy is the native opener snapshot required by browser semantics, not a synchronization shim.

## Acceptance and scope

T01 covers three real tabs, 10 state variants × 3 repetitions, independent DOM/address/history, shared cookie/localStorage, isolated sessionStorage, live mutations, iframe storage, opener/noopener and fresh tabs after close. A separate ten-target test proves concurrent JS progress and sibling survival across navigation/close. T02's lifecycle subset kills a worker with three tabs and checks loss/old-ID rejection while another profile continues. Native CDP/Session/Storage/Frame regressions retain the debug leak detector.

Early T11 compares 1 profile × 1 tab, 1 profile × 10 tabs, and 4 profiles × 1 tab for ten minutes each using the same optimized engine. Setup and sustained memory are separated. The common Node driver and unique worker trees are measured once; the fixture process is excluded. [A1 results](../A1_RESULTS.md) links the actual run/test receipts rather than deriving multi-session capacity from one-task medians.

## Security, compatibility and capacity boundary

A1 uses trusted local synthetic fixtures. Profile metadata, local locks, stripped worker environment and process separation are not A2 authenticated agent access, mandatory egress or an OS sandbox. Real accounts and credentials are outside this slice. The V8 inspector context group remains shared within a trusted profile; raw internal context events are not per-agent authorization. The host does not expose raw CDP.

Iframe loading is explicitly enabled. Full popup target discovery and lifetime, rich DOM/frame observation and DOM Storage event compatibility remain later work. Profiles are ephemeral; encrypted persistence/rotation is A5. Native suspend remains explicitly unsupported. No human browsing/control interface is added; private input is A4's separate narrow extension.

The macOS early footprint report is not Linux hard-cap or CPU/FD soak evidence. The 2 GiB sampled guard is not an OS limit. The 60 independent active profiles / 500.000.000 byte capacity objective remains A7; isolation will not be relaxed to claim it.
