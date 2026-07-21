import AHP from 'ahp';
import zipWith from 'lodash-es/zipWith';
import unzip from 'lodash-es/unzip';

/**
 * محرك AHP محسّن مع دعم إضافي وتحليل متقدم
 */
class AHPEngine {
    constructor() {
        this.ahpContext = new AHP();
        this.consistencyThreshold = 0.1;
        this.results = null;
    }

    /**
     * استيراد البيانات وحساب النتائج
     */
    importAndCalculate(myItems, myCriteria, myCriteriaItemRank, myCriteriaRank) {
        try {
            this.validateInputs(myItems, myCriteria, myCriteriaItemRank, myCriteriaRank);
            
            this.ahpContext.import({
                items: myItems,
                criteria: myCriteria,
                criteriaItemRank: myCriteriaItemRank,
                criteriaRank: myCriteriaRank,
            });

            const output = this.ahpContext.debug();
            this.results = this.processOutput(output, myItems, myCriteria);
            
            return {
                success: true,
                data: this.results,
                consistency: this.checkConsistency(output),
                metadata: this.generateMetadata(output)
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                details: this.getErrorDetails(error)
            };
        }
    }

    /**
     * تحقق من صحة المدخلات
     */
    validateInputs(items, criteria, criteriaItemRank, criteriaRank) {
        if (!items || items.length === 0) {
            throw new Error('يجب إدخال عناصر للمقارنة');
        }
        
        if (!criteria || criteria.length === 0) {
            throw new Error('يجب إدخال معايير للمقارنة');
        }

        if (criteriaItemRank.length !== criteria.length) {
            throw new Error('عدد مصفوفات تقييم العناصر لا يتطابق مع عدد المعايير');
        }

        // تحقق إضافي من تناسق المصفوفات
        this.validateMatricesConsistency(criteriaItemRank, criteriaRank);
    }

    /**
     * تحقق من تناسق المصفوفات
     */
    validateMatricesConsistency(criteriaItemRank, criteriaRank) {
        criteriaItemRank.forEach((matrix, index) => {
            if (!this.isSquareMatrix(matrix)) {
                throw new Error(`مصفوفة تقييم العناصر للمعيار ${index + 1} ليست مصفوفة مربعة`);
            }
        });

        if (!this.isSquareMatrix(criteriaRank)) {
            throw new Error('مصفوفة تقييم المعايير ليست مصفوفة مربعة');
        }
    }

    /**
     * تحقق إذا كانت المصفوفة مربعة
     */
    isSquareMatrix(matrix) {
        const rows = matrix.length;
        return rows > 0 && matrix.every(row => row.length === rows);
    }

    /**
     * معالجة المخرجات بشكل منظم
     */
    processOutput(output, items, criteria) {
        const criteriaWeights = output.criteriaRankMetaMap.weightedVector;
        const alternativesTotalScores = output.rankedScores;

        // حساب مصفوفة الأولويات
        const alternativesPriorityMatrix = this.calculatePriorityMatrix(output, criteriaWeights);
        
        // تنسيق النتائج
        const criteriasWithScores = zipWith(criteria, criteriaWeights, (criterion, score) => ({
            name: criterion,
            score: Number.parseFloat(score).toFixed(3),
            weight: score
        }));

        const alternativesWithScores = zipWith(items, alternativesTotalScores, (alternative, score) => ({
            name: alternative,
            score: Number.parseFloat(score).toFixed(3),
            weight: score
        }));

        return {
            criteria: {
                labels: criteriasWithScores.map(c => c.name),
                series: [criteriaWeights],
                detailed: criteriasWithScores
            },
            rankings: {
                labels: alternativesWithScores.map(a => a.name),
                series: unzip(alternativesPriorityMatrix),
                detailed: alternativesWithScores
            },
            priorityMatrix: alternativesPriorityMatrix,
            rawOutput: output
        };
    }

    /**
     * حساب مصفوفة الأولويات
     */
    calculatePriorityMatrix(output, criteriaWeights) {
        return output.rankingMatrix.map((alternativeScores, alternativeIndex) => {
            return alternativeScores.map((alternativeCriteriaScore, criteriaIndex) => {
                return alternativeCriteriaScore * criteriaWeights[criteriaIndex];
            }).reverse(); // نعكس للترتيب الصحيح
        });
    }

    /**
     * فحص تناسق النتائج
     */
    checkConsistency(output) {
        const consistencyRatio = output.criteriaRankMetaMap.consistencyRatio;
        
        return {
            ratio: consistencyRatio,
            isAcceptable: consistencyRatio < this.consistencyThreshold,
            threshold: this.consistencyThreshold,
            message: this.getConsistencyMessage(consistencyRatio)
        };
    }

    /**
     * رسائل تناسق توضيحية
     */
    getConsistencyMessage(ratio) {
        if (ratio < 0.1) return 'التناسق ممتاز';
        if (ratio < 0.2) return 'التناسق مقبول';
        return 'التناسق ضعيف - يرجى مراجعة المقارنات';
    }

    /**
     * إنشاء بيانات وصفية إضافية
     */
    generateMetadata(output) {
        return {
            calculationDate: new Date().toISOString(),
            criteriaCount: output.criteriaRankMetaMap.weightedVector.length,
            alternativesCount: output.rankedScores.length,
            consistencyRatio: output.criteriaRankMetaMap.consistencyRatio
        };
    }

    /**
     * تفاصيل الأخطاء
     */
    getErrorDetails(error) {
        return {
            type: error.name,
            stack: error.stack,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * الحصول على النتائج المفصلة
     */
    getDetailedResults() {
        if (!this.results) {
            throw new Error('لم يتم إجراء أي حسابات بعد');
        }
        return this.results;
    }
}

export default AHPEngine;
