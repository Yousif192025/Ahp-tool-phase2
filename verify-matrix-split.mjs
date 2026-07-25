// Equivalence proof for Migration Step 1: buildCriteriaMatrix(criteriaCount,
// overrides) — the extracted pure logic — must produce IDENTICAL output to
// the original monolithic createCriteriaMatrix(criteriaCount) that read
// document.getElementById directly, for the same logical input values.

// OLD behavior (verbatim, pre-split), reading from a fake "DOM" map
// instead of document.getElementById, so it runs in Node.
function oldCreateCriteriaMatrix(criteriaCount, fakeDom) {
  const matrix = [];
  for (let i = 0; i < criteriaCount; i++) {
    matrix[i] = [];
    for (let j = 0; j < criteriaCount; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else {
        const input = fakeDom[`criteria${i}v${j}`]; // { value: string } | undefined
        if (input && input.value && !isNaN(parseFloat(input.value))) {
          const value = parseFloat(input.value);
          matrix[i][j] = isNaN(value) ? 1 : Math.max(0.111, Math.min(9, value));
        } else {
          matrix[i][j] = 1;
        }
      }
    }
  }
  return matrix;
}

// NEW split behavior (copied verbatim from the edited index.html).
function collectCriteriaComparisonValues(criteriaCount, fakeDom) {
  const overrides = {};
  for (let i = 0; i < criteriaCount; i++) {
    for (let j = 0; j < criteriaCount; j++) {
      if (i !== j) {
        const input = fakeDom[`criteria${i}v${j}`];
        if (input) {
          overrides[`criteria${i}v${j}`] = input.value;
        }
      }
    }
  }
  return overrides;
}

function buildCriteriaMatrix(criteriaCount, overrides) {
  const matrix = [];
  for (let i = 0; i < criteriaCount; i++) {
    matrix[i] = [];
    for (let j = 0; j < criteriaCount; j++) {
      if (i === j) {
        matrix[i][j] = 1;
      } else {
        const raw = overrides[`criteria${i}v${j}`];
        if (raw !== undefined && raw !== '' && !isNaN(parseFloat(raw))) {
          const value = parseFloat(raw);
          matrix[i][j] = isNaN(value) ? 1 : Math.max(0.111, Math.min(9, value));
        } else {
          matrix[i][j] = 1;
        }
      }
    }
  }
  return matrix;
}

function newCreateCriteriaMatrix(criteriaCount, fakeDom) {
  const overrides = collectCriteriaComparisonValues(criteriaCount, fakeDom);
  return buildCriteriaMatrix(criteriaCount, overrides);
}

// Test scenarios, covering the edge cases the original branches handle:
const scenarios = [
  {
    name: 'fully filled, 3x3',
    criteriaCount: 3,
    fakeDom: {
      'criteria0v1': { value: '3' }, 'criteria1v0': { value: '0.333' },
      'criteria0v2': { value: '5' }, 'criteria2v0': { value: '0.2' },
      'criteria1v2': { value: '2' }, 'criteria2v1': { value: '0.5' },
    },
  },
  {
    name: 'missing input element entirely, 3x3',
    criteriaCount: 3,
    fakeDom: {
      'criteria0v1': { value: '3' },
      // criteria1v0 intentionally absent (input doesn't exist)
      'criteria0v2': { value: '5' }, 'criteria2v0': { value: '0.2' },
      'criteria1v2': { value: '2' }, 'criteria2v1': { value: '0.5' },
    },
  },
  {
    name: 'empty string value, 3x3',
    criteriaCount: 3,
    fakeDom: {
      'criteria0v1': { value: '' }, 'criteria1v0': { value: '0.333' },
      'criteria0v2': { value: '5' }, 'criteria2v0': { value: '0.2' },
      'criteria1v2': { value: '2' }, 'criteria2v1': { value: '0.5' },
    },
  },
  {
    name: 'out-of-range value clamped, 3x3',
    criteriaCount: 3,
    fakeDom: {
      'criteria0v1': { value: '15' }, 'criteria1v0': { value: '0.01' },
      'criteria0v2': { value: '5' }, 'criteria2v0': { value: '0.2' },
      'criteria1v2': { value: '2' }, 'criteria2v1': { value: '0.5' },
    },
  },
  {
    name: 'non-numeric garbage value, 3x3',
    criteriaCount: 3,
    fakeDom: {
      'criteria0v1': { value: 'abc' }, 'criteria1v0': { value: '0.333' },
      'criteria0v2': { value: '5' }, 'criteria2v0': { value: '0.2' },
      'criteria1v2': { value: '2' }, 'criteria2v1': { value: '0.5' },
    },
  },
  {
    name: '1x1 (single criterion)',
    criteriaCount: 1,
    fakeDom: {},
  },
  {
    name: '8x8 (max size, sparse input)',
    criteriaCount: 8,
    fakeDom: { 'criteria0v1': { value: '4' }, 'criteria7v6': { value: '0.25' } },
  },
];

let allPassed = true;
for (const s of scenarios) {
  const oldResult = oldCreateCriteriaMatrix(s.criteriaCount, s.fakeDom);
  const newResult = newCreateCriteriaMatrix(s.criteriaCount, s.fakeDom);
  const match = JSON.stringify(oldResult) === JSON.stringify(newResult);
  console.log(`${match ? 'PASS' : 'FAIL'}  ${s.name}`);
  if (!match) {
    allPassed = false;
    console.log('  old:', JSON.stringify(oldResult));
    console.log('  new:', JSON.stringify(newResult));
  }
}

console.log(allPassed ? '\nAll scenarios: split logic is behaviorally IDENTICAL to pre-split.' : '\nMISMATCH DETECTED.');
process.exit(allPassed ? 0 : 1);
