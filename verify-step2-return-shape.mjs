import { runAssessment } from '../js/application/assessment-service.js';
import { calculateEnhancedAHP } from '../js/frameworks/amseshi/amseshi-framework.js';
import fs from 'fs';

const files = fs.readdirSync(new URL('golden-cases/', import.meta.url)).filter(f => f.endsWith('.json') && f !== '_summary.json');

let allPassed = true;

for (const file of files) {
  const record = JSON.parse(fs.readFileSync(new URL(`golden-cases/${file}`, import.meta.url)));
  const { criteria, items, criteriaMatrix, alternativeMatrices } = record.input;

  // OLD path: what performCalculation used to return directly.
  const oldResult = calculateEnhancedAHP(items, criteria, alternativeMatrices, criteriaMatrix);

  // NEW path: what performCalculation now returns, via assessment.result.
  const assessment = runAssessment({
    institution: { name: 'Test Goal' },
    hierarchy: { goal: 'Test Goal', criteria, alternatives: items },
    projectName: 'Test Goal',
    criteriaMatrix,
    alternativeMatrices,
  });
  const newResult = assessment.result;

  // Compare everything except the two independent timestamps.
  const { timestamp: t1, ...oldMeta } = oldResult.metadata;
  const { timestamp: t2, ...newMeta } = newResult.metadata;
  const oldComparable = JSON.stringify({ ...oldResult, metadata: oldMeta });
  const newComparable = JSON.stringify({ ...newResult, metadata: newMeta });

  const match = oldComparable === newComparable;
  console.log(`${match ? 'PASS' : 'FAIL'}  ${record.name}`);
  if (!match) allPassed = false;
}

console.log(allPassed
  ? '\nperformCalculation\'s new return value is identical to the old direct calculateEnhancedAHP call, for every golden case.'
  : '\nMISMATCH DETECTED.');
process.exit(allPassed ? 0 : 1);
