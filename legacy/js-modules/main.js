import AHPEngine from './core/AHPEngine.js';
import SensitivityAnalyzer from './core/SensitivityAnalyzer.js';
import DataValidator from './utils/DataValidator.js';

/**
 * النقطة الرئيسية للتطبيق - تجميع كل الوحدات
 */
class SFactsApp {
    constructor() {
        this.ahpEngine = new AHPEngine();
        this.sensitivityAnalyzer = new SensitivityAnalyzer();
        this.dataValidator = DataValidator;
        this.currentResults = null;
        this.version = '2.0.0';
    }

    /**
     * تشغيل الحساب الكامل مع التحقق من الصحة
     */
    runCalculation(myItems, myCriteria, myCriteriaItemRank, myCriteriaRank) {
        try {
            // تنظيف المدخلات
            const cleanItems = this.dataValidator.sanitizeInput(myItems);
            const cleanCriteria = this.dataValidator.sanitizeInput(myCriteria);
            const cleanCriteriaItemRank = myCriteriaItemRank;
            const cleanCriteriaRank = myCriteriaRank;

            // التحقق من الصحة
            const validation = this.dataValidator.validateAllInputs(
                cleanItems, cleanCriteria, cleanCriteriaItemRank, cleanCriteriaRank
            );

            if (!validation.isValid) {
                return {
                    success: false,
                    error: 'أخطاء في البيانات المدخلة',
                    validationErrors: validation.errors,
                    warnings: validation.warnings
                };
            }

            // الحساب الأساسي
            const basicResults = this.ahpEngine.importAndCalculate(
                cleanItems, cleanCriteria, cleanCriteriaItemRank, cleanCriteriaRank
            );

            if (!basicResults.success) {
                return basicResults;
            }

            this.currentResults = basicResults.data;

            // تحليل الحساسية
            const sensitivityResults = this.sensitivityAnalyzer.analyzeSensitivity(
                basicResults.data
            );

            // النتائج الشاملة
            return {
                ...basicResults,
                sensitivity: sensitivityResults,
                validation: {
                    ...validation,
                    inputSummary: this.generateInputSummary(cleanItems, cleanCriteria)
                },
                timestamp: new Date().toISOString(),
                version: this.version
            };

        } catch (error) {
            return {
                success: false,
                error: 'خطأ غير متوقع في الحساب',
                details: error.message,
                stack: error.stack
            };
        }
    }

    /**
     * توليد ملخص للمدخلات
     */
    generateInputSummary(items, criteria) {
        return {
            itemsCount: items.length,
            criteriaCount: criteria.length,
            items: items,
            criteria: criteria,
            generatedAt: new Date().toLocaleString('ar-SA')
        };
    }

    /**
     * الحصول على النتائج الحالية
     */
    getCurrentResults() {
        return this.currentResults;
    }

    /**
     * تحليل تناسق إضافي
     */
    getConsistencyAnalysis() {
        if (!this.currentResults) {
            return null;
        }
        
        return this.ahpEngine.checkConsistency(this.currentResults.rawOutput);
    }

    /**
     * تصدير النتائج بتنسيقات متعددة
     */
    exportResults(format = 'json') {
        if (!this.currentResults) {
            throw new Error('لا توجد نتائج للتصدير');
        }

        switch (format) {
            case 'json':
                return JSON.stringify({
                    results: this.currentResults,
                    metadata: {
                        exportedAt: new Date().toISOString(),
                        version: this.version,
                        type: 'SFacts Analysis Results'
                    }
                }, null, 2);
                
            case 'csv':
                return this.convertToCSV(this.currentResults);
                
            case 'summary':
                return this.generateSummary(this.currentResults);
                
            default:
                return this.currentResults;
        }
    }

    /**
     * تحويل إلى CSV
     */
    convertToCSV(results) {
        let csv = 'النوع,الاسم,الوزن,الترتيب\n';

        // المعايير
        results.criteria.detailed.forEach((criterion, index) => {
            csv += `معيار,${criterion.name},${criterion.score},${index + 1}\n`;
        });

        csv += '\n';

        // البدائل
        results.rankings.detailed.forEach((alternative, index) => {
            csv += `بديل,${alternative.name},${alternative.score},${index + 1}\n`;
        });

        return csv;
    }

    /**
     * توليد ملخص تنفيذي
     */
    generateSummary(results) {
        const topCriteria = results.criteria.detailed
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 3);

        const topAlternatives = results.rankings.detailed
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 3);

        return {
            executiveSummary: {
                topCriteria: topCriteria.map(c => ({ 
                    name: c.name, 
                    score: c.score,
                    influence: `${(c.weight * 100).toFixed(1)}%`
                })),
                topAlternatives: topAlternatives.map(a => ({ 
                    name: a.name, 
                    score: a.score,
                    ranking: topAlternatives.findIndex(item => item.name === a.name) + 1
                })),
                totalAlternatives: results.rankings.detailed.length,
                totalCriteria: results.criteria.detailed.length
            },
            generatedAt: new Date().toLocaleString('ar-SA'),
            version: this.version
        };
    }

    /**
     * إعادة تعيين التطبيق
     */
    reset() {
        this.ahpEngine = new AHPEngine();
        this.sensitivityAnalyzer = new SensitivityAnalyzer();
        this.currentResults = null;
    }
}

// الحفاظ على التوافق مع الإصدار القديم
const inputsToAhpResults = function(myItems, myCriteria, myCriteriaItemRank, myCriteriaRank) {
    const app = new SFactsApp();
    const results = app.runCalculation(myItems, myCriteria, myCriteriaItemRank, myCriteriaRank);
    
    if (results.success) {
        return results.data;
    } else {
        console.error('خطأ في الحساب:', results.error);
        throw new Error(results.error);
    }
};

// التصدير للاستخدام العالمي
window.SFactsApp = SFactsApp;
window.runCalculation = inputsToAhpResults;
window.advancedCalculation = (items, criteria, itemRank, criteriaRank) => {
    const app = new SFactsApp();
    return app.runCalculation(items, criteria, itemRank, criteriaRank);
};

// التصدير للاستخدام في الوحدات الأخرى
export { AHPEngine, SensitivityAnalyzer, DataValidator };
export default SFactsApp;

// في ملف js/modules/main.js
import AHPEngine from './core/AHPEngine.js';
import SensitivityAnalyzer from './core/SensitivityAnalyzer.js';
import DataValidator from './utils/DataValidator.js';
import FormDataCollector from './formCollector.js'; // إضافة هذا السطر

class SFactsApp {
    constructor() {
        this.ahpEngine = new AHPEngine();
        this.sensitivityAnalyzer = new SensitivityAnalyzer();
        this.dataValidator = DataValidator;
        this.formCollector = new FormDataCollector(); // إضافة هذا
        this.currentResults = null;
        this.version = '2.0.0';
    }

    // تحديث دالة runCalculation
    runCalculationFromForm() {
        try {
            // جمع البيانات من النموذج
            const formData = this.formCollector.collectAllData();
            
            if (!formData) {
                return {
                    success: false,
                    error: 'فشل في جمع البيانات من النموذج'
                };
            }
            
            // التحقق من الصحة
            const validation = this.formCollector.validateCollectedData(formData);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: 'أخطاء في البيانات المدخلة',
                    validationErrors: validation.errors
                };
            }
            
            // تنفيذ الحساب
            return this.runCalculation(
                formData.items,
                formData.criteria,
                formData.criteriaItemRank,
                formData.criteriaRank
            );
            
        } catch (error) {
            return {
                success: false,
                error: 'خطأ في معالجة النموذج',
                details: error.message
            };
        }
    }
    
    // باقي الكود كما هو...
}

// إضافة دالة مساعدة للاستخدام المباشر
window.collectAHPFormData = function() {
    const collector = new FormDataCollector();
    return collector.collectAllData();
};

window.validateAHPFormData = function() {
    const collector = new FormDataCollector();
    const data = collector.collectAllData();
    return collector.validateCollectedData(data);
};
