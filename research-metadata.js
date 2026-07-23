/**
 * Module Name: research-metadata.js
 * Purpose: Single source of truth for the AMSESHI ADSS software/framework
 *   identity, used by the About screen, exported reports, and the
 *   scientific-traceability metadata attached to every assessment.
 * Responsibilities:
 *   - Hold the confirmed software/framework identity as static data
 *   - Define the shape of the assessment traceability metadata schema
 *   - Contain no calculation logic and no DOM access
 * Dependencies:
 *   - None
 * Author: Yousif Hashim
 * Version: 1.0.0
 * Research Project: AMSESHI Academic Decision Support System (ADSS) — PhD Dissertation, Al Neelain University
 * Last Updated: 2026-07-22
 * -----------------------------------------------------------------------
 * This file contains NO calculation logic — it is pure data, safe to
 * import from anywhere (UI, reports, storage) without creating any
 * coupling to the AHP engine or the AMSESHI framework logic.
 * -----------------------------------------------------------------------
 */

export const SOFTWARE_IDENTITY = {
  softwareName: 'AMSESHI Academic Decision Support System (ADSS)',
  shortName: 'AMSESHI ADSS',
  subtitle: 'Academic Decision Support System for Mobile Cloud Learning Readiness Assessment',
  frameworkName: 'AMSESHI Framework (Assessment Model for Success Factors in Higher Education Institutions)',
  decisionAnalysisEngine: 'Analytic Hierarchy Process (AHP)',
  softwareVersion: '2.0.0-research',
  frameworkVersion: '1.0.0',
  softwareType: 'Academic Decision Support System (ADSS)',
  copyright: '© 2026 Yousif Hashim. All Rights Reserved.',
  author: 'Yousif Hashim',
  institution: 'Al Neelain University, Faculty of Computer Science and Information Technology',
  researchLevel: 'PhD Dissertation',
  year: 2026,
  license: 'Academic Research Use',
  doi: null, // TODO: set once the dissertation/paper is published
  recommendedCitation:
    'Hashim, Y. (2026). AMSESHI Academic Decision Support System: An ' +
    'Institutional Readiness Assessment Framework for Mobile Cloud ' +
    'Learning using the Analytic Hierarchy Process (AHP). PhD Dissertation, ' +
    'Al Neelain University.',
};

/**
 * Shape of the scientific-traceability metadata attached to every
 * saved/exported assessment (populated by js/application/assessment-service.js
 * once implemented). Documentation/type reference only, not enforced code.
 *
 * {
 *   assessmentId: string,
 *   projectName: string,
 *   assessmentDate: string,        // ISO 8601
 *   frameworkVersion: string,
 *   softwareVersion: string,
 *   ahpEngineVersion: string,
 *   assessmentConfiguration: { criteriaCount: number, alternativesCount: number },
 *   consistency: { criteriaCR: number, alternativeCRs: number[], overallCR: number },
 *   calculationMethod: string,
 * }
 */
export const ASSESSMENT_METADATA_SCHEMA_VERSION = 1;
