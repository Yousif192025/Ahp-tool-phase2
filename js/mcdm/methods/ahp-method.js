/**
 * Module Name: ahp-method.js
 * Purpose: Adapts the existing validated AMSESHI AHP assessment function to
 *          the Phase B MCDM method contract.
 *
 * Critical constraint: this file contains no AHP formula, matrix arithmetic,
 * ranking logic, normalisation, or consistency computation. It delegates
 * directly to calculateEnhancedAHP(), which remains the frozen validated path.
 */

import { calculateEnhancedAHP } from '../../frameworks/amseshi/amseshi-framework.js';
import { assertMCDMMethod } from '../method-interface.js';

export const AHP_METHOD_ID = 'ahp';

const AHP_METADATA = Object.freeze({
  family: 'MCDM',
  methodType: 'pairwise-priority',
  implementationStatus: 'validated',
  calculationDelegate: 'js/frameworks/amseshi/amseshi-framework.js#calculateEnhancedAHP',
  notes: 'Delegates to the frozen AMSESHI AHP calculation path; contains no duplicated mathematics.',
});

/**
 * Validates the structural input required by the existing AMSESHI AHP
 * orchestration function. The validated calculation itself remains entirely
 * responsible for its current numerical behaviour.
 *
 * @param {object} input
 * @returns {{valid: boolean, errors: string[]}}
 */
export function validateAHPInput(input) {
  const errors = [];

  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['AHP method input must be an object.'] };
  }

  const { items, criteria, alternativeMatrices, criteriaMatrix } = input;

  if (!Array.isArray(items)) errors.push('AHP input requires an items array.');
  if (!Array.isArray(criteria)) errors.push('AHP input requires a criteria array.');
  if (!Array.isArray(criteriaMatrix)) errors.push('AHP input requires a criteriaMatrix array.');
  if (!Array.isArray(alternativeMatrices)) errors.push('AHP input requires an alternativeMatrices array.');

  if (Array.isArray(criteria) && Array.isArray(criteriaMatrix) && criteriaMatrix.length !== criteria.length) {
    errors.push('AHP criteriaMatrix must contain one row per criterion.');
  }

  if (Array.isArray(criteria) && Array.isArray(alternativeMatrices) && alternativeMatrices.length !== criteria.length) {
    errors.push('AHP alternativeMatrices must contain one matrix per criterion.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Creates the registered AHP method. The method stores only the most recent
 * result for contract-level getResults() access; calculate() returns the
 * original result object without changing its data shape.
 *
 * @returns {import('../method-interface.js').MCDMMethod}
 */
export function createAHPMethod() {
  let lastResults = null;

  const method = {
    id: AHP_METHOD_ID,
    name: 'Analytic Hierarchy Process (AHP)',
    metadata: AHP_METADATA,

    validateInput(input) {
      return validateAHPInput(input);
    },

    calculate(input) {
      const validation = validateAHPInput(input);
      if (!validation.valid) {
        throw new TypeError(`Invalid AHP method input: ${validation.errors.join(' ')}`);
      }

      // Intentional direct delegation: preserving the existing function call
      // preserves output shape and numerical behaviour for every golden case.
      lastResults = calculateEnhancedAHP(
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
