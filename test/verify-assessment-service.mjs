import { runAssessment } from '../js/application/assessment-service.js';
import fs from 'fs';

const golden = JSON.parse(fs.readFileSync(new URL('golden-cases/case-4-typical-real-world.json', import.meta.url)));

// Called exactly as a future UI wizard would: plain objects in, one call out.
const assessment = runAssessment({
  institution: { name: 'ABC University', country: 'Sudan' },
  hierarchy: {
    goal: 'Evaluate Mobile Cloud Learning Readiness',
    criteria: golden.input.criteria,
    alternatives: golden.input.items,
  },
  projectName: 'ABC University Readiness Assessment',
  criteriaMatrix: golden.input.criteriaMatrix,
  alternativeMatrices: golden.input.alternativeMatrices,
});

console.log('Assessment ID:', assessment.metadata.assessmentId);
console.log('Institution:', assessment.institution.name);
console.log('Criteria weights:', assessment.result.criteria.weights.map(w => w.toFixed(3)));
console.log('Overall CR:', assessment.result.consistency.overallCR.toFixed(4));
console.log('Confidence:', assessment.interpretation.confidence.label, `(${assessment.interpretation.confidence.stars}★)`);
console.log('Readiness status:', assessment.interpretation.readiness.status);

// Cross-check: the numeric result must exactly match the golden case's
// recorded output (minus timestamp), proving the service layer didn't
// alter anything the engine produced.
const { timestamp, ...comparableMetadata } = assessment.result.metadata;
const actual = JSON.stringify({ ...assessment.result, metadata: comparableMetadata });
const expected = JSON.stringify(golden.output);
console.log('\nMatches golden case-4 output exactly:', actual === expected ? 'YES' : 'NO — MISMATCH');
