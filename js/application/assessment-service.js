/**
 * Module Name: assessment-service.js
 * Purpose: Application-layer coordinator that ties together the AMSESHI
 *   domain model, the AMSESHI framework (decision analysis + interpretation),
 *   for a single end-to-end assessment run.
 * Responsibilities:
 *   - Accept plain institution/hierarchy input and build the domain model
 *   - Call the MCDM method registry, which routes AHP to the unchanged AHP engine
 *   - Attach the interpretation layer's output (confidence; readiness
 *     pending future methodology)
 *   - Return one complete, immutable AssessmentRecord
 *   - Perform NO calculation itself, and NO DOM/storage/reporting access
 *     (those are future integration points — see "Not yet wired" below)
 * Dependencies:
 *   - js/frameworks/amseshi/assessment-model.js
 *   - js/mcdm/method-registry.js
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
import { mcdmMethodRegistry, METHOD_IDS } from '../mcdm/method-registry.js';
import { interpretAssessment } from '../frameworks/amseshi/interpretation.js';

/**
 * Runs one complete AMSESHI assessment: builds the domain model, calls
 * the Phase B method registry (which routes to the unmodified AHP engine),
 * attaches the interpretation layer's output, and returns the
 * finished record. This is the single entry point a future UI wizard
 * should call — it never needs to import the framework or engine directly.
 *
 * @param {object} params
 * @param {InstitutionProfile|object} params.institution
 * @param {SuccessFactorHierarchy|object} params.hierarchy - { goal, criteria, alternatives }
 * @param {string} params.projectName
 * @param {number[][]} params.criteriaMatrix
 * @param {number[][][]} params.alternativeMatrices - one matrix per criterion
 * @param {string} [params.methodId='ahp'] - Registered method identifier.
 * @returns {import('../frameworks/amseshi/assessment-model.js').AssessmentRecord}
 */
export function runAssessment({ institution, hierarchy, projectName, criteriaMatrix, alternativeMatrices, methodId = METHOD_IDS.AHP }) {
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

  // Keep the established AHP result and interpretation paths exactly separate
  // from FAHP. In particular, the FAHP result is attached unchanged, so the
  // renderer receives fuzzyWeights, defuzzifiedWeights, fuzzy priorities,
  // scores, and ranking exactly as produced by the FAHP engine.
  if (methodId === METHOD_IDS.AHP) {
    const result = mcdmMethodRegistry.calculate(METHOD_IDS.AHP, {
      items: hierarchyModel.alternatives,
      criteria: hierarchyModel.criteria,
      alternativeMatrices,
      criteriaMatrix,
    });
    assessment = assessment.withResult(result);
    assessment = assessment.withInterpretation(
      interpretAssessment({ overallCR: result.consistency.overallCR })
    );
    return assessment;
  }

  if (methodId === METHOD_IDS.FAHP) {
    const result = mcdmMethodRegistry.calculate(METHOD_IDS.FAHP, {
      items: hierarchyModel.alternatives,
      criteria: hierarchyModel.criteria,
      alternativeMatrices,
      criteriaMatrix,
    });
    assessment = assessment.withResult(result);
    assessment = assessment.withInterpretation({
      confidence: {
        status: 'not-applicable',
        consistencyRatio: null,
        explanation: 'FAHP consistency diagnostics are not implemented in this TFN geometric-mean method; consult the parallel AHP consistency result.',
      },
      readiness: {
        status: 'pending-methodology',
        label: null,
        explanation: 'Institutional readiness classification awaits the AMSESHI Framework methodology.',
      },
      recommendation: {
        status: 'pending-methodology',
        action: null,
        rationale: 'Recommendations depend on the pending institutional readiness methodology.',
      },
    });
    return assessment;
  }

  throw new Error(`Unsupported assessment method '${methodId}'.`);
}
