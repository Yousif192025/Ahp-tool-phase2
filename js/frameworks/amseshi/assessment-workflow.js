/**
 * Module Name: assessment-workflow.js
 * Purpose: Encodes the AMSESHI assessment lifecycle (Institution
 *   Information -> ... -> Continuous Improvement) as a sequence of named
 *   stages, and tracks navigation/progress through them for the UI wizard.
 * Responsibilities:
 *   - Enumerate the ordered lifecycle stages, grouped into phases
 *   - Track which stage the current assessment session is in
 *   - Provide next/previous/goTo navigation and progress reporting
 *   - Contain NO calculation logic and NO DOM access
 * Dependencies:
 *   - None
 * Author: Yousif Hashim
 * Version: 1.0.0
 * Research Project: AMSESHI Academic Decision Support System (ADSS) — PhD Dissertation, Al Neelain University
 * Last Updated: 2026-07-22
 * -----------------------------------------------------------------------
 * STRICT SCOPE: this module only tracks WHERE the user is in the
 * assessment process. It never computes a weight, score, or consistency
 * ratio, and it never touches the DOM — js/ui/wizard.js is responsible
 * for rendering each stage.
 * -----------------------------------------------------------------------
 */

/**
 * The 13-stage AMSESHI assessment lifecycle, grouped into 4 phases.
 * See docs/diagrams/ for the corresponding lifecycle diagram.
 */
export const LIFECYCLE_STAGES = [
  { id: 'institution-information', label: 'Institution Information', phase: 'Setup' },
  { id: 'assessment-configuration', label: 'Assessment Configuration', phase: 'Setup' },
  { id: 'framework-definition', label: 'Framework Definition', phase: 'Setup' },
  { id: 'success-factor-evaluation', label: 'Success Factor Evaluation', phase: 'Evaluation' },
  { id: 'pairwise-comparison', label: 'Pairwise Comparison', phase: 'Evaluation' },
  { id: 'decision-analysis', label: 'Decision Analysis (AHP)', phase: 'Evaluation' },
  { id: 'consistency-verification', label: 'Consistency Verification', phase: 'Evaluation' },
  { id: 'priority-analysis', label: 'Priority Analysis', phase: 'Interpretation' },
  { id: 'institutional-readiness-assessment', label: 'Institutional Readiness Assessment', phase: 'Interpretation' },
  { id: 'interpretation', label: 'Interpretation', phase: 'Interpretation' },
  { id: 'recommendations', label: 'Recommendations', phase: 'Action' },
  { id: 'implementation-roadmap', label: 'Implementation Roadmap', phase: 'Action' },
  { id: 'continuous-improvement', label: 'Continuous Improvement', phase: 'Action' },
];

/**
 * Tracks navigation state through the AMSESHI assessment lifecycle.
 * Pure state machine — no calculation, no DOM.
 */
export class AssessmentWorkflow {
  constructor(stages = LIFECYCLE_STAGES) {
    if (!Array.isArray(stages) || stages.length === 0) {
      throw new Error('AssessmentWorkflow requires a non-empty stage list.');
    }
    this.stages = stages;
    this.currentIndex = 0;
  }

  get currentStage() {
    return this.stages[this.currentIndex];
  }

  /** Progress through the lifecycle, from 0 (just started) to 1 (final stage reached). */
  get progress() {
    return (this.currentIndex + 1) / this.stages.length;
  }

  get isComplete() {
    return this.currentIndex === this.stages.length - 1;
  }

  next() {
    if (this.currentIndex < this.stages.length - 1) {
      this.currentIndex += 1;
    }
    return this.currentStage;
  }

  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex -= 1;
    }
    return this.currentStage;
  }

  /** Jump directly to a named stage, e.g. for the wizard's step navigation. */
  goTo(stageId) {
    const idx = this.stages.findIndex(s => s.id === stageId);
    if (idx === -1) {
      throw new Error(`Unknown lifecycle stage: "${stageId}"`);
    }
    this.currentIndex = idx;
    return this.currentStage;
  }

  /**
   * Implements the "Continuous Improvement" loop: returns the workflow
   * to the first stage, for starting a new assessment cycle on the same
   * institution. Does not clear any prior assessment record — that is
   * the caller's (js/application/assessment-service.js) responsibility.
   */
  restart() {
    this.currentIndex = 0;
    return this.currentStage;
  }
}
