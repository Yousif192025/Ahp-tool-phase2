// Phase 4.3 example lifecycle walkthrough.
// Demonstrates the new framework modules working together, using the
// UNCHANGED Phase 3 AHP engine and orchestration for the actual math.
// Uses the same inputs as test/golden-cases/case-4-typical-real-world.json.

import { InstitutionProfile, SuccessFactorHierarchy, AssessmentRecord } from '../js/frameworks/amseshi/assessment-model.js';
import { AssessmentWorkflow, LIFECYCLE_STAGES } from '../js/frameworks/amseshi/assessment-workflow.js';
import { interpretAssessment } from '../js/frameworks/amseshi/interpretation.js';
import { calculateEnhancedAHP } from '../js/frameworks/amseshi/amseshi-framework.js';
import fs from 'fs';

const golden = JSON.parse(fs.readFileSync(new URL('golden-cases/case-4-typical-real-world.json', import.meta.url)));

console.log('--- Stage-by-stage workflow navigation ---');
const workflow = new AssessmentWorkflow();
console.log(`Stage 1/${LIFECYCLE_STAGES.length}: ${workflow.currentStage.label} (${workflow.currentStage.phase}) — progress ${(workflow.progress * 100).toFixed(0)}%`);
workflow.goTo('institution-information');
const institution = new InstitutionProfile({ name: 'ABC University', country: 'Sudan' });
console.log(`  -> collected institution: ${institution.name}`);

workflow.next(); // assessment-configuration
workflow.next(); // framework-definition
const hierarchy = new SuccessFactorHierarchy({
  goal: golden.input.criteria ? 'Evaluate Mobile Cloud Learning Readiness' : 'Assessment',
  criteria: golden.input.criteria,
  alternatives: golden.input.items,
});
console.log(`  -> defined hierarchy: ${hierarchy.criteriaCount} criteria, ${hierarchy.alternativesCount} alternatives`);

let assessment = AssessmentRecord.create({ institution, hierarchy, projectName: 'ABC University Readiness Assessment' });
console.log(`  -> assessment record created: ${assessment.metadata.assessmentId}`);

workflow.next(); // success-factor-evaluation
workflow.next(); // pairwise-comparison
workflow.next(); // decision-analysis
console.log(`\nStage: ${workflow.currentStage.label} — calling the UNMODIFIED Phase 3 AHP engine`);
const result = calculateEnhancedAHP(
  golden.input.items,
  golden.input.criteria,
  golden.input.alternativeMatrices,
  golden.input.criteriaMatrix
);
assessment = assessment.withResult(result);
console.log(`  -> criteria weights: [${result.criteria.weights.map(w => w.toFixed(3)).join(', ')}]`);
console.log(`  -> overall CR: ${result.consistency.overallCR.toFixed(4)}`);

workflow.next(); // consistency-verification
workflow.next(); // priority-analysis
workflow.next(); // institutional-readiness-assessment
workflow.next(); // interpretation
console.log(`\nStage: ${workflow.currentStage.label} — AMSESHI interpreting the unchanged AHP numbers`);
const topIndex = result.alternatives.scores.indexOf(Math.max(...result.alternatives.scores));
const interpretation = interpretAssessment({
  overallCR: result.consistency.overallCR,
});
assessment = assessment.withInterpretation(interpretation);
console.log(`  -> top alternative (by relative priority): ${golden.input.items[topIndex]} (${(result.alternatives.scores[topIndex] * 100).toFixed(1)}% relative share)`);
console.log(`  -> confidence: ${'★'.repeat(interpretation.confidence.stars)} ${interpretation.confidence.label}`);
console.log(`  -> ${interpretation.confidence.explanation}`);
console.log(`  -> institutional readiness: ${interpretation.readiness.status} — ${interpretation.readiness.explanation}`);

workflow.next(); // recommendations
console.log(`\nStage: ${workflow.currentStage.label}`);
console.log(`  -> ${interpretation.recommendation.status} — ${interpretation.recommendation.rationale}`);

workflow.next(); // implementation-roadmap
workflow.next(); // continuous-improvement
console.log(`\nStage: ${workflow.currentStage.label} — progress ${(workflow.progress * 100).toFixed(0)}% (${workflow.isComplete ? 'complete' : 'in progress'})`);
console.log('  -> "Start new assessment" would call workflow.restart(), looping back to Institution Information.');

console.log('\n--- Final assembled assessment record (excerpt) ---');
console.log(JSON.stringify({
  institution: assessment.institution.toJSON(),
  metadata: assessment.metadata.toJSON(),
  confidence: { label: assessment.interpretation.confidence.label, stars: assessment.interpretation.confidence.stars },
  readiness: assessment.interpretation.readiness,
  recommendation: assessment.interpretation.recommendation,
}, null, 2));
