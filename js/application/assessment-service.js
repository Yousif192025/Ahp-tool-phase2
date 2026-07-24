/**
 * Module Name: assessment-service.js
 * Purpose: Application-layer coordinator that ties together the AMSESHI
 *   domain model, the AMSESHI framework (decision analysis + interpretation),
 *   for a single end-to-end assessment run.
 * Responsibilities:
 *   - Accept plain institution/hierarchy input and build the domain model
 *   - Call amseshi-framework.js (which calls the unchanged AHP engine)
 *   - Attach the interpretation layer's output (confidence; readiness
 *     pending future methodology)
 *   - Return one complete, immutable AssessmentRecord
 *   - Perform NO calculation itself, and NO DOM/storage/reporting access
 *     (those are future integration points — see "Not yet wired" below)
 * Dependencies:
 *   - js/frameworks/amseshi/assessment-model.js
 *   - js/frameworks/amseshi/amseshi-framework.js
 *   - js/frameworks/amseshi/interpretation.js
 * Author: Yousif Hashim
 * Version: 1.0.0
 * Research Project: AMSESHI Academic Decision Support System (ADSS) — PhD Dissertation, Al Neelain University
 * Last Updated: 2026-07-23
 * -----------------------------------------------------------------------
 * NOT YET WIRED (deliberately, pending their own implementation):
 *   - Persistence: js/storage/project-service.js is still a stub. This
 *     service does not save anything yet.
 *   - Reporting: js/application/report-service.js is still a stub. This
 *     service does not generate report documents yet.
 * This module can already be called by a future UI without change once
 * those two are implemented — only their internal bodies need filling in.
 * -----------------------------------------------------------------------
 */
import { InstitutionProfile, SuccessFactorHierarchy, AssessmentRecord } from '../frameworks/amseshi/assessment-model.js';
import { calculateEnhancedAHP } from '../frameworks/amseshi/amseshi-framework.js';
import { interpretAssessment } from '../frameworks/amseshi/interpretation.js';

/**
 * Runs one complete AMSESHI assessment: builds the domain model, calls
 * the AMSESHI framework (decision analysis via the unmodified AHP
 * engine), attaches the interpretation layer's output, and returns the
 * finished record. This is the single entry point a future UI wizard
 * should call — it never needs to import the framework or engine directly.
 *
 * @param {object} params
 * @param {InstitutionProfile|object} params.institution
 * @param {SuccessFactorHierarchy|object} params.hierarchy - { goal, criteria, alternatives }
 * @param {string} params.projectName
 * @param {number[][]} params.criteriaMatrix
 * @param {number[][][]} params.alternativeMatrices - one matrix per criterion
 * @returns {import('../frameworks/amseshi/assessment-model.js').AssessmentRecord}
 */
export function runAssessment({ institution, hierarchy, projectName, criteriaMatrix, alternativeMatrices }) {
  const institutionProfile = institution instanceof InstitutionProfile
    ? institution
    : new InstitutionProfile(institution);

  const hierarchyModel = hierarchy instanceof SuccessFactorHierarchy
    ? hierarchy
    : new SuccessFactorHierarchy(hierarchy);

  let assessment = AssessmentRecord.create({
    institution: institutionProfile,
    hierarchy: hierarchyModel,
    projectName,
  });

  // Decision analysis: delegates entirely to the AMSESHI framework, which
  // in turn delegates entirely to the unmodified AHP engine. This service
  // never touches a matrix or a weight itself.
  const result = calculateEnhancedAHP(
    hierarchyModel.alternatives,
    hierarchyModel.criteria,
    alternativeMatrices,
    criteriaMatrix
  );
  assessment = assessment.withResult(result);

  // Interpretation layer: confidence only today; readiness intentionally
  // pending (see docs/research-decisions/interpretation-layer-separation.md).
  const interpretation = interpretAssessment({ overallCR: result.consistency.overallCR });
  assessment = assessment.withInterpretation(interpretation);

  return assessment;
}
