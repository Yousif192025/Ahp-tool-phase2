import { calculateEnhancedAHP } from '../js/frameworks/amseshi/amseshi-framework.js';
import fs from 'fs';

const traced = JSON.parse(fs.readFileSync(new URL('../../dom-test/traced-matrices.json', import.meta.url)));
const { criteriaCount, itemsCount, criteriaMatrix, alternativeMatrices } = traced;

const criteria = Array.from({ length: criteriaCount }, (_, c) => `Criterion ${c}`);
const items = Array.from({ length: itemsCount }, (_, i) => `Item ${i}`);

console.log('=== Input dimensions ===');
console.log('criteria:', criteria.length, 'items:', items.length, 'alternativeMatrices:', alternativeMatrices.length);

const result = calculateEnhancedAHP(items, criteria, alternativeMatrices, criteriaMatrix);

console.log('\n=== Criteria weights ===');
result.criteria.weights.forEach((w, c) => console.log(`  criterion ${c}: ${(w * 100).toFixed(2)}%`));

console.log('\n=== Local priority vector per criterion (prioritiesByCriterion) ===');
result.alternatives.prioritiesByCriterion.forEach((vec, c) => {
  console.log(`  criterion ${c}:`, vec.map(v => (v * 100).toFixed(2) + '%').join('  '));
});

console.log('\n=== Raw final scores (before normalization) ===');
console.log(' ', result.alternatives.rawScores.map(s => s.toFixed(4)).join('  '));

console.log('\n=== FINAL normalized scores ===');
console.log(' ', result.alternatives.scores.map(s => (s * 100).toFixed(2) + '%').join('  '));

console.log('\nAre final scores uniform (all ~25%)?', result.alternatives.scores.every(s => Math.abs(s - 0.25) < 0.005));
