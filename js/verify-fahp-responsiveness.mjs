import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateFAHP } from '../js/core/fahp-engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, 'golden-cases', 'case-4-typical-real-world.json');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  const { items, criteria, criteriaMatrix, alternativeMatrices } = fixture.input;
  const baseline = calculateFAHP(items, criteria, alternativeMatrices, criteriaMatrix);

  // Use the same complete decision hierarchy and alter only one real
  // pairwise judgment in the Cost matrix: Vendor 1 vs Vendor 4, from 5 to 9.
  const alteredMatrices = alternativeMatrices.map((matrix) => matrix.map((row) => [...row]));
  alteredMatrices[0][0][3] = 9;
  alteredMatrices[0][3][0] = 1 / 9;
  const altered = calculateFAHP(items, criteria, alteredMatrices, criteriaMatrix);

  const scoreChanged = baseline.alternatives.scores.some(
    (score, index) => Math.abs(score - altered.alternatives.scores[index]) > 1e-10
  );
  assert(scoreChanged, 'Changing a valid pairwise judgment must change at least one FAHP final score.');
  assert(
    baseline.alternatives.prioritiesByCriterion[0][0] !== altered.alternatives.prioritiesByCriterion[0][0],
    'The altered local FAHP priority vector must change.'
  );

  console.log(`PASS  fixture-based FAHP response: ${items[0]} score ${baseline.alternatives.scores[0].toFixed(6)} → ${altered.alternatives.scores[0].toFixed(6)}.`);
  console.log(`PASS  baseline top rank: ${baseline.alternatives.ranking[0].label}; altered top rank: ${altered.alternatives.ranking[0].label}.`);
} catch (error) {
  console.error(`FAIL  FAHP responsiveness verification: ${error.message}`);
  process.exit(1);
}
