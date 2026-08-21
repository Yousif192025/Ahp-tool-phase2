/**
 * Module Name: method-registry.js
 * Purpose: Central registry for AMSESHI decision-analysis methods.
 *
 * Phase C scope:
 * - Registers AHP and the independent FAHP adapter as executable methods.
 * - Exposes TOPSIS only as a planned, unavailable descriptor.
 * - Exposes NP as unresolved because its intended meaning has not been
 *   established by the researcher.
 * - Contains no AHP, FAHP, TOPSIS, or NP mathematics itself.
 */

import { METHOD_STATUS, assertMCDMMethod, createMethodDescriptor } from './method-interface.js';
import { AHP_METHOD_ID, createAHPMethod } from './methods/ahp-method.js';
import { createFAHPMethod } from './methods/fahp-method.js';

export const METHOD_IDS = Object.freeze({
  AHP: AHP_METHOD_ID,
  FAHP: 'fahp',
  TOPSIS: 'topsis',
  NP: 'np',
});

const FUTURE_METHODS = Object.freeze([
  createMethodDescriptor({
    id: METHOD_IDS.TOPSIS,
    name: 'Technique for Order Preference by Similarity to Ideal Solution (TOPSIS)',
    status: METHOD_STATUS.PLANNED,
    description: 'Planned only. No TOPSIS decision-matrix or ranking calculation is implemented.',
    available: false,
  }),
  createMethodDescriptor({
    id: METHOD_IDS.NP,
    name: 'NP',
    status: METHOD_STATUS.UNRESOLVED,
    description: 'Unresolved future extension. The project has not defined what NP means.',
    available: false,
  }),
]);

/**
 * Registry that separates discoverable method status from executable methods.
 * A planned/unresolved descriptor is never backed by a method object and thus
 * cannot accidentally be calculated.
 */
export class MCDMMethodRegistry {
  constructor({ methods = [], descriptors = FUTURE_METHODS } = {}) {
    this.methods = new Map();
    this.descriptors = new Map();

    for (const descriptor of descriptors) {
      this.registerDescriptor(descriptor);
    }

    for (const method of methods) {
      this.registerMethod(method);
    }
  }

  registerMethod(method) {
    const executableMethod = assertMCDMMethod(method);
    if (this.descriptors.has(executableMethod.id) || this.methods.has(executableMethod.id)) {
      throw new Error(`An MCDM method with id '${executableMethod.id}' is already registered.`);
    }

    this.methods.set(executableMethod.id, executableMethod);
    this.descriptors.set(executableMethod.id, createMethodDescriptor({
      id: executableMethod.id,
      name: executableMethod.name,
      status: METHOD_STATUS.AVAILABLE,
      description: executableMethod.metadata.notes || 'Available calculation method.',
      available: true,
    }));
    return this;
  }

  registerDescriptor(descriptor) {
    if (!descriptor || typeof descriptor !== 'object' || !descriptor.id) {
      throw new TypeError('MCDM method descriptors require a stable id.');
    }
    if (descriptor.available) {
      throw new Error(`Available descriptor '${descriptor.id}' must be registered with an executable method.`);
    }
    if (this.descriptors.has(descriptor.id) || this.methods.has(descriptor.id)) {
      throw new Error(`An MCDM method with id '${descriptor.id}' is already registered.`);
    }

    this.descriptors.set(descriptor.id, createMethodDescriptor(descriptor));
    return this;
  }

  listMethods() {
    return Array.from(this.descriptors.values());
  }

  getMethodDescriptor(methodId) {
    return this.descriptors.get(methodId) || null;
  }

  isAvailable(methodId) {
    return this.methods.has(methodId);
  }

  getMethod(methodId) {
    const descriptor = this.getMethodDescriptor(methodId);
    if (!descriptor) {
      throw new Error(`Unknown MCDM method '${methodId}'.`);
    }
    if (!descriptor.available) {
      throw new Error(`MCDM method '${descriptor.name}' is ${descriptor.status} and cannot be calculated.`);
    }
    return this.methods.get(methodId);
  }

  validateInput(methodId, input) {
    return this.getMethod(methodId).validateInput(input);
  }

  calculate(methodId, input) {
    return this.getMethod(methodId).calculate(input);
  }
}

/**
 * Creates the Phase C registry. New adapter instances keep test and
 * application state independent. AHP and FAHP remain separate methods.
 */
export function createDefaultMethodRegistry() {
  return new MCDMMethodRegistry({ methods: [createAHPMethod(), createFAHPMethod()] });
}

/**
 * The singleton used by the AMSESHI assessment and comparison services.
 * TOPSIS remains planned and NP remains unresolved.
 */
export const mcdmMethodRegistry = createDefaultMethodRegistry();
