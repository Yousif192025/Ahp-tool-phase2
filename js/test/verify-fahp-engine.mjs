import {
  TFN_LINGUISTIC_SCALE,
  crispJudgmentToTFN,
  fuzzyReciprocal,
  buildFuzzyComparisonMatrix,
  calculateFuzzyPriority,
  defuzzifyTFN,
  normalizeWeights,
  calculateFAHP,
} from '../js/core/fahp-engine.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function approximatelyEqual(actual, expected, tolerance = 1e-12) {
  assert(Math.abs(actual - expected) <= tolerance, `Expected ${expected}, received ${actual}.`);
}

function sum(values) {
  return values.reduce((total, value) => total + value, 0);
}

try {
  // 1. Linguistic/crisp scale conversion to a TFN.
  const moderate = crispJudgmentToTFN(3);
  assert(moderate.lower === 2 && moderate.modal === 3 && moderate.upper === 4, 'Saaty intensity 3 must map to TFN (2,3,4).');
  assert(TFN_LINGUISTIC_SCALE[5].label === 'Strong importance', 'The selected TFN linguistic scale must expose intensity labels.');
  console.log('PASS  TFN conversion');

  // 2. Positive TFN reciprocal: (2,3,4)^-1 = (1/4,1/3,1/2).
  const reciprocal = fuzzyReciprocal(moderate);
  approximatelyEqual(reciprocal.lower, 1 / 4);
  approximatelyEqual(reciprocal.modal, 1 / 3);
  approximatelyEqual(reciprocal.upper, 1 / 2);
  const reciprocalFromCrisp = crispJudgmentToTFN(1 / 3);
  approximatelyEqual(reciprocalFromCrisp.lower, reciprocal.lower);
  approximatelyEqual(reciprocalFromCrisp.modal, reciprocal.modal);
  approximatelyEqual(reciprocalFromCrisp.upper, reciprocal.upper);
  console.log('PASS  reciprocal TFN');

  // 3. Fuzzy reciprocal matrix construction from existing AHP-style values.
  const fuzzyMatrix = buildFuzzyComparisonMatrix([
    [1, 3],
    [1 / 3, 1],
  ]);
  assert(fuzzyMatrix.length === 2 && fuzzyMatrix[0].length === 2, 'Fuzzy comparison matrix must preserve shape.');
  approximatelyEqual(fuzzyMatrix[0][1].lower, 2);
  approximatelyEqual(fuzzyMatrix[1][0].lower, 1 / 4);
  assert(fuzzyMatrix[0][0].modal === 1 && fuzzyMatrix[1][1].modal === 1, 'Fuzzy diagonal entries must be (1,1,1).');
  console.log('PASS  fuzzy matrix construction');

  // 4–6. Fuzzy geometric-mean weights, centroid defuzzification, and normalization.
  const priority = calculateFuzzyPriority([
    [1, 3],
    [1 / 3, 1],
  ]);
  assert(priority.fuzzyGeometricMeans.length === 2, 'Priority calculation must emit fuzzy geometric means.');
  assert(priority.fuzzyWeights.length === 2, 'Priority calculation must emit fuzzy weights.');
  assert(priority.fuzzyWeights[0].lower <= priority.fuzzyWeights[0].modal && priority.fuzzyWeights[0].modal <= priority.fuzzyWeights[0].upper, 'Fuzzy weights must remain ordered TFNs.');
  const directDefuzzification = defuzzifyTFN(priority.fuzzyWeights[0]);
  approximatelyEqual(directDefuzzification, priority.defuzzifiedWeights[0]);
  approximatelyEqual(sum(priority.normalizedWeights), 1);
  assert(priority.normalizedWeights[0] > priority.normalizedWeights[1], 'The 3:1 matrix must prioritize the first item.');
  const normalized = normalizeWeights([2, 3, 5]);
  approximatelyEqual(sum(normalized), 1);
  approximatelyEqual(normalized[2], 0.5);
  console.log('PASS  fuzzy weights, centroid defuzzification, and normalization');

  // 7. Full two-level FAHP propagation and final ranking.
  const result = calculateFAHP(
    ['Alternative A', 'Alternative B'],
    ['Criterion 1', 'Criterion 2'],
    [
      [[1, 5], [1 / 5, 1]],
      [[1, 1 / 3], [3, 1]],
    ],
    [[1, 3], [1 / 3, 1]]
  );
  approximatelyEqual(sum(result.criteria.weights), 1);
  approximatelyEqual(sum(result.alternatives.scores), 1);
  assert(result.alternatives.ranking[0].label === 'Alternative A', 'The propagated FAHP result must rank Alternative A first for this matrix.');
  assert(result.metadata.defuzzificationMethod === 'centroid-centre-of-gravity', 'The implemented defuzzification method must be declared in metadata.');
  assert(result.consistency.status === 'not-applicable', 'The FAHP engine must not claim an unimplemented fuzzy consistency metric.');
  console.log('PASS  final FAHP ranking and transparent diagnostics');
} catch (error) {
  console.error(`FAIL  FAHP engine verification: ${error.message}`);
  process.exit(1);
}
