import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateEnhancedAHP } from '../js/frameworks/amseshi/amseshi-framework.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const goldenDir = path.join(__dirname, 'golden-cases');

function deepEqualNumbers(a, b, pathStr = '') {
  if (typeof a === 'number' && typeof b === 'number') {
    // Bitwise-identical floating point comparison — not just "close enough".
    if (a !== b) {
      throw new Error(`Mismatch at ${pathStr}: baseline=${a} extracted=${b}`);
    }
    return;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      throw new Error(`Array shape mismatch at ${pathStr}`);
    }
    a.forEach((v, i) => deepEqualNumbers(v, b[i], `${pathStr}[${i}]`));
    return;
  }
  if (a && typeof a === 'object') {
    const keysA = Object.keys(a).sort();
    const keysB = Object.keys(b).sort();
    if (keysA.join(',') !== keysB.join(',')) {
      throw new Error(`Key mismatch at ${pathStr}: [${keysA}] vs [${keysB}]`);
    }
    keysA.forEach(k => deepEqualNumbers(a[k], b[k], `${pathStr}.${k}`));
    return;
  }
  if (a !== b) {
    throw new Error(`Mismatch at ${pathStr}: baseline=${JSON.stringify(a)} extracted=${JSON.stringify(b)}`);
  }
}

const files = fs.readdirSync(goldenDir).filter(f => f.endsWith('.json') && f !== '_summary.json');

let allPassed = true;

for (const file of files) {
  const record = JSON.parse(fs.readFileSync(path.join(goldenDir, file), 'utf8'));
  const { criteria, items, criteriaMatrix, alternativeMatrices } = record.input;

  const extractedResult = calculateEnhancedAHP(items, criteria, alternativeMatrices, criteriaMatrix);
  const { timestamp, ...extractedMetadata } = extractedResult.metadata;
  const comparableExtracted = { ...extractedResult, metadata: extractedMetadata };

  try {
    deepEqualNumbers(record.output, comparableExtracted, record.name);
    console.log(`PASS  ${record.name}`);
  } catch (err) {
    allPassed = false;
    console.error(`FAIL  ${record.name}: ${err.message}`);
  }
}

console.log(allPassed ? '\nAll golden cases matched exactly.' : '\nSOME CASES FAILED.');
process.exit(allPassed ? 0 : 1);
