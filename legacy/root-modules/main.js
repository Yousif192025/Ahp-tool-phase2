/**
 * ===================================================
 * 1. وحدات الدعم الأساسية المُحدَّثة (Stubs)
 * تم تحديث هذه الفئات لدعم الدوال الجديدة (مثل التحقق من صحة البيانات)
 * ===================================================
 */

// نموذج مُبسَّط لمُدقِّق البيانات
const DataValidator = {
    /** التحقق من جميع مدخلات AHP قبل الحساب */
    validateAllInputs(items, criteria, criteriaItemRank, criteriaRank) {
        console.log('DataValidator: Validating all AHP inputs...');
        const isValid = items?.length > 1 && criteria?.length > 1; // تحقق بسيط
        
        return {
            isValid: isValid,
            errors: isValid ? [] : [{ field: 'items/criteria', message: 'يجب أن يكون لديك بديلان ومعياران على الأقل.' }],
            warnings: [],
            inputSummary: { items: items.length, criteria: criteria.length }
        };
    }
};

// نموذج مُبسَّط لمُجمِّع بيانات النموذج
class FormDataCollector {
    collectAllData() {
        console.log('FormDataCollector: Collecting data from UI form...');
        // محاكاة لبيانات مُجمَّعة من واجهة المستخدم
        return {
            goal: 'اختيار أفضل بديل',
            items: ['البديل أ', 'البديل ب', 'البديل ج'],
            criteria: ['التكلفة', 'السرعة', 'الموثوقية'],
            criteriaItemRank: { 'التكلفة': [1, 3, 5], 'السرعة': [1/3, 1, 3] }, // أمثلة على المدخلات
            criteriaRank: [1, 1/2, 2],
            metadata: { user: 'User-123', project: 'Project-X' }
        };
    }

    validateCollectedData(formData) {
        console.log('FormDataCollector: Validating collected data structure...');
        const isValid = formData.items.length > 0 && formData.criteria.length > 0;
        return {
            isValid: isValid,
            errors: isValid ? [] : [{ message: 'لا يمكن أن تكون البدائل أو المعايير فارغة.' }],
            warnings: isValid ? [{ message: 'نقص في المقارنات الثنائية قد يؤدي لعدم دقة.' }] : []
        };
    }

    formatDataForDisplay(formData) {
        return {
            items: formData.items.join(', '),
            criteria: formData.criteria.join(', '),
            goal: formData.goal,
            rankingsCount: Object.keys(formData.criteriaItemRank || {}).length
        };
    }

    collectSpecificData(type) {
        const formData = this.collectAllData();
        if (type === 'items') return formData.items;
        if (type === 'criteria') return formData.criteria;
        return formData; // 'all'
    }
    
    debugCollection() {
        return 'Debug: UI elements not found or data structure is corrupt.';
    }

    getDataReport(formData) {
        return `تقرير البيانات: ${formData.items.length} بديل و ${formData.criteria.length} معيار.`;
    }

    exportToJSON(formData) {
        return JSON.stringify(formData, null, 2);
    }
}

// نموذج مُبسَّط لمُحرِّك AHP
class AHPEngine {
    importAndCalculate(items, criteria, criteriaItemRank, criteriaRank) {
        console.log('AHPEngine: Calculating AHP results with', items.length, 'items...');
        
        // محاكاة لنتيجة ناجحة
        const mockResults = {
            rawOutput: { criteriaMatrix: criteriaRank, itemMatrices: criteriaItemRank },
            criteria: {
                detailed: [
                    { name: 'التكلفة', weight: 0.45, score: 0.45, consistency: 0.04 },
                    { name: 'السرعة', weight: 0.35, score: 0.35, consistency: 0.01 },
                    { name: 'الموثوقية', weight: 0.20, score: 0.20, consistency: 0.02 }
                ].sort((a, b) => b.weight - a.weight),
            },
            rankings: {
                detailed: [
                    { name: 'البديل أ', score: 0.50, weight: 0.50 },
                    { name: 'البديل ب', score: 0.30, weight: 0.30 },
                    { name: 'البديل ج', score: 0.20, weight: 0.20 }
                ].sort((a, b) => b.score - a.score),
                final: 'البديل أ',
            }
        };

        const success = true; 
        if (success) {
            return { success: true, data: mockResults };
        } else {
            return { success: false, error: 'فشل في حساب AHP أو درجة التناسق عالية جداً.' };
        }
    }

    checkConsistency(rawOutput) {
        // يجب أن يحسب هذا نسبة التناسق (CR)
        return {
            overallCR: 0.03,
            isAcceptable: true,
            message: 'نسبة التناسق الكلية ممتازة.'
        };
    }
}

// نموذج مُبسَّط لمُحلِّل الحساسية
class SensitivityAnalyzer {
    analyzeSensitivity(ahpResults) {
        console.log('SensitivityAnalyzer: Performing sensitivity analysis...');
        return {
            criteriaImpact: 'الوزن الأهم هو التكلفة (تأثير عالي).',
            robustness: 'النتائج قوية ضد تغييرات صغيرة في الأوزان.',
            summary: {
                recommendations: [
                    'التركيز على تحسين درجة البديل (ج) في معيار التكلفة.',
                    'مراجعة المقارنات الثنائية لمعيار السرعة.'
                ]
            }
        };
    }
}

/**
 * ===================================================
 * 2. الفئة الرئيسية للتطبيق SFactsApp
 * ===================================================
 */

class SFactsApp {
    constructor() {
        this.ahpEngine = new AHPEngine();
        this.sensitivityAnalyzer = new SensitivityAnalyzer();
        this.dataValidator = DataValidator;
        this.formCollector = new FormDataCollector(); 
        this.currentResults = null;
        this.version = '2.0.0';
        console.log('✅ SFactsApp initialized with FormDataCollector');
    }

    /**
     * تشغيل الحساب الكامل مع التحقق من الصحة
     * @param {Array<string>} myItems قائمة البدائل
     * @param {Array<string>} myCriteria قائمة المعايير
     * @returns {Object} نتائج الحساب والتحليل الشاملة
     */
    runCalculation(myItems, myCriteria, myCriteriaItemRank, myCriteriaRank) {
        try {
            // التحقق من الصحة باستخدام DataValidator
            const validation = this.dataValidator.validateAllInputs(
                myItems, myCriteria, myCriteriaItemRank, myCriteriaRank
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
                myItems, validation.criteria, validation.criteriaItemRank, validation.criteriaRank // استخدام البيانات المُتحقَّق منها/المُنظَّفة
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
                    inputSummary: this.generateInputSummary(myItems, myCriteria)
                },
                timestamp: new Date().toISOString(),
                version: this.version
            };

        } catch (error) {
            console.error('Unhandled error in runCalculation:', error);
            return {
                success: false,
                error: 'خطأ غير متوقع في الحساب',
                details: error.message,
                stack: error.stack
            };
        }
    }

    /**
     * تشغيل الحساب من بيانات النموذج مباشرة
     * @returns {Object} نتائج الحساب أو رسالة خطأ.
     */
    runCalculationFromForm() {
        console.log('Running calculation from form data...');
        
        try {
            // جمع البيانات من النموذج
            const formData = this.formCollector.collectAllData();
            
            if (!formData) {
                return {
                    success: false,
                    error: 'فشل في جمع البيانات من النموذج',
                    details: 'تأكد من إدخال البيانات بشكل صحيح'
                };
            }
            
            console.log('Form data collected successfully:', {
                items: formData.items.length,
                criteria: formData.criteria.length
            });
            
            // التحقق من البيانات المجمعة
            const collectionValidation = this.formCollector.validateCollectedData(formData);
            
            if (!collectionValidation.isValid) {
                return {
                    success: false,
                    error: 'أخطاء في البيانات المجمعة',
                    validationErrors: collectionValidation.errors,
                    warnings: collectionValidation.warnings,
                    collectedData: this.formCollector.formatDataForDisplay(formData)
                };
            }
            
            // إجراء الحساب
            const calculationResult = this.runCalculation(
                formData.items,
                formData.criteria,
                formData.criteriaItemRank,
                formData.criteriaRank
            );
            
            // إضافة بيانات النموذج إلى النتائج
            if (calculationResult.success) {
                calculationResult.formData = {
                    goal: formData.goal,
                    metadata: formData.metadata,
                    formatted: this.formCollector.formatDataForDisplay(formData)
                };
            }
            
            return calculationResult;
            
        } catch (error) {
            console.error('Error in runCalculationFromForm:', error);
            return {
                success: false,
                error: 'خطأ في معالجة النموذج',
                details: error.message,
                debug: this.formCollector.debugCollection()
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
        if (!this.currentResults || !this.currentResults.data?.rawOutput) {
            console.warn('Cannot perform consistency analysis: No raw output in current results.');
            return null;
        }
        
        // يفترض أن AHPEngine.checkConsistency يقبل مصفوفات المقارنة
        return this.ahpEngine.checkConsistency(this.currentResults.data.rawOutput);
    }

    /**
     * التحقق من بيانات النموذج دون إجراء حساب
     */
    validateFormData() {
        try {
            const formData = this.formCollector.collectAllData();
            
            if (!formData) {
                return {
                    success: false,
                    error: 'لا توجد بيانات في النموذج',
                    collected: false
                };
            }
            
            const validation = this.formCollector.validateCollectedData(formData);
            const formatted = this.formCollector.formatDataForDisplay(formData);
            
            return {
                success: validation.isValid,
                data: formatted,
                validation: validation,
                report: this.formCollector.getDataReport(formData),
                jsonExport: this.formCollector.exportToJSON(formData)
            };
            
        } catch (error) {
            console.error('Error in validateFormData:', error);
            return {
                success: false,
                error: 'خطأ في التحقق من النموذج',
                details: error.message
            };
        }
    }

    /**
     * جمع بيانات محددة من النموذج
     */
    collectSpecificData(type = 'all') {
        return this.formCollector.collectSpecificData(type);
    }

    /**
     * تصدير النتائج بتنسيقات متعددة
     */
    exportResults(format = 'json') {
        if (!this.currentResults) {
            throw new Error('لا توجد نتائج للتصدير');
        }

        switch (format.toLowerCase()) {
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
                
            case 'full':
                // يتطلب جمع بيانات النموذج والتحقق منه
                const formData = this.formCollector.collectAllData();
                const validation = this.validateFormData();
                return JSON.stringify({
                    results: this.currentResults,
                    formData: formData,
                    validation: validation.validation,
                    timestamp: new Date().toISOString()
                }, null, 2);
                
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
        if (results.criteria?.detailed) {
            results.criteria.detailed.forEach((criterion, index) => {
                csv += `معيار,${criterion.name},${criterion.score.toFixed(4)},${index + 1}\n`;
            });
        }

        csv += '\n';

        // البدائل
        if (results.rankings?.detailed) {
            results.rankings.detailed.forEach((alternative, index) => {
                csv += `بديل,${alternative.name},${alternative.score.toFixed(4)},${index + 1}\n`;
            });
        }

        return csv;
    }

    /**
     * توليد ملخص تنفيذي
     */
    generateSummary(results) {
        const topCriteria = results.criteria?.detailed 
            ? results.criteria.detailed
                .sort((a, b) => b.weight - a.weight)
                .slice(0, 3)
            : [];

        const topAlternatives = results.rankings?.detailed
            ? results.rankings.detailed
                .sort((a, b) => b.score - a.score) // فرز البدائل حسب الدرجة (score)
                .slice(0, 3)
            : [];

        return {
            executiveSummary: {
                topCriteria: topCriteria.map(c => ({ 
                    name: c.name, 
                    score: c.score.toFixed(4),
                    influence: `${((c.weight || c.score) * 100).toFixed(1)}%` // استخدام الوزن أو الدرجة
                })),
                topAlternatives: topAlternatives.map((a, index) => ({ 
                    name: a.name, 
                    score: a.score.toFixed(4),
                    ranking: index + 1
                })),
                totalAlternatives: results.rankings?.detailed?.length || 0,
                totalCriteria: results.criteria?.detailed?.length || 0
            },
            generatedAt: new Date().toLocaleString('ar-SA'),
            version: this.version
        };
    }

    /**
     * تصدير تقرير كامل بصيغة نصية
     */
    exportFullReport() {
        if (!this.currentResults) {
             throw new Error('لا توجد نتائج حالية لإنشاء التقرير.');
        }

        const results = this.currentResults;
        const summary = this.generateSummary(results);
        const formData = this.formCollector.collectAllData();
        const validation = this.validateFormData();
        const consistency = this.getConsistencyAnalysis();
        
        const report = `
SFacts AHP Analysis Report - تقرير تحليل AHP
============================================
Generated: ${new Date().toLocaleString('ar-SA')}
Version: ${this.version}

1. EXECUTIVE SUMMARY - الملخص التنفيذي
-----------------------------------
- البديل الفائز: ${results.rankings.final || summary.executiveSummary.topAlternatives[0]?.name || 'غير محدد'}
- عدد البدائل: ${summary.executiveSummary.totalAlternatives}
- عدد المعايير: ${summary.executiveSummary.totalCriteria}

أهم 3 معايير (Criteria):
${summary.executiveSummary.topCriteria.map((c, i) => 
    `${i+1}. ${c.name}: درجة الأهمية ${c.score} (تأثير: ${c.influence})`
).join('\n')}

أفضل 3 بدائل (Alternatives):
${summary.executiveSummary.topAlternatives.map((a, i) => 
    `${i+1}. ${a.name}: النتيجة النهائية ${a.score}`
).join('\n')}

2. INPUT AND VALIDATION - المدخلات والتحقق
---------------------------------------
هدف المشروع: ${formData?.goal || 'غير محدد'}
حالة التحقق: ${validation.success ? '✅ البيانات صالحة' : '❌ توجد أخطاء/تحذيرات'}
أخطاء التحقق: ${validation.validation?.errors?.map(e => e.message).join(' | ') || 'لا توجد'}
تحذيرات التحقق: ${validation.validation?.warnings?.map(w => w.message).join(' | ') || 'لا توجد'}

3. CONSISTENCY ANALYSIS - تحليل التناسق
---------------------------------------
نسبة التناسق الكلية (CR): ${consistency?.overallCR?.toFixed(4) || 'غير متوفر'}
الحالة: ${consistency?.message || 'لا توجد بيانات خام متاحة للتحليل.'}

4. SENSITIVITY RECOMMENDATIONS - توصيات الحساسية
------------------------------------------------
${results.sensitivity?.summary?.recommendations?.map((r, i) => `${i+1}. ${r}`).join('\n') || 'لا توجد توصيات محددة.'}

---
Report generated by SFacts Enhanced AHP Tool (v${this.version})
        `;
        
        return report;
    }

    /**
     * إعادة تعيين التطبيق
     */
    reset() {
        this.ahpEngine = new AHPEngine();
        this.sensitivityAnalyzer = new SensitivityAnalyzer();
        this.formCollector = new FormDataCollector();
        this.currentResults = null;
        console.log('🔄 SFactsApp reset');
    }

    /**
     * الحصول على معلومات النظام
     */
    getSystemInfo() {
        return {
            version: this.version,
            modules: {
                ahpEngine: 'loaded',
                sensitivityAnalyzer: 'loaded',
                dataValidator: 'loaded',
                formDataCollector: 'loaded'
            },
            features: [
                'AHP Calculation',
                'Input Validation (DataValidator)',
                'Form Data Collection (FormDataCollector)',
                'Sensitivity Analysis',
                'Advanced Error Handling (Try/Catch)',
                'Consistency Analysis',
                'Multiple Export Formats (JSON, CSV, Summary, Full, Full Report)'
            ],
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * ===================================================
 * 3. التصدير للاستخدام العالمي والتوافق مع الإصدار القديم
 * ===================================================
 */

// الحفاظ على التوافق مع الإصدار القديم
const inputsToAhpResults = function(myItems, myCriteria, myCriteriaItemRank, myCriteriaRank) {
    const app = new SFactsApp();
    const results = app.runCalculation(myItems, myCriteria, myCriteriaItemRank, myCriteriaRank);
    
    if (results.success) {
        // إرجاع نتائج البيانات فقط للتوافق مع التوقيع القديم
        return results.data; 
    } else {
        console.error('خطأ في الحساب:', results.error, results.validationErrors);
        throw new Error(results.error);
    }
};

// التصدير للاستخدام العالمي (لبيئة المتصفح)
if (typeof window !== 'undefined') {
    window.SFactsApp = SFactsApp;
    window.runCalculation = inputsToAhpResults;
    window.advancedCalculation = (items, criteria, itemRank, criteriaRank) => {
        const app = new SFactsApp();
        return app.runCalculation(items, criteria, itemRank, criteriaRank);
    };
    window.calculateFromForm = () => {
        const app = new SFactsApp();
        return app.runCalculationFromForm();
    };
    window.validateCurrentForm = () => {
        const app = new SFactsApp();
        return app.validateFormData();
    };
    window.getFormData = (type = 'all') => {
        const app = new SFactsApp();
        return app.collectSpecificData(type);
    };
    window.exportAHPResults = (format = 'json') => {
        const app = new SFactsApp();
        return app.exportResults(format);
    };
    window.getAHPFullReport = () => {
        const app = new SFactsApp();
        return app.exportFullReport();
    };
    window.getAHPSystemInfo = () => {
        const app = new SFactsApp();
        return app.getSystemInfo();
    };
}

// التصدير للاستخدام في الوحدات الأخرى
export { AHPEngine, SensitivityAnalyzer, DataValidator, FormDataCollector };
export default SFactsApp;

console.log('✅ SFacts Enhanced 2.0.0 loaded successfully with form data collection!');
