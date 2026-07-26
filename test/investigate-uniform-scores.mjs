import { calculatePriorityVector } from '../js/core/ahp-engine.js';

// Reproduces the DEFAULT FALLBACK formula used by createAlternativeMatrices()
// when it can't find a matching DOM input (getElementById returns null):
// matrix[i][j] = 1 + Math.abs(i - j) * 0.5  (NOT reciprocal, symmetric)
function buildDefaultFallbackMatrix(n) {
  const m = [];
  for (let i = 0; i < n; i++) {
    m[i] = [];
    for (let j = 0; j < n; j++) {
      m[i][j] = i === j ? 1 : 1 + Math.abs(i - j) * 0.5;
    }
  }
  return m;
}

for (const n of [4, 6]) {
  const matrix = buildDefaultFallbackMatrix(n);
  console.log(`\n--- n=${n} default-fallback matrix ---`);
  matrix.forEach(row => console.log(row.map(v => v.toFixed(2)).join('  ')));
  const { weights, consistencyRatio } = calculatePriorityVector(matrix);
  console.log('Priority vector:', weights.map(w => (w * 100).toFixed(2) + '%'));
  console.log('Consistency ratio:', consistencyRatio.toFixed(4));
}
