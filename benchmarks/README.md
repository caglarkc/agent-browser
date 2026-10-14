# Published benchmark evidence

Measurements were collected on 2026-10-13; the repository was prepared for publication on 2026-10-14.

- [Final live adapter v2: 42 trials](results/live-2026-10-13T15-52-00-491Z/results.json) · [summary](results/live-2026-10-13T15-52-00-491Z/summary.json) · [manifest](results/live-2026-10-13T15-52-00-491Z/manifest.json)
- [Live adapter v1: 84 trials](results/live-2026-10-13T15-38-19-789Z/results.json)
- [Controlled document research: 60 trials](results/perf-2026-10-13T15-09-50-495Z/results.json)
- [Controlled interaction performance: 180 trials](results/perf-2026-10-13T14-59-49-800Z/results.json)

Other directories preserve pilot, schema-refinement, and verifier experiments. These runs have different scopes and must not be pooled into a single headline accuracy figure.

Publication copies preserve numerical results, failures, manifests and source snapshots. Local machine paths are normalized to `${LOCAL_HOME}` outside source snapshots. Decision traces omit page observation text and parent-element context; screenshots, binaries, secrets and local logs are excluded. Original source hashes describe the recorded source/binary files, not hashes of sanitized publication metadata. Some old report references to screenshots or complete local observations describe files retained locally, not bundled here.

The runnable lab writes new complete artifacts under `lab/artifacts/`, ignored by Git. See [the live protocol](../lab/LIVE_TEST_PROTOCOL.md) and [performance methodology](../lab/PERFORMANCE_RESULTS.md).
