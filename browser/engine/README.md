# Native Lightpanda A1 patch

`source.json` pins the upstream commit, downloaded archive, native patch and changed source hashes. `multitab.patch` is the engine change, not a Puppeteer storage shim. The original lab Lightpanda 1.0.0 stays available only for the explicit regression probe demonstrating `TargetAlreadyLoaded`.

The patch runs multiple native Pages inside one Session and one process/profile. Each CDP target has its own page handle, attached sessions, node registry, frame arena, network/lifecycle routing and navigation history. Cookie jar, localStorage, IndexedDB and CacheStorage stay Session-owned. sessionStorage belongs to a top-level browsing context; same-origin iframes use that context, and an opener gets an independent copy at creation. The inspector destroys the navigating document's context rather than resetting every sibling. Raw Runtime calls select the addressed target's default context.

`Browser.watchProfileState` is an opt-in private CDP extension on a page session. It emits `Browser.profileStateChanged {generation, kind:"cookies"}` on that subscribed session when the profile's native cookie jar changes. Names, values and URLs are omitted. BrowserHost deduplicates these into `PROFILE_STATE_CHANGED`, including changes caused by logout. This is a state-change signal, not proof of application-level login/logout. Page scripts can still read their origin's data, as in a browser. No external agent gets raw CDP in the A1 SDK.

Native `window.open` storage copying is covered here. Full popup target discovery, popup lifetime independent from its opener, comprehensive frame observation and DOM Storage events belong to the later compatibility/DOM work; the A1 public host creates explicit native page targets. The V8 inspector group is still shared inside a trusted profile; its internal context announcements are not a per-agent authorization boundary. OS/egress enforcement, persisted encrypted profiles and private input remain later phases.

## Build

Requires Node >=22, Python-independent POSIX `make`, `patch`, `tar`, `curl`, Git, Zig **0.17.0**, Rust **1.99.0**, and the platform's native compiler/SDK. The build helper also finds the project-local toolchains under ignored `engine-work/tools` when present.

```
cd browser
npm ci --ignore-scripts
npm run engine:verify
npm run engine:build
npm test
npm run measure
```

The historical raw-engine regression probe also needs the separately pinned `../lab/bin/lightpanda` from the [lab setup](../../lab/README.md). It is not downloaded by this build helper. The product worker always uses `browser/bin/lightpanda`. Physical-footprint measurement additionally uses the existing macOS lab memprobe; missing footprint is reported as null with RSS kept separate.

The helper verifies the pinned archive and patch, applies it to an isolated ignored source tree, builds an optimized V8 snapshot and ReleaseFast executable, and writes `bin/lightpanda` plus `engine/manifest.json`. It rejects an existing source tree with a different receipt instead of overwriting changes. After deliberately changing the patch, preserve/remove that ignored source directory and build a fresh one. `engine:verify` applies the patch to a fresh temporary source tree without compiling.

The binary, downloaded source, toolchains, V8 and compiler caches are ignored. The build manifest pins the locally built binary hash and records its platform/compiler/source identity. A rebuild can produce a different binary hash across SDKs/toolchains; the helper updates that receipt and the tests/measurement must be rerun. Runtime startup verifies the binary hash before launching it.

Upstream license and notices are in `LICENSE` and `UPSTREAM_LICENSING.md`. The full corresponding upstream source is obtained by the pinned archive plus this patch; its original notices are preserved. No browser rendering UI or human-control surface is added.
