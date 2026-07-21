/**
 * محلل حساسية للنسب والأوزان
 */
class SensitivityAnalyzer {
    constructor() {
        this.variationRange = 0.1; // ±10% تغيير
    }

    /**
     * تحليل حساسية الأوزان
     */
    analyzeSensitivity(baseResults, variation = 0.1) {
        const { criteria, rankings } = baseResults;
        const sensitivityResults = [];

        criteria.detailed.forEach((criterion, index) => {
            const variations = this.calculateCriterionVariation(criterion, index, criteria, rankings, variation);
            sensitivityResults.push(variations);
        });

        return {
            variations: sensitivityResults,
            mostSensitive: this.findMostSensitive(sensitivityResults),
            summary: this.generateSensitivitySummary(sensitivityResults)
        };
    }

    /**
     * حساب تغيير معيار محدد
     */
    calculateCriterionVariation(criterion, index, criteria, rankings, variation) {
        const originalWeight = parseFloat(criterion.weight);
        const variations = [];

        // تغيير +variation
        const increasedWeight = this.adjustWeight(originalWeight, variation);
        const increasedResults = this.simulateWeightChange(criteria, index, increasedWeight, rankings);
        
        // تغيير -variation
        const decreasedWeight = this.adjustWeight(originalWeight, -variation);
        const decreasedResults = this.simulateWeightChange(criteria, index, decreasedWeight, rankings);

        variations.push({
            criterion: criterion.name,
            originalWeight,
            change: '+10%',
            newWeight: increasedWeight,
            impact: this.calculateImpact(increasedResults, rankings),
            rankingChanges: this.compareRankings(increasedResults, rankings)
        });

        variations.push({
            criterion: criterion.name,
            originalWeight,
            change: '-10%',
            newWeight: decreasedWeight,
            impact: this.calculateImpact(decreasedResults, rankings),
            rankingChanges: this.compareRankings(decreasedResults, rankings)
        });

        return variations;
    }

    /**
     * تعديل الوزن بنسبة محددة
     */
    adjustWeight(weight, percentage) {
        return weight * (1 + percentage);
    }

    /**
     * محاكاة تغيير الوزن
     */
    simulateWeightChange(criteria, changedIndex, newWeight, originalRankings) {
        // إعادة حساب الأوزان مع التعديل
        const totalOtherWeights = criteria.detailed
            .filter((_, idx) => idx !== changedIndex)
            .reduce((sum, c) => sum + parseFloat(c.weight), 0);

        const scaleFactor = (1 - newWeight) / totalOtherWeights;

        const adjustedWeights = criteria.detailed.map((criterion, idx) => {
            if (idx === changedIndex) return newWeight;
            return parseFloat(criterion.weight) * scaleFactor;
        });

        // إعادة حساب النتائج (تبسيط)
        return this.recalculateRankings(adjustedWeights, originalRankings);
    }

    /**
     * إعادة حساب التصنيفات
     */
    recalculateRankings(newWeights, originalRankings) {
        // هنا سيتم إعادة الحساب بناءً على الأوزان الجديدة
        // حالياً نعيد نتائج مشابهة للتوضيح
        return originalRankings.detailed.map(item => ({
            ...item,
            weight: parseFloat(item.weight) * 0.95 // تأثير افتراضي
        }));
    }

    /**
     * حساب تأثير التغيير
     */
    calculateImpact(newResults, originalResults) {
        const originalTotal = originalResults.detailed.reduce((sum, item) => sum + parseFloat(item.weight), 0);
        const newTotal = newResults.reduce((sum, item) => sum + item.weight, 0);
        return Math.abs(newTotal - originalTotal) / originalTotal;
    }

    /**
     * مقارنة التصنيفات
     */
    compareRankings(newResults, originalResults) {
        return newResults.map((newItem, index) => {
            const originalItem = originalResults.detailed[index];
            return {
                alternative: newItem.name,
                originalRank: index + 1,
                newRank: newResults.sort((a, b) => b.weight - a.weight).findIndex(item => item.name === newItem.name) + 1,
                scoreChange: newItem.weight - parseFloat(originalItem.weight)
            };
        });
    }

    /**
     * إيجاد أكثر المعايير حساسية
     */
    findMostSensitive(sensitivityResults) {
        const sensitivities = sensitivityResults.flat().map(result => ({
            criterion: result.criterion,
            change: result.change,
            impact: result.impact
        }));

        return sensitivities.sort((a, b) => b.impact - a.impact)[0];
    }

    /**
     * ملخص الحساسية
     */
    generateSensitivitySummary(results) {
        const totalImpact = results.flat().reduce((sum, r) => sum + r.impact, 0);
        const averageImpact = totalImpact / results.flat().length;

        return {
            totalCriteria: results.length,
            averageImpact,
            stability: averageImpact < 0.1 ? 'عالية' : averageImpact < 0.2 ? 'متوسطة' : 'منخفضة',
            recommendations: this.generateRecommendations(results)
        };
    }

    /**
     * توليد توصيات بناءً على التحليل
     */
    generateRecommendations(results) {
        const highSensitivity = results.flat().filter(r => r.impact > 0.15);
        
        if (highSensitivity.length === 0) {
            return ['النموذج مستقر، لا توجد توصيات حرجة'];
        }

        const recommendations = ['يوصى بمراجعة المقارنات للمعايير التالية ذات الحساسية العالية:'];
        highSensitivity.forEach(r => {
            recommendations.push(`- ${r.criterion} (تأثير: ${(r.impact * 100).toFixed(1)}%)`);
        });

        return recommendations;
    }
}

export default SensitivityAnalyzer;
