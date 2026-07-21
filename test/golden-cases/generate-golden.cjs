const fs = require('fs');
const path = require('path');
const {
  calculateEnhancedAHP,
  createCriteriaMatrix_REFERENCE,
  createAlternativeMatrices_REFERENCE,
} = require('./reference-engine.cjs');

const outDir = path.join(__dirname, 'golden-output');
fs.mkdirSync(outDir, { recursive: true });

// Five representative cases, chosen to exercise: a trivial 1-criterion edge
// case, a small consistent case, a case with a deliberately inconsistent
// matrix (CR should exceed 0.1), a typical mid-size real-world case, and the
// maximum-size 8x8 boundary case the UI allows.
const cases = [
  {
    name: 'case-1-single-criterion',
    description: 'Edge case: 1 criterion, 2 alternatives',
    criteria: ['Cost'],
    items: ['Option A', 'Option B'],
    criteriaOverrides: {},
    altOverrides: [
      { 'c0_item0v1': 3, 'c0_item1v0': 1 / 3 },
    ],
  },
  {
    name: 'case-2-small-consistent',
    description: '3 criteria, 3 alternatives, consistent matrices',
    criteria: ['Cost', 'Quality', 'Speed'],
    items: ['A', 'B', 'C'],
    criteriaOverrides: {
      'criteria0v1': 3, 'criteria1v0': 1 / 3,
      'criteria0v2': 5, 'criteria2v0': 1 / 5,
      'criteria1v2': 3, 'criteria2v1': 1 / 3,
    },
    altOverrides: [
      { 'c0_item0v1': 2, 'c0_item1v0': 0.5, 'c0_item0v2': 4, 'c0_item2v0': 0.25, 'c0_item1v2': 2, 'c0_item2v1': 0.5 },
      { 'c1_item0v1': 1, 'c1_item1v0': 1, 'c1_item0v2': 3, 'c1_item2v0': 1 / 3, 'c1_item1v2': 3, 'c1_item2v1': 1 / 3 },
      { 'c2_item0v1': 0.5, 'c2_item1v0': 2, 'c2_item0v2': 1, 'c2_item2v0': 1, 'c2_item1v2': 2, 'c2_item2v1': 0.5 },
    ],
  },
  {
    name: 'case-3-inconsistent',
    description: '3 criteria with a deliberately inconsistent (circular) comparison matrix',
    criteria: ['X', 'Y', 'Z'],
    items: ['P', 'Q'],
    criteriaOverrides: {
      // Deliberately circular/inconsistent: X>Y, Y>Z, but Z>X too.
      'criteria0v1': 5, 'criteria1v0': 1 / 5,
      'criteria1v2': 5, 'criteria2v1': 1 / 5,
      'criteria2v0': 5, 'criteria0v2': 1 / 5,
    },
    altOverrides: [
      { 'c0_item0v1': 2, 'c0_item1v0': 0.5 },
      { 'c1_item0v1': 3, 'c1_item1v0': 1 / 3 },
      { 'c2_item0v1': 0.5, 'c2_item1v0': 2 },
    ],
  },
  {
    name: 'case-4-typical-real-world',
    description: '4 criteria, 4 alternatives, realistic mixed matrix',
    criteria: ['Cost', 'Quality', 'Delivery Time', 'Support'],
    items: ['Vendor 1', 'Vendor 2', 'Vendor 3', 'Vendor 4'],
    criteriaOverrides: {
      'criteria0v1': 2, 'criteria1v0': 0.5,
      'criteria0v2': 4, 'criteria2v0': 0.25,
      'criteria0v3': 3, 'criteria3v0': 1 / 3,
      'criteria1v2': 3, 'criteria2v1': 1 / 3,
      'criteria1v3': 2, 'criteria3v1': 0.5,
      'criteria2v3': 0.5, 'criteria3v2': 2,
    },
    altOverrides: [
      { 'c0_item0v1': 2, 'c0_item1v0': 0.5, 'c0_item0v2': 3, 'c0_item2v0': 1 / 3, 'c0_item0v3': 5, 'c0_item3v0': 0.2, 'c0_item1v2': 2, 'c0_item2v1': 0.5, 'c0_item1v3': 3, 'c0_item3v1': 1 / 3, 'c0_item2v3': 2, 'c0_item3v2': 0.5 },
      { 'c1_item0v1': 0.5, 'c1_item1v0': 2, 'c1_item0v2': 1, 'c1_item2v0': 1, 'c1_item0v3': 0.33, 'c1_item3v0': 3, 'c1_item1v2': 2, 'c1_item2v1': 0.5, 'c1_item1v3': 0.5, 'c1_item3v1': 2, 'c1_item2v3': 0.33, 'c1_item3v2': 3 },
      { 'c2_item0v1': 3, 'c2_item1v0': 1 / 3, 'c2_item0v2': 2, 'c2_item2v0': 0.5, 'c2_item0v3': 4, 'c2_item3v0': 0.25, 'c2_item1v2': 0.5, 'c2_item2v1': 2, 'c2_item1v3': 2, 'c2_item3v1': 0.5, 'c2_item2v3': 3, 'c2_item3v2': 1 / 3 },
      { 'c3_item0v1': 1, 'c3_item1v0': 1, 'c3_item0v2': 1, 'c3_item2v0': 1, 'c3_item0v3': 1, 'c3_item3v0': 1, 'c3_item1v2': 1, 'c3_item2v1': 1, 'c3_item1v3': 1, 'c3_item3v1': 1, 'c3_item2v3': 1, 'c3_item3v2': 1 },
    ],
  },
  {
    name: 'case-5-max-size-8x8',
    description: 'Boundary case: 8 criteria, 8 alternatives (UI maximum)',
    criteria: Array.from({ length: 8 }, (_, i) => `Criterion ${i + 1}`),
    items: Array.from({ length: 8 }, (_, i) => `Alternative ${i + 1}`),
    criteriaOverrides: (() => {
      const o = {};
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (i !== j) o[`criteria${i}v${j}`] = i < j ? (1 + ((i + j) % 5)) : 1 / (1 + ((j + i) % 5));
        }
      }
      return o;
    })(),
    altOverrides: Array.from({ length: 8 }, (_, c) => {
      const o = {};
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (i !== j) o[`c${c}_item${i}v${j}`] = i < j ? (1 + ((i + j + c) % 4)) : 1 / (1 + ((j + i + c) % 4));
        }
      }
      return o;
    }),
  },
];

const summary = [];

for (const testCase of cases) {
  const criteriaCount = testCase.criteria.length;
  const itemsCount = testCase.items.length;

  const criteriaMatrix = createCriteriaMatrix_REFERENCE(criteriaCount, testCase.criteriaOverrides);

  const altOverridesResolved = typeof testCase.altOverrides === 'function'
    ? testCase.altOverrides
    : testCase.altOverrides;

  // Build one combined overrides object per criterion index, matching what
  // createAlternativeMatrices_REFERENCE expects (it reads per-criterion keys
  // like c{c}_item{i}v{j} from a single flat overrides object).
  const flatAltOverrides = {};
  for (let c = 0; c < criteriaCount; c++) {
    Object.assign(flatAltOverrides, altOverridesResolved[c] || {});
  }

  const alternativeMatrices = createAlternativeMatrices_REFERENCE(criteriaCount, itemsCount, flatAltOverrides);

  const result = calculateEnhancedAHP(testCase.items, testCase.criteria, alternativeMatrices, criteriaMatrix);

  // Strip the timestamp: it is wall-clock metadata, not a calculation
  // output, and will legitimately differ between the baseline run and any
  // later verification run.
  const { timestamp, ...metadataWithoutTimestamp } = result.metadata;
  const comparable = { ...result, metadata: metadataWithoutTimestamp };

  const record = {
    name: testCase.name,
    description: testCase.description,
    input: {
      criteria: testCase.criteria,
      items: testCase.items,
      criteriaMatrix,
      alternativeMatrices,
    },
    output: comparable,
  };

  fs.writeFileSync(
    path.join(outDir, `${testCase.name}.json`),
    JSON.stringify(record, null, 2)
  );

  summary.push({
    name: testCase.name,
    criteriaCR: comparable.consistency.criteriaCR,
    overallCR: comparable.consistency.overallCR,
    topAlternative: testCase.items[
      comparable.alternatives.scores.indexOf(Math.max(...comparable.alternatives.scores))
    ],
  });

  console.log(`Generated golden case: ${testCase.name}`);
}

fs.writeFileSync(path.join(outDir, '_summary.json'), JSON.stringify(summary, null, 2));
console.log('\nSummary:');
console.table(summary);
