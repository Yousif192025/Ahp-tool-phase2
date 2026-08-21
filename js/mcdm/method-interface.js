/**
 * Module Name: method-interface.js
 * Purpose: Defines the minimal, method-independent MCDM contract used by
 *          AMSESHI's method registry.
 *
 * Phase B boundary:
 * - This module defines architecture only; it contains no AHP, FAHP, TOPSIS,
 *   or other MCDM mathematics.
 * - A method implementation is responsible for its own input validation and
 *   calculation. The registry never attempts to translate one method's
 *   mathematics into another's.
 */

/**
 * Method availability states exposed by the registry.
 *
 * `available` means an executable, validated method is registered.
 * `planned` means the method is named as a future extension but has no
 * executable implementation.
 * `unresolved` means the identifier has not yet been defined scientifically.
 */
export const METHOD_STATUS = Object.freeze({
  AVAILABLE: 'available',
  PLANNED: 'planned',
  UNRESOLVED: 'unresolved',
});

/**
 * Required operations for an executable MCDM method.
 *
 * @typedef {object} MCDMMethod
 * @property {string} id Stable machine-readable identifier.
 * @property {string} name Research-facing method name.
 * @property {(input: object) => {valid: boolean, errors: string[]}} validateInput
 * @property {(input: object) => object} calculate
 * @property {() => object|null} getResults
 * @property {object} metadata
 */
const REQUIRED_METHOD_FIELDS = Object.freeze([
  'id',
  'name',
  'validateInput',
  'calculate',
  'getResults',
  'metadata',
]);

/**
 * Validates that an executable method satisfies the Phase B contract.
 * This is deliberately structural: it does not constrain a method's distinct
 * mathematical inputs or outputs.
 *
 * @param {unknown} method
 * @returns {MCDMMethod}
 * @throws {TypeError} when the method contract is incomplete.
 */
export function assertMCDMMethod(method) {
  if (!method || typeof method !== 'object') {
    throw new TypeError('An executable MCDM method must be an object.');
  }

  for (const field of REQUIRED_METHOD_FIELDS) {
    if (!(field in method)) {
      throw new TypeError(`MCDM method contract is missing '${field}'.`);
    }
  }

  if (typeof method.id !== 'string' || method.id.trim() === '') {
    throw new TypeError('MCDM method id must be a non-empty string.');
  }

  if (typeof method.name !== 'string' || method.name.trim() === '') {
    throw new TypeError('MCDM method name must be a non-empty string.');
  }

  for (const operation of ['validateInput', 'calculate', 'getResults']) {
    if (typeof method[operation] !== 'function') {
      throw new TypeError(`MCDM method '${method.id}' must provide ${operation}().`);
    }
  }

  if (!method.metadata || typeof method.metadata !== 'object') {
    throw new TypeError(`MCDM method '${method.id}' must provide metadata.`);
  }

  return method;
}

/**
 * Creates an immutable public description for a registry entry. Planned and
 * unresolved entries intentionally contain no calculate function, preventing
 * them from being mistaken for an implemented mathematical method.
 *
 * @param {{id: string, name: string, status: string, description: string, available: boolean}} entry
 * @returns {Readonly<object>}
 */
export function createMethodDescriptor(entry) {
  return Object.freeze({
    id: entry.id,
    name: entry.name,
    status: entry.status,
    description: entry.description,
    available: entry.available,
  });
}
