/**
 * research-metadata.js
 * -----------------------------------------------------------------------
 * Static research/software identity metadata for the AMSESHI Academic
 * Decision Support System (ADSS).
 *
 * Purpose: a single source of truth for anything that needs to appear in
 * the "About" section (Phase 4 UI), in exported reports (Phase 5), and in
 * the scientific-traceability block attached to every saved assessment
 * (see ASSESSMENT_METADATA_SCHEMA below).
 *
 * This file contains NO calculation logic and NO DOM access — it is pure
 * data, safe to import from anywhere (UI, reports, storage) without
 * creating any coupling to the AHP engine or the AMSESHI framework logic.
 * -----------------------------------------------------------------------
 *
 * TODO (author to confirm before Phase 4): the fields below are
 * placeholders. Please replace with the real values you want to appear
 * in the About section and in exported/printed reports.
 */

export const SOFTWARE_IDENTITY = {
  softwareName: 'AMSESHI Academic Decision Support System', // TODO confirm exact name
  frameworkName: 'AMSESHI Success Factors Assessment Framework',
  assessmentMethod: 'Analytic Hierarchy Process (AHP)',
  softwareVersion: '0.1.0',   // TODO: set real versioning scheme
  frameworkVersion: '1.0.0',  // TODO: set real AMSESHI framework version
  copyright: '© 2026 [TODO: Author Name]',
  author: '[TODO: Author Name]',
  institution: '[TODO: Institution Name]',
  year: 2026, // TODO confirm
  recommendedCitation:
    '[TODO: Author Surname, Initials]. (2026). AMSESHI Success Factors ' +
    'Assessment Framework [Software]. [TODO: Institution]. [TODO: URL/DOI if available]',
  researchCitation:
    '[TODO: full dissertation/paper citation once available]',
};

/**
 * Shape of the scientific-traceability metadata that should be attached
 * to every saved/exported assessment (Phase 5 and the Storage layer).
 * This is a documentation/type reference, not an enforced schema — kept
 * here so UI, storage, and reporting code all agree on the same fields.
 *
 * {
 *   projectName: string,
 *   assessmentDate: string,       // ISO 8601
 *   frameworkVersion: string,     // from SOFTWARE_IDENTITY at time of run
 *   ahpEngineVersion: string,     // js/core/ahp-engine.js version
 *   softwareVersion: string,      // from SOFTWARE_IDENTITY at time of run
 *   criteriaCount: number,
 *   alternativesCount: number,
 *   consistency: {
 *     criteriaCR: number,
 *     alternativeCRs: number[],
 *     overallCR: number,
 *   },
 * }
 */
export const ASSESSMENT_METADATA_SCHEMA_VERSION = 1;
