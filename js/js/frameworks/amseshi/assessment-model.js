/**
 * Module Name: assessment-model.js
 * Purpose: Defines the AMSESHI domain data model (Institution, Assessment,
 *   success-factor hierarchy) independent of any storage or UI representation.
 * Responsibilities:
 *   - Define the shape of an AMSESHI Assessment record
 *   - Define the shape of the success-factor hierarchy (goal, criteria, alternatives)
 *   - Define institution profile data
 *   - Provide NO calculation logic — pure data shape and validation only
 * Dependencies:
 *   - js/config/research-metadata.js (for version stamping only)
 * Author: Yousif Hashim
 * Version: 1.0.0
 * Research Project: AMSESHI Academic Decision Support System (ADSS) — PhD Dissertation, Al Neelain University
 * Last Updated: 2026-07-22
 * -----------------------------------------------------------------------
 * STRICT SCOPE: nothing in this file computes a weight, a score, or a
 * consistency ratio. It only describes what an assessment IS (its data
 * shape), never HOW it is calculated (that's js/core/ahp-engine.js) or
 * HOW it is orchestrated (that's amseshi-framework.js).
 * -----------------------------------------------------------------------
 */
import { SOFTWARE_IDENTITY } from '../../config/research-metadata.js';

/**
 * The success-factor hierarchy: a goal, a set of criteria, and a set of
 * alternatives to be ranked against those criteria. This is pure input
 * structure — no matrices, no weights.
 */
export class SuccessFactorHierarchy {
  /**
   * @param {object} params
   * @param {string} params.goal
   * @param {string[]} params.criteria - criteria labels
   * @param {string[]} params.alternatives - alternative labels
   */
  constructor({ goal, criteria, alternatives }) {
    if (!goal || typeof goal !== 'string') {
      throw new Error('SuccessFactorHierarchy requires a non-empty "goal" string.');
    }
    if (!Array.isArray(criteria) || criteria.length < 1) {
      throw new Error('SuccessFactorHierarchy requires at least 1 criterion.');
    }
    if (!Array.isArray(alternatives) || alternatives.length < 2) {
      throw new Error('SuccessFactorHierarchy requires at least 2 alternatives.');
    }
    this.goal = goal;
    this.criteria = criteria;
    this.alternatives = alternatives;
  }

  get criteriaCount() {
    return this.criteria.length;
  }

  get alternativesCount() {
    return this.alternatives.length;
  }

  toJSON() {
    return { goal: this.goal, criteria: this.criteria, alternatives: this.alternatives };
  }
}

/**
 * Basic institution profile, collected during the "Institution
 * Information" lifecycle stage.
 */
export class InstitutionProfile {
  constructor({ name, type = 'Higher Education Institution', country = '', contactPerson = '', notes = '' } = {}) {
    if (!name || typeof name !== 'string') {
      throw new Error('InstitutionProfile requires a non-empty "name" string.');
    }
    this.name = name;
    this.type = type;
    this.country = country;
    this.contactPerson = contactPerson;
    this.notes = notes;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      country: this.country,
      contactPerson: this.contactPerson,
      notes: this.notes,
    };
  }
}

/**
 * Scientific traceability metadata attached to every assessment, per the
 * schema documented in js/config/research-metadata.js
 * (ASSESSMENT_METADATA_SCHEMA_VERSION). Built here so the version numbers
 * are always stamped consistently, without duplicating identity data.
 */
export class AssessmentMetadata {
  constructor({ assessmentId, projectName, assessmentConfiguration, calculationMethod = 'AHP (row geometric mean)' }) {
    this.assessmentId = assessmentId || AssessmentMetadata.generateId();
    this.projectName = projectName;
    this.assessmentDate = new Date().toISOString();
    this.frameworkVersion = SOFTWARE_IDENTITY.frameworkVersion;
    this.softwareVersion = SOFTWARE_IDENTITY.softwareVersion;
    this.assessmentConfiguration = assessmentConfiguration; // { criteriaCount, alternativesCount }
    this.calculationMethod = calculationMethod;
  }

  static generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `assessment_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  toJSON() {
    return { ...this };
  }
}

/**
 * A complete AMSESHI assessment record: institution + hierarchy +
 * traceability metadata, with an (optional, initially null) result and
 * interpretation slot to be filled in once the AHP engine and
 * interpretation.js have run. Building this record performs no
 * calculation — it only assembles already-known inputs.
 */
export class AssessmentRecord {
  constructor({ institution, hierarchy, metadata, result = null, interpretation = null }) {
    if (!(institution instanceof InstitutionProfile)) {
      throw new Error('AssessmentRecord requires an InstitutionProfile instance.');
    }
    if (!(hierarchy instanceof SuccessFactorHierarchy)) {
      throw new Error('AssessmentRecord requires a SuccessFactorHierarchy instance.');
    }
    this.institution = institution;
    this.hierarchy = hierarchy;
    this.metadata = metadata;
    this.result = result;               // raw AHP output, set later, unmodified
    this.interpretation = interpretation; // AMSESHI interpretation, set later
  }

  /**
   * Factory: builds a new AssessmentRecord from raw inputs, before any
   * calculation has been run.
   */
  static create({ institution, hierarchy, projectName }) {
    const metadata = new AssessmentMetadata({
      projectName,
      assessmentConfiguration: {
        criteriaCount: hierarchy.criteriaCount,
        alternativesCount: hierarchy.alternativesCount,
      },
    });
    return new AssessmentRecord({ institution, hierarchy, metadata });
  }

  /**
   * Returns a new AssessmentRecord with the AHP engine's result attached.
   * Does not modify the result object in any way.
   */
  withResult(result) {
    return new AssessmentRecord({
      institution: this.institution,
      hierarchy: this.hierarchy,
      metadata: this.metadata,
      result,
      interpretation: this.interpretation,
    });
  }

  /**
   * Returns a new AssessmentRecord with the AMSESHI interpretation block
   * attached (see js/frameworks/amseshi/interpretation.js).
   */
  withInterpretation(interpretation) {
    return new AssessmentRecord({
      institution: this.institution,
      hierarchy: this.hierarchy,
      metadata: this.metadata,
      result: this.result,
      interpretation,
    });
  }

  toJSON() {
    return {
      institution: this.institution.toJSON(),
      hierarchy: this.hierarchy.toJSON(),
      metadata: this.metadata.toJSON(),
      result: this.result,
      interpretation: this.interpretation,
    };
  }
}
