## Phase 4.4 update: `assessment-service.js` implemented

`runAssessment({ institution, hierarchy, projectName, criteriaMatrix,
alternativeMatrices })` is now the single entry point for running a
complete AMSESHI assessment. It:

1. Builds `InstitutionProfile` / `SuccessFactorHierarchy` from plain
   objects (accepts either plain objects or already-built instances).
2. Calls `amseshi-framework.js`'s `calculateEnhancedAHP` — completely
   unmodified since Phase 3.
3. Calls `interpretation.js`'s `interpretAssessment` — confidence rating
   in full; readiness explicitly `pending-methodology`.
4. Returns one immutable `AssessmentRecord`.

**Verified** (`test/verify-assessment-service.mjs`): calling this service
with the exact inputs from `test/golden-cases/case-4-typical-real-world.json`
produces output that matches the recorded golden result **exactly**
(string-equal JSON, excluding the timestamp) — proving the application
layer adds zero numeric drift on top of the already-verified engine and
framework.

**`report-service.js` remains a stub** — reporting integration is a
separate, later step, not part of Phase 4.4.
