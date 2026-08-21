/**
 * Module Name: fahp-method.js
 * Purpose: Adapts the independent FAHP engine to AMSESHI's MCDM method
 *          contract. This module does not call the AHP engine.
 */

import { calculateFAHP, FAHP_METHOD_ID } from '../../core/fahp-engine.js';
import { assertMCDMMethod } from '../method-interface.js';

const FAHP_METADATA = Object.freeze({
  family: 'MCDM',
  methodType: 'fuzzy-pairwise-priority',
  implementationStatus: 'implemented-with-documented-phase-c-assumption',
  calculationDelegate: 'js/core/fahp-engine.js#calculateFAHP',
  formulation: 'Buckley-style TFN fuzzy geometric mean',
  notes: 'Independent FAHP implementation using a documented TFN scale and centroid defuzzification; it does not modify or call the frozen AHP engine.',
});

export function validateFAHPInput(input) {
  const errors = [];
  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['FAHP method input must be an object.'] };
  }

  const { items, criteria, alternativeMatrices, criteriaMatrix } = input;
  if (!Array.isArray(items) || items.length < 2) errors.push('FAHP requires at least two alternatives.');
  if (!Array.isArray(criteria) || criteria.length < 2) errors.push('FAHP requires at least two criteria.');
  if (!Array.isArray(criteriaMatrix) || criteriaMatrix.length !== criteria?.length) {
    errors.push('FAHP criteriaMatrix must contain one row per criterion.');
  }
  if (!Array.isArray(alternativeMatrices) || alternativeMatrices.length !== criteria?.length) {
    errors.push('FAHP requires one alternative matrix per criterion.');
  }

  return { valid: errors.length === 0, errors };
}

export function createFAHPMethod() {
  let lastResults = null;

  const method = {
    id: FAHP_METHOD_ID,
    name: 'Fuzzy Analytic Hierarchy Process (FAHP)',
    metadata: FAHP_METADATA,

    validateInput(input) {
      return validateFAHPInput(input);
    },

    calculate(input) {
      const validation = validateFAHPInput(input);
      if (!validation.valid) {
        throw new TypeError(`Invalid FAHP method input: ${validation.errors.join(' ')}`);
      }
      lastResults = calculateFAHP(
        input.items,
        input.criteria,
        input.alternativeMatrices,
        input.criteriaMatrix
      );
      return lastResults;
    },

    getResults() {
      return lastResults;
    },
  };

  return assertMCDMMethod(method);
}

