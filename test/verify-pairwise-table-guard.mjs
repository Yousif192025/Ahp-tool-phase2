// Simulates the exact signature-based idempotency guard added to
// setupAlternativePairwiseTables(), using a fake DOM to prove:
// 1. First call builds the table.
// 2. A second call with unchanged criteria/alternative names does NOT
//    rebuild (this is the fix — previously it always rebuilt, wiping
//    user-entered comparison values).
// 3. A call after genuinely renaming a criterion DOES rebuild correctly.

function buildPairwiseTableSignature(criteriaCount, itemsCount, fakeDom) {
  const criteriaNames = Array.from({ length: criteriaCount }, (_, c) => fakeDom[`criteria${c}`]?.value || '');
  const itemNames = Array.from({ length: itemsCount }, (_, i) => fakeDom[`item${i}`]?.value || '');
  return JSON.stringify({ criteriaNames, itemNames });
}

function simulateSetup(container, criteriaCount, itemsCount, fakeDom, userEnteredValue) {
  const signature = buildPairwiseTableSignature(criteriaCount, itemsCount, fakeDom);

  if (container.dataset.builtSignature === signature && container.children.length > 0) {
    return { rebuilt: false, preservedValue: container.userValue };
  }

  // Simulates the destructive rebuild: wipes any prior user value.
  container.children.length = 1; // pretend rebuild produced content
  container.userValue = userEnteredValue !== undefined ? userEnteredValue : 1; // default "1"
  container.dataset.builtSignature = signature;
  return { rebuilt: true, preservedValue: container.userValue };
}

function freshContainer() {
  return { dataset: {}, children: { length: 0 }, userValue: undefined };
}

let allPassed = true;
function check(label, condition) {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}`);
  if (!condition) allPassed = false;
}

// Scenario 1: first build.
const container1 = freshContainer();
const dom1 = { criteria0: { value: 'Cost' }, criteria1: { value: 'Quality' }, item0: { value: 'A' }, item1: { value: 'B' } };
const r1 = simulateSetup(container1, 2, 2, dom1);
check('First call builds the table', r1.rebuilt === true);

// Scenario 2 (THE FIX): user enters a comparison value, then
// runEnhancedCalculation() calls setupAlternativePairwiseTables() again
// with the SAME criteria/alternative names, right before reading the
// matrix. This must NOT wipe the user's entered value.
container1.userValue = 7; // user typed "7" into a comparison cell
const r2 = simulateSetup(container1, 2, 2, dom1, 999 /* would be the wiped default if rebuilt */);
check('Second call with unchanged names does NOT rebuild', r2.rebuilt === false);
check('User-entered value (7) is preserved, not reset', r2.preservedValue === 7);

// Scenario 3: user genuinely renames a criterion — must rebuild.
const dom2 = { criteria0: { value: 'Cost' }, criteria1: { value: 'Delivery Time' /* renamed */ }, item0: { value: 'A' }, item1: { value: 'B' } };
const r3 = simulateSetup(container1, 2, 2, dom2);
check('Renaming a criterion triggers a correct rebuild', r3.rebuilt === true);

console.log(allPassed ? '\nIdempotency guard behaves exactly as intended.' : '\nMISMATCH DETECTED.');
process.exit(allPassed ? 0 : 1);
