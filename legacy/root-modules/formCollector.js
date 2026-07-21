// js/modules/formCollector.js
/**
 * مجموعة أدوات لجمع البيانات من نموذج AHP
 * @class FormDataCollector
 */
class FormDataCollector {
    constructor() {
        this.maxItems = 8;
        this.maxCriteria = 8;
        this.comparisonValues = {
            '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9,
            '1/2': 0.5, '1/3': 0.333, '1/4': 0.25, '1/5': 0.2, '1/6': 0.166, '1/7': 0.142, '1/8': 0.125, '1/9': 0.111,
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
        };
    }

    /**
     * جمع جميع البيانات من النموذج
     * @returns {Object|null} البيانات المجمعة أو null في حالة الفشل
     */
    collectAllData() {
        try {
            console.log('Starting form data collection...');
            
            const items = this.collectItems();
            const criteria = this.collectCriteria();
            const goal = this.collectGoal();
            
            console.log(`Collected ${items.length} items, ${criteria.length} criteria`);
            
            // إذا لم يكن هناك بيانات كافية
            if (items.length < 1 || criteria.length < 1) {
                console.warn('Insufficient data: need at least 1 item and 1 criterion');
                return null;
            }
            
            const criteriaRank = this.collectCriteriaRankMatrix(criteria.length);
            const criteriaItemRank = this.collectCriteriaItemRankMatrices(criteria.length, items.length);
            
            const result = {
                items: items,
                criteria: criteria,
                criteriaRank: criteriaRank,
                criteriaItemRank: criteriaItemRank,
                goal: goal,
                timestamp: new Date().toISOString(),
                metadata: {
                    itemsCount: items.length,
                    criteriaCount: criteria.length,
                    collectionMethod: 'form'
                }
            };
            
            console.log('Form data collection completed successfully', result.metadata);
            return result;
            
        } catch (error) {
            console.error('Error collecting form data:', error);
            return null;
        }
    }

    /**
     * جمع العناصر (البدائل) من حقول الإدخال
     * @returns {Array} مصفوفة العناصر
     */
    collectItems() {
        const items = [];
        for (let i = 0; i < this.maxItems; i++) {
            const itemInput = document.getElementById('item' + i);
            if (itemInput && itemInput.value && itemInput.value.trim() !== '') {
                items.push(itemInput.value.trim());
            }
        }
        return items;
    }

    /**
     * جمع المعايير من حقول الإدخال
     * @returns {Array} مصفوفة المعايير
     */
    collectCriteria() {
        const criteria = [];
        for (let i = 0; i < this.maxCriteria; i++) {
            const criteriaInput = document.getElementById('criteria' + i);
            if (criteriaInput && criteriaInput.value && criteriaInput.value.trim() !== '') {
                criteria.push(criteriaInput.value.trim());
            }
        }
        return criteria;
    }

    /**
     * جمع نص الهدف
     * @returns {string} نص الهدف
     */
    collectGoal() {
        const goalInput = document.getElementById('goal');
        return goalInput && goalInput.value ? goalInput.value.trim() : '';
    }

    /**
     * جمع مصفوفة تقييم المعايير
     * @param {number} criteriaCount عدد المعايير
     * @returns {Array} مصفوفة تقييم المعايير
     */
    collectCriteriaRankMatrix(criteriaCount) {
        console.log(`Collecting criteria rank matrix for ${criteriaCount} criteria`);
        
        if (criteriaCount < 1) return [[1]];
        
        const matrix = this.createEmptyMatrix(criteriaCount);
        
        for (let i = 0; i < criteriaCount; i++) {
            for (let j = 0; j < criteriaCount; j++) {
                if (i === j) {
                    matrix[i][j] = 1; // القطر الرئيسي دائماً 1
                } else if (j > i) {
                    // الجزء العلوي من المصفوفة (المستخدم يدخله)
                    const inputId = `criteria${i}v${j}`;
                    const input = document.getElementById(inputId);
                    let value = 1; // القيمة الافتراضية
                    
                    if (input && input.value && input.value.trim() !== '') {
                        value = this.parseComparisonValue(input.value);
                    }
                    
                    matrix[i][j] = value;
                    matrix[j][i] = this.calculateReciprocal(value);
                    
                    console.log(`Criteria[${i}][${j}] = ${value}, reciprocal = ${matrix[j][i]}`);
                }
            }
        }
        
        console.log('Criteria rank matrix collected:', matrix);
        return matrix;
    }

    /**
     * جمع مصفوفات تقييم العناصر لكل معيار
     * @param {number} criteriaCount عدد المعايير
     * @param {number} itemsCount عدد العناصر
     * @returns {Array} مصفوفات تقييم العناصر
     */
    collectCriteriaItemRankMatrices(criteriaCount, itemsCount) {
        console.log(`Collecting item rank matrices for ${criteriaCount} criteria and ${itemsCount} items`);
        
        if (itemsCount < 1) return [this.createEmptyMatrix(1)];
        
        const allMatrices = [];
        
        for (let c = 0; c < criteriaCount; c++) {
            const matrix = this.createEmptyMatrix(itemsCount);
            
            for (let i = 0; i < itemsCount; i++) {
                for (let j = 0; j < itemsCount; j++) {
                    if (i === j) {
                        matrix[i][j] = 1; // القطر الرئيسي
                    } else if (j > i) {
                        // الجزء العلوي من المصفوفة
                        const inputId = `c${c}_item${i}v${j}`;
                        const input = document.getElementById(inputId);
                        let value = 1; // القيمة الافتراضية
                        
                        if (input && input.value && input.value.trim() !== '') {
                            value = this.parseComparisonValue(input.value);
                        }
                        
                        matrix[i][j] = value;
                        matrix[j][i] = this.calculateReciprocal(value);
                        
                        if (c === 0 && i < 2 && j < 2) {
                            console.log(`Item[${i}][${j}] for criteria ${c} = ${value}`);
                        }
                    }
                }
            }
            
            allMatrices.push(matrix);
            console.log(`Matrix for criteria ${c} collected`);
        }
        
        console.log(`Total ${allMatrices.length} item matrices collected`);
        return allMatrices;
    }

    /**
     * إنشاء مصفوفة فارغة بقيم 1
     * @param {number} size حجم المصفوفة
     * @returns {Array} مصفوفة مربعة مملوءة بقيم 1
     */
    createEmptyMatrix(size) {
        const matrix = [];
        for (let i = 0; i < size; i++) {
            matrix[i] = [];
            for (let j = 0; j < size; j++) {
                matrix[i][j] = 1;
            }
        }
        return matrix;
    }

    /**
     * تحويل قيمة المقارنة النصية إلى رقم
     * @param {string} value القيمة النصية
     * @returns {number} القيمة الرقمية
     */
    parseComparisonValue(value) {
        if (!value) return 1;
        
        const trimmedValue = value.toString().trim();
        
        // التحقق من القيم المعروفة مسبقاً
        if (this.comparisonValues[trimmedValue] !== undefined) {
            return this.comparisonValues[trimmedValue];
        }
        
        // معالجة الكسور (مثل "1/3")
        if (trimmedValue.includes('/')) {
            const parts = trimmedValue.split('/');
            if (parts.length === 2) {
                const numerator = parseFloat(parts[0].trim());
                const denominator = parseFloat(parts[1].trim());
                if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                    return numerator / denominator;
                }
            }
        }
        
        // معالجة النسب المئوية (مثل "50%")
        if (trimmedValue.includes('%')) {
            const num = parseFloat(trimmedValue.replace('%', '').trim());
            if (!isNaN(num)) {
                return num / 100;
            }
        }
        
        // محاولة التحويل المباشر إلى رقم
        const num = parseFloat(trimmedValue);
        if (!isNaN(num) && num > 0) {
            return num;
        }
        
        // القيمة الافتراضية إذا فشل كل شيء
        console.warn(`Unable to parse comparison value: "${value}", using default 1`);
        return 1;
    }

    /**
     * حساب المقلوب للقيمة (1/value)
     * @param {number} value القيمة الأصلية
     * @returns {number} المقلوب
     */
    calculateReciprocal(value) {
        if (value === 0) return 0;
        const reciprocal = 1 / value;
        // تقريب لتجنب أخطاء الفاصلة العائمة
        return Math.round(reciprocal * 10000) / 10000;
    }

    /**
     * التحقق من صحة البيانات المجمعة
     * @param {Object} data البيانات المجمعة
     * @returns {Object} نتيجة التحقق
     */
    validateCollectedData(data) {
        const errors = [];
        const warnings = [];
        
        if (!data) {
            errors.push('No data collected');
            return { isValid: false, errors: errors, warnings: warnings };
        }
        
        // التحقق من العناصر
        if (!data.items || !Array.isArray(data.items)) {
            errors.push('Items data is invalid');
        } else if (data.items.length < 2) {
            warnings.push('Only one item provided. At least two items are recommended for meaningful comparison.');
        }
        
        // التحقق من المعايير
        if (!data.criteria || !Array.isArray(data.criteria)) {
            errors.push('Criteria data is invalid');
        } else if (data.criteria.length < 2) {
            warnings.push('Only one criterion provided. At least two criteria are recommended for meaningful comparison.');
        }
        
        // التحقق من مصفوفة المعايير
        if (!data.criteriaRank || !Array.isArray(data.criteriaRank)) {
            errors.push('Criteria rank matrix is missing');
        } else {
            const matrixErrors = this.validateMatrix(data.criteriaRank, 'criteria');
            errors.push(...matrixErrors);
        }
        
        // التحقق من مصفوفات العناصر
        if (!data.criteriaItemRank || !Array.isArray(data.criteriaItemRank)) {
            errors.push('Item rank matrices are missing');
        } else if (data.criteriaItemRank.length !== data.criteria.length) {
            errors.push(`Number of item matrices (${data.criteriaItemRank.length}) doesn't match number of criteria (${data.criteria.length})`);
        } else {
            data.criteriaItemRank.forEach((matrix, index) => {
                const matrixErrors = this.validateMatrix(matrix, `items for criterion "${data.criteria[index] || index}"`);
                errors.push(...matrixErrors);
            });
        }
        
        // التحقق من التماثل في المصفوفات
        if (data.criteriaRank) {
            const symmetryErrors = this.checkMatrixSymmetry(data.criteriaRank, 'criteria');
            warnings.push(...symmetryErrors);
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            summary: {
                itemsCount: data.items ? data.items.length : 0,
                criteriaCount: data.criteria ? data.criteria.length : 0,
                hasGoal: !!data.goal,
                matricesValid: errors.filter(e => e.includes('matrix')).length === 0
            }
        };
    }

    /**
     * التحقق من صحة مصفوفة
     * @param {Array} matrix المصفوفة
     * @param {string} name اسم المصفوفة
     * @returns {Array} قائمة الأخطاء
     */
    validateMatrix(matrix, name) {
        const errors = [];
        
        if (!matrix || !Array.isArray(matrix)) {
            errors.push(`${name} matrix is not an array`);
            return errors;
        }
        
        const size = matrix.length;
        
        // التحقق من أن المصفوفة ليست فارغة
        if (size === 0) {
            errors.push(`${name} matrix is empty`);
            return errors;
        }
        
        // التحقق من أن المصفوفة مربعة
        for (let i = 0; i < size; i++) {
            if (!Array.isArray(matrix[i])) {
                errors.push(`${name} matrix row ${i} is not an array`);
                break;
            }
            if (matrix[i].length !== size) {
                errors.push(`${name} matrix is not square (row ${i} has ${matrix[i].length} columns, expected ${size})`);
                break;
            }
        }
        
        // التحقق من القيم القطرية
        for (let i = 0; i < size; i++) {
            if (matrix[i][i] !== 1) {
                errors.push(`${name} matrix diagonal at [${i}][${i}] should be 1, got ${matrix[i][i]}`);
                break;
            }
        }
        
        return errors;
    }

    /**
     * التحقق من تماثل المصفوفة
     * @param {Array} matrix المصفوفة
     * @param {string} name اسم المصفوفة
     * @returns {Array} قائمة التحذيرات
     */
    checkMatrixSymmetry(matrix, name) {
        const warnings = [];
        const tolerance = 0.001;
        
        if (!matrix || !Array.isArray(matrix)) return warnings;
        
        const size = matrix.length;
        for (let i = 0; i < size; i++) {
            for (let j = i + 1; j < size; j++) {
                const expectedReciprocal = this.calculateReciprocal(matrix[i][j]);
                const actualValue = matrix[j][i];
                
                if (Math.abs(actualValue - expectedReciprocal) > tolerance) {
                    warnings.push(`${name} matrix asymmetry at [${i}][${j}]=${matrix[i][j]} vs [${j}][${i}]=${actualValue} (expected ${expectedReciprocal})`);
                }
            }
        }
        
        return warnings;
    }

    /**
     * تنسيق البيانات للعرض
     * @param {Object} data البيانات
     * @returns {Object} البيانات المنسقة
     */
    formatDataForDisplay(data) {
        if (!data) return null;
        
        return {
            summary: {
                goal: data.goal || 'Not specified',
                items: data.items ? data.items.length : 0,
                criteria: data.criteria ? data.criteria.length : 0,
                collectedAt: new Date().toLocaleString(),
                timestamp: data.timestamp
            },
            details: {
                items: data.items || [],
                criteria: data.criteria || [],
                matrices: {
                    criteriaRank: data.criteriaRank ? 
                        `${data.criteriaRank.length}x${data.criteriaRank[0]?.length || 0}` : 'N/A',
                    itemMatrices: data.criteriaItemRank ? 
                        `${data.criteriaItemRank.length} matrices` : 'N/A'
                }
            }
        };
    }

    /**
     * الحصول على تقرير مفصل عن البيانات المجمعة
     * @param {Object} data البيانات
     * @returns {string} التقرير النصي
     */
    getDataReport(data) {
        if (!data) return 'No data available';
        
        const validation = this.validateCollectedData(data);
        const formatted = this.formatDataForDisplay(data);
        
        let report = 'AHP DATA COLLECTION REPORT\n';
        report += '===========================\n\n';
        
        report += 'SUMMARY\n';
        report += '-------\n';
        report += `Goal: ${formatted.summary.goal}\n`;
        report += `Items: ${formatted.summary.items}\n`;
        report += `Criteria: ${formatted.summary.criteria}\n`;
        report += `Collected: ${formatted.summary.collectedAt}\n\n`;
        
        report += 'VALIDATION\n';
        report += '----------\n';
        report += `Status: ${validation.isValid ? '✓ VALID' : '✗ INVALID'}\n`;
        
        if (validation.errors.length > 0) {
            report += `Errors: ${validation.errors.length}\n`;
            validation.errors.forEach((error, index) => {
                report += `  ${index + 1}. ${error}\n`;
            });
        } else {
            report += 'Errors: None\n';
        }
        
        if (validation.warnings.length > 0) {
            report += `Warnings: ${validation.warnings.length}\n`;
            validation.warnings.forEach((warning, index) => {
                report += `  ${index + 1}. ${warning}\n`;
            });
        } else {
            report += 'Warnings: None\n';
        }
        
        report += '\nDETAILS\n';
        report += '-------\n';
        report += `Items: ${formatted.details.items.join(', ') || 'None'}\n`;
        report += `Criteria: ${formatted.details.criteria.join(', ') || 'None'}\n`;
        report += `Criteria Matrix: ${formatted.details.matrices.criteriaRank}\n`;
        report += `Item Matrices: ${formatted.details.matrices.itemMatrices}\n`;
        
        return report;
    }

    /**
     * تصدير البيانات كـ JSON
     * @param {Object} data البيانات
     * @returns {string} البيانات بصيغة JSON
     */
    exportToJSON(data) {
        return JSON.stringify({
            data: data,
            validation: this.validateCollectedData(data),
            formatted: this.formatDataForDisplay(data),
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        }, null, 2);
    }

    /**
     * تجميع بيانات معينة من النموذج (للاستخدام الفوري)
     * @param {string} type نوع البيانات ('items', 'criteria', 'all')
     * @returns {Object} البيانات المطلوبة
     */
    collectSpecificData(type = 'all') {
        switch (type.toLowerCase()) {
            case 'items':
                return {
                    items: this.collectItems(),
                    count: this.collectItems().length
                };
                
            case 'criteria':
                return {
                    criteria: this.collectCriteria(),
                    count: this.collectCriteria().length
                };
                
            case 'goal':
                return {
                    goal: this.collectGoal()
                };
                
            case 'matrices':
                const items = this.collectItems();
                const criteria = this.collectCriteria();
                return {
                    criteriaRank: this.collectCriteriaRankMatrix(criteria.length),
                    criteriaItemRank: this.collectCriteriaItemRankMatrices(criteria.length, items.length)
                };
                
            default:
                return this.collectAllData();
        }
    }

    /**
     * مساعدة في تصحيح أخطاء جمع البيانات
     * @returns {Object} معلومات التصحيح
     */
    debugCollection() {
        console.group('Form Data Collector Debug');
        
        const items = this.collectItems();
        const criteria = this.collectCriteria();
        const goal = this.collectGoal();
        
        console.log('Items found:', items);
        console.log('Criteria found:', criteria);
        console.log('Goal:', goal);
        
        // اختبار عناصر واجهة المستخدم
        const testInputs = [
            'item0', 'criteria0', 'criteria0v1', 'c0_item0v1'
        ];
        
        testInputs.forEach(id => {
            const element = document.getElementById(id);
            console.log(`Element ${id}:`, element ? 'Found' : 'Not found', element);
        });
        
        const data = this.collectAllData();
        console.log('Collected data:', data);
        
        if (data) {
            const validation = this.validateCollectedData(data);
            console.log('Validation:', validation);
        }
        
        console.groupEnd();
        
        return {
            items: items,
            criteria: criteria,
            goal: goal,
            data: data,
            testInputs: testInputs.map(id => ({
                id: id,
                exists: !!document.getElementById(id),
                value: document.getElementById(id)?.value || 'N/A'
            }))
        };
    }
}

// التصدير للاستخدام في الوحدات الأخرى
export default FormDataCollector;

// التصدير للاستخدام العالمي (إذا لم يكن ES6 module)
if (typeof window !== 'undefined') {
    window.FormDataCollector = FormDataCollector;
    console.log('FormDataCollector loaded globally');
}
