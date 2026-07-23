# AMSESHI ADSS — Architecture Documentation

## 1. Identity

This software implements the **AMSESHI Success Factors Assessment
Framework**. The **Analytic Hierarchy Process (AHP)** is the
decision-analysis technique AMSESHI currently uses to compute weights and
rankings — it is a component AMSESHI depends on, not the software's
identity. See `js/metadata/research-metadata.js` for the canonical
software/framework identity and citation information (`SOFTWARE_IDENTITY`).

## 2. Layered architecture

```
Consumers            UI layer          Storage layer       Reporting layer
                    (js/ui/*.js)      (js/storage/*.js)  (js/reporting/*.js)
                          \                  |                    /
                           \                 |                   /
                            v                v                  v
Orchestration                    AMSESHI framework
                              (js/frameworks/amseshi/)
                                          |
                                          v
Reusable core                      AHP decision engine
                                    (js/core/ahp-engine.js)
```

See `docs/diagrams/component-diagram.svg`.

**Rule enforced by this structure:** dependencies point one way only.
`js/core/` never imports from `js/frameworks/` or above. This is what
makes the engine reusable by future frameworks (see §4) without
modification, and what makes AMSESHI's role as the scientific contribution
architecturally, not just rhetorically, distinct from AHP.

## 3. Runtime data flow

For a single assessment: user input (pairwise comparisons) is read by the
AMSESHI framework, which builds the criteria/alternative matrices and
calls the AHP engine to compute priority vectors and consistency ratios.
AMSESHI then assembles the numeric result together with scientific
traceability metadata (§5) into a single Assessment object, which is
consumed independently by the UI, storage, and reporting layers.

See `docs/diagrams/data-flow-diagram.svg`.

## 4. Extensibility

Because `js/core/` has no knowledge of AMSESHI-specific vocabulary, a
future assessment framework (e.g. "Future Framework A") can be added as a
sibling folder under `js/frameworks/`, calling the same AHP engine,
without any change to `js/core/` or to AMSESHI's own code. See
`js/frameworks/README.md` for the contract a new framework must satisfy.

## 5. Scientific traceability

Every assessment produced by the software is expected to carry enough
metadata to be independently reproduced: project name, assessment date,
framework version, AHP engine version, software version, number of
criteria, number of alternatives, and full consistency statistics
(criteria CR, per-alternative CRs, overall CR). The schema is documented
in `js/metadata/research-metadata.js` (`ASSESSMENT_METADATA_SCHEMA_VERSION`)
and will be populated by the AMSESHI framework and persisted by the
storage layer starting in later phases.

## 6. Before/after module structure

See `docs/diagrams/module-dependency-diagram.svg` for the concrete
before/after comparison: the current single 3,700-line inline script in
`index.html` versus the target layered file structure.

## 6.5 Phase 4.1 — Foundation layer

Added `js/application/`, `js/ui/`, `js/storage/`, `js/config/`,
`js/utils/` as new, currently-empty layers (each file is a documentation
header + `export {}` stub). `research-metadata.js` moved from the old
`js/metadata/` into its intended home, `js/config/`, with its content
finalized (no more placeholders). `js/core/ahp-engine.js` and
`js/frameworks/amseshi/amseshi-framework.js` each received an added
documentation header comment — no logic changed. See
`js/README-phase4.md` for the full folder-by-folder rationale.

## 6.6 ARIM separation (research decision, 2026-07-23)

Institutional readiness is explicitly **not** derived from AHP priority
weights/scores directly — see `docs/research-decisions/arim-separation.md`
for the full rationale. The pipeline is:

```
Decision Analysis (AHP) -> Priority Analysis -> AMSESHI Interpretation
Model (ARIM, not yet defined) -> Institutional Readiness Assessment
```

`js/frameworks/amseshi/interpretation.js` implements the well-defined
part (consistency confidence from CR) in full, and exposes
`deriveInstitutionalReadiness()` as a documented, currently-throwing
extension point for ARIM once its methodology is validated. No change
to `js/core/ahp-engine.js` or `amseshi-framework.js` is required when
ARIM is eventually implemented.

## 7. What changed in Phase 2 and Phase 3, and what didn't

**Phase 2 (organization only):** all code with zero references from
`index.html` was moved into `legacy/` (see `legacy/README.md`). New empty
module folders and documentation were added. A metadata module
(`js/metadata/research-metadata.js`) was added as static data, not yet
wired into the UI. `index.html`'s executable content was untouched.

**Phase 3 (engine extraction):** four functions —
`calculatePriorityVector`, `calculateConsistencyRatio`,
`calculateOverallConsistency`, `calculateEnhancedAHP` — were moved out of
`index.html`'s inline script into `js/core/ahp-engine.js` and
`js/frameworks/amseshi/amseshi-framework.js`, with the algorithm itself
unchanged (verbatim copy). `index.html` now loads them via one
`<script type="module">` in `<head>` that exposes them on `window`, so
every existing call site elsewhere in the file needed zero changes. This
was verified against five golden test cases with strict floating-point
equality — see `docs/reproducibility/phase3-verification-report.md`.

**Not changed:** the DOM structure, event wiring, matrix-building
functions (`createCriteriaMatrix`, `createAlternativeMatrices` — still
inline, still DOM-reading; their extraction is a Phase 4 concern since
that's a UI/DOM separation, not an engine separation), the display
functions, the charts, and the export logic. The `metadata.algorithm`
label (a known Phase 1 naming inaccuracy) was also deliberately left
unchanged pending separate approval, since correcting it would alter
returned data shape, not just internal organization.

## 8. Reproducibility statement (for methodology chapter)

This project's refactor is being carried out under a strict constraint:
identical inputs must produce identical numerical outputs before and
after each phase. Phase 2 satisfies this trivially, since it made no
changes to executable code. Phase 3 will satisfy it by capturing the
current live application's outputs on a fixed set of representative
inputs *before* extracting any function, then diffing the extracted
engine's outputs against those recorded values.
