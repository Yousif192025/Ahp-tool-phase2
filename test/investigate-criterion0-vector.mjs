import { calculatePriorityVector } from '../js/core/ahp-engine.js';

// This is the EXACT matrix traced live from the DOM for criterion 0,
// after setting c0_item0v1 = 9 (item0 dominates item1).
const criterion0Matrix = [
  [1.000, 9.000, 0.200, 0.143],
  [0.111, 1.000, 0.333, 0.200],
  [5.000, 3.003, 1.000, 0.333],
  [6.993, 5.000, 3.003, 1.000],
];

const { weights, consistencyRatio } = calculatePriorityVector(criterion0Matrix);
console.log('Local priority vector for criterion 0:', weights.map(w => (w * 100).toFixed(2) + '%'));
console.log('Consistency ratio:', consistencyRatio.toFixed(4));
console.log('\nIs it uniform (all ~25%)?', weights.every(w => Math.abs(w - 0.25) < 0.01));
