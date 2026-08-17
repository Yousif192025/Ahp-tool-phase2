import { compareAHPAndFAHP, classifyRankingStability } from '../js/frameworks/amseshi/comparison-service.js';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function approximatelyEqual(actual, expected, tolerance = 1e-12) {
  assert(Math.abs(actual - expected) <= tolerance, `Expected ${expected}, received ${actual}.`);
}

try {
  const criteria = ['Cost', 'Quality'];
  const items = ['Option A', 'Option B'];
  const criteriaMatrix = [
    [1, 3],
    [1 / 3, 1],
  ];
  const alternativeMatrices = [
    [[1, 5], [1 / 5, 1]],
    [[1, 1 / 3], [3, 1]],
  ];

  const comparison = compareAHPAndFAHP({ items, criteria, criteriaMatrix, alternativeMatrices });

  assert(comparison.input.criteria.join('|') === criteria.join('|'), 'Comparison must preserve the same criteria hierarchy.');
  assert(comparison.input.alternatives.join('|') === items.join('|'), 'Comparison must preserve the same alternatives.');
  assert(comparison.criterionComparison.length === criteria.length, 'Comparison must include every criterion.');
  assert(comparison.alternativeComparison.length === items.length, 'Comparison must include every alternative.');
  assert(comparison.results.ahp.metadata.calculationMethod === 'enhanced-ahp', 'Comparison AHP result must use the existing AHP path.');
  assert(comparison.results.fahp.metadata.calculationMethod === 'fahp-buckley-fuzzy-geometric-mean', 'Comparison FAHP result must use the independent FAHP path.');

  for (const row of comparison.criterionComparison) {
    approximatelyEqual(row.difference, row.fahpWeight - row.ahpWeight);
    assert(Number.isInteger(row.ahpRank) && Number.isInteger(row.fahpRank), 'Criterion comparison must include ranks.');
  }
  for (const row of comparison.alternativeComparison) {
    approximatelyEqual(row.difference, row.fahpScore - row.ahpScore);
    assert(Number.isInteger(row.ahpRank) && Number.isInteger(row.fahpRank), 'Alternative comparison must include ranks.');
  }

  assert(['Stable', 'Partially Changed', 'Significantly Changed'].includes(comparison.rankings.stability.status), 'Comparison must classify ranking stability.');
  assert(Number.isFinite(comparison.uncertaintySensitivity.meanCriterionTFNSpread), 'Comparison must expose FAHP TFN uncertainty spread.');
  console.log('PASS  shared assessment inputs, weight differences, ranking changes, and uncertainty summary');

  const stable = classifyRankingStability(
    [{ label: 'A', rank: 1 }, { label: 'B', rank: 2 }],
    [{ label: 'A', rank: 1 }, { label: 'B', rank: 2 }]
  );
  const partial = classifyRankingStability(
    [{ label: 'A', rank: 1 }, { label: 'B', rank: 2 }, { label: 'C', rank: 3 }],
    [{ label: 'A', rank: 1 }, { label: 'C', rank: 2 }, { label: 'B', rank: 3 }]
  );
  const significant = classifyRankingStability(
    [{ label: 'A', rank: 1 }, { label: 'B', rank: 2 }],
    [{ label: 'B', rank: 1 }, { label: 'A', rank: 2 }]
  );
  assert(stable.status === 'Stable', 'Identical rankings must be Stable.');
  assert(partial.status === 'Partially Changed', 'Same winner with changed lower ranks must be Partially Changed.');
  assert(significant.status === 'Significantly Changed', 'Changed winner must be Significantly Changed.');
  console.log('PASS  ranking stability classification');
} catch (error) {
  console.error(`FAIL  AHP–FAHP comparison verification: ${error.message}`);
  process.exit(1);
}
