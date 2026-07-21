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

## 7. What changed in Phase 2, and what didn't

**Changed:** folder organization only. All code with zero references from
`index.html` was moved into `legacy/` (see `legacy/README.md` for the
itemized list and verification). New empty module folders and
documentation were added for the Phase 3 target structure. A metadata
module (`js/metadata/research-metadata.js`) was added as static data, not
yet wired into the UI.

**Not changed:** `index.html` itself — its inline script, DOM structure,
event wiring, and all calculation logic are byte-for-byte untouched. No
numerical output of the application can have changed, because no code
path the application executes was modified. This will be verified
concretely at the start of Phase 3 via golden test cases (see
`test/golden-cases/`, populated in Phase 3).

## 8. Reproducibility statement (for methodology chapter)

This project's refactor is being carried out under a strict constraint:
identical inputs must produce identical numerical outputs before and
after each phase. Phase 2 satisfies this trivially, since it made no
changes to executable code. Phase 3 will satisfy it by capturing the
current live application's outputs on a fixed set of representative
inputs *before* extracting any function, then diffing the extracted
engine's outputs against those recorded values.
