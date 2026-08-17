/**
 * Module Name: comparison-service.js
 * Purpose: Runs independent MCDM methods on the same AMSESHI assessment
 *          hierarchy and compares their normalized outputs.
 *
 * The service neither changes AHP mathematics nor blends AHP and FAHP
 * calculations. It invokes each registered method independently, then compares
 * their already-normalized criteria weights, alternative scores, and ranks.
 */

import { METHOD_IDS, mcdmMethodRegistry } from '../../mcdm/method-registry.js';

function rankEntries(labels, scores) {
  return labels
    .map((label, index) => ({ label, score: scores[index] }))
    .sort((left, right) => right.score - left.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

function indexByLabel(entries) {
  return new Map(entries.map((entry) => [entry.label, entry]));
}

function percentageDifference(reference, comparison) {
  if (Math.abs(reference) < 1e-12) return comparison === 0 ? 0 : null;
  return ((comparison - reference) / Math.abs(reference)) * 100;
}

/**
 * Classifies ranking stability without claiming a dissertation-specific
 * threshold. The rule is transparent and can be revised once the researcher
 * approves a different interpretation framework.
 */
export function classifyRankingStability(ahpRanking, fahpRanking) {
  const ahpLabels = ahpRanking.map((entry) => entry.label);
  const fahpLabels = fahpRanking.map((entry) => entry.label);

  if (ahpLabels.every((label, index) => label === fahpLabels[index])) {
    return {
      status: 'Stable',
      explanation: 'AHP and FAHP produce the same complete alternative order.',
    };
  }

  if (ahpLabels[0] === fahpLabels[0]) {
    return {
      status: 'Partially Changed',
      explanation: 'The top-ranked alternative is unchanged, but one or more lower ranks differ.',
    };
  }

  return {
    status: 'Significantly Changed',
    explanation: 'The top-ranked alternative differs between AHP and FAHP.',
  };
}

function calculateFuzzySpreadSummary(fahpResult) {
  const fuzzyCriteriaWeights = fahpResult.criteria.fuzzyWeights || [];
  const spreads = fuzzyCriteriaWeights.map((weight) => weight.upper - weight.lower);
  const meanSpread = spreads.length
    ? spreads.reduce((sum, spread) => sum + spread, 0) / spreads.length
    : 0;

  return {
    meanCriterionTFNSpread: meanSpread,
    criterionTFNSpreads: spreads,
    explanation: 'This descriptive spread summarizes the uncertainty interval retained in FAHP criterion weights before centroid defuzzification; it is not a separate sensitivity simulation.',
  };
}

/**
 * Runs one registered method on a common AMSESHI decision structure.
 */
export function runDecisionMethod({ methodId, items, criteria, alternativeMatrices, criteriaMatrix }) {
  return mcdmMethodRegistry.calculate(methodId, {
    items,
    criteria,
    alternativeMatrices,
    criteriaMatrix,
  });
}

/**
 * Performs an AHP and FAHP evaluation independently from the same criteria,
 * alternatives, and pairwise matrices, then creates aligned comparison rows.
 */
export function compareAHPAndFAHP({ items, criteria, alternativeMatrices, criteriaMatrix }) {
  const ahp = runDecisionMethod({
    methodId: METHOD_IDS.AHP,
    items,
    criteria,
    alternativeMatrices,
    criteriaMatrix,
  });
  const fahp = runDecisionMethod({
    methodId: METHOD_IDS.FAHP,
    items,
    criteria,
    alternativeMatrices,
    criteriaMatrix,
  });

  const ahpCriteriaRanking = rankEntries(ahp.criteria.labels, ahp.criteria.weights);
  const fahpCriteriaRanking = rankEntries(fahp.criteria.labels, fahp.criteria.weights);
  const ahpCriteriaByLabel = indexByLabel(ahpCriteriaRanking);
  const fahpCriteriaByLabel = indexByLabel(fahpCriteriaRanking);

  const criterionComparison = criteria.map((criterion) => {
    const ahpEntry = ahpCriteriaByLabel.get(criterion);
    const fahpEntry = fahpCriteriaByLabel.get(criterion);
    const difference = fahpEntry.score - ahpEntry.score;
    return {
      criterion,
      ahpWeight: ahpEntry.score,
      fahpWeight: fahpEntry.score,
      difference,
      percentageDifference: percentageDifference(ahpEntry.score, fahpEntry.score),
      ahpRank: ahpEntry.rank,
      fahpRank: fahpEntry.rank,
      rankChange: fahpEntry.rank - ahpEntry.rank,
    };
  });

  const ahpAlternativeRanking = rankEntries(ahp.alternatives.labels, ahp.alternatives.scores);
  const fahpAlternativeRanking = rankEntries(fahp.alternatives.labels, fahp.alternatives.scores);
  const ahpAlternativeByLabel = indexByLabel(ahpAlternativeRanking);
  const fahpAlternativeByLabel = indexByLabel(fahpAlternativeRanking);

  const alternativeComparison = items.map((alternative) => {
    const ahpEntry = ahpAlternativeByLabel.get(alternative);
    const fahpEntry = fahpAlternativeByLabel.get(alternative);
    const difference = fahpEntry.score - ahpEntry.score;
    return {
      alternative,
      ahpScore: ahpEntry.score,
      fahpScore: fahpEntry.score,
      difference,
      percentageDifference: percentageDifference(ahpEntry.score, fahpEntry.score),
      ahpRank: ahpEntry.rank,
      fahpRank: fahpEntry.rank,
      rankChange: fahpEntry.rank - ahpEntry.rank,
    };
  });

  return {
    input: {
      goal: null,
      criteria: [...criteria],
      alternatives: [...items],
    },
    results: { ahp, fahp },
    criterionComparison,
    alternativeComparison,
    rankings: {
      ahp: ahpAlternativeRanking,
      fahp: fahpAlternativeRanking,
      stability: classifyRankingStability(ahpAlternativeRanking, fahpAlternativeRanking),
    },
    uncertaintySensitivity: calculateFuzzySpreadSummary(fahp),
    metadata: {
      comparedMethods: [METHOD_IDS.AHP, METHOD_IDS.FAHP],
      scoreBasis: 'Both methods return normalized weights and normalized final alternative scores.',
      timestamp: new Date().toISOString(),
    },
  };
}

