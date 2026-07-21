# `js/frameworks/` — Assessment Frameworks

This folder holds **assessment frameworks**: the orchestration layer that
defines *what* is being assessed and *how* the assessment process is
structured. A framework is the scientific/methodological layer — it is
**not** where any matrix math lives.

## The contract

Every framework in this folder (starting with `amseshi/`) depends on
`js/core/` (the AHP Decision Engine), never the other way around. This
one-directional dependency is what allows the AHP engine to remain a
generic, reusable, domain-agnostic component, and what allows new
frameworks to be added later without ever modifying the engine.

```
        AMSESHI Framework   Future Framework A   Future Framework B
                 \                  |                    /
                  \                 |                   /
                   ▼                ▼                  ▼
                          AHP Decision Engine (js/core/)
```

A framework module is expected to expose (conceptually — finalized in
Phase 3):

- **Domain model** — its own vocabulary for the thing being assessed
  (for AMSESHI: success factors, goal, alternatives) rather than generic
  "criteria/items" naming.
- **`buildHierarchy(...)`** — translates domain input into the plain
  matrices the AHP engine understands (goal → criteria → alternatives).
- **`runAssessment(...)`** — calls `js/core/ahp-engine.js` to perform the
  actual calculation, then wraps the raw numeric result together with
  framework identity and scientific-traceability metadata (see
  `js/metadata/research-metadata.js`) into a single "Assessment" result
  object.
- **No direct DOM access, no chart calls, no storage calls** — same rule
  as the engine itself. UI, charts, and storage consume a framework's
  output; they do not reach into it.

## Why this matters for the dissertation

This structure is the physical, verifiable evidence that AMSESHI (the
scientific contribution) is architecturally independent from AHP (the
decision-analysis technique it currently uses). Swapping or adding a
different multi-criteria method later would mean changing `js/core/`
without touching `js/frameworks/amseshi/`, and adding a new framework
would mean adding a new folder here without touching `js/core/` at all.

## Status

`amseshi/` is currently empty — its contents are extracted from the live
`index.html` logic in **Phase 3**, preserving the exact current numerical
behavior (verified against golden test cases; see `test/golden-cases/`).
