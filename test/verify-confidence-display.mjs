import { rateConsistencyConfidence, explainConsistency } from '../js/frameworks/amseshi/interpretation.js';
import fs from 'fs';

const files = fs.readdirSync(new URL('golden-cases/', import.meta.url)).filter(f => f.endsWith('.json') && f !== '_summary.json');

for (const file of files) {
  const record = JSON.parse(fs.readFileSync(new URL(`golden-cases/${file}`, import.meta.url)));
  const overallCR = record.output.consistency.overallCR;

  const confidence = rateConsistencyConfidence(overallCR);
  const explanation = explainConsistency(overallCR, confidence);
  const stars = '★'.repeat(confidence.stars) + '☆'.repeat(5 - confidence.stars);

  console.log(`${record.name}`);
  console.log(`  overallCR = ${overallCR.toFixed(4)}`);
  console.log(`  ${stars}  ${confidence.label}`);
  console.log(`  ${explanation}`);
  console.log();
}
