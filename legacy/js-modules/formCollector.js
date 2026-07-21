// js/modules/formCollector.js
/**
 * مجموعة أدوات لجمع البيانات من نموذج AHP
 */
class FormDataCollector {
    constructor() {
        this.maxItems = 8;
        this.maxCriteria = 8;
    }

    /**
     * جمع جميع البيانات من النموذج
     */
    collectAllData() {
        try {
            const items = this.collectItems();
            const criteria = this.collectCriteria();
            const criteriaRank = this.collectCriteriaRankMatrix(criteria.length);
            const criteriaItemRank = this.collectCriteriaItemRankMatrices(criteria.length, items.length);
            
            return {
                items: items,
                criteria: criteria,
                criteriaRank: criteriaRank,
                criteriaItemRank: criteriaItemRank,
                goal: this.collectGoal(),
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Error collecting form data:', error);
            return null;
        }
    }

    /**
     * جمع العناصر (البدائل)
     */
    collectItems() {
        const items = [];
        for (let i = 0; i < this.maxItems; i++) {
            const itemInput = document.getElementById('item' + i);
            if (itemInput && itemInput.value.trim()) {
                items.push(itemInput.value.trim());
            }
        }
        return items;
    }

    /**
     * جمع المعايير
     */
    collectCriteria() {
        const criteria = [];
        for (let i = 0; i < this.maxCriteria; i++) {
            const criteriaInput = document.getElementById('criteria' + i);
            if (criteriaInput && criteriaInput.value.trim()) {
                criteria.push(criteriaInput.value.trim());
            }
        }
        return criteria;
    }

    /**
     * جمع الهدف
     */
    collectGoal() {
        const goalInput = document.getElementById('goal');
        return goalInput ? goalInput.value.trim() : '';
    }

    /**
     * جمع مصفوفة تقييم المعايير
     */
    collectCriteriaRankMatrix(criteriaCount) {
        if (criteriaCount < 2) return [[1]];
        
        const matrix = this.createEmptyMatrix(criteriaCount);
        
        for (let i = 0; i < criteriaCount; i++) {
            for (let j = 0; j < criteriaCount; j++) {
                if (i === j) {
                    matrix[i][j] = 1; // القطر الرئيسي
                } else if (j > i) {
                    // الجزء العلوي من المصفوفة
                    const inputId = `criteria${i}v${j}`;
                    const input = document.getElementById(inputId);
                    if (input && input.value) {
                        const value = this.parseComparisonValue(input.value);
                        matrix[i][j] = value;
                        matrix[j][i] = 1 / value; // القيمة المتماثلة
                    } else {
                        matrix[i][j] = 1; // قيمة افتراضية
                        matrix[j][i] = 1;
                    }
                }
            }
        }
        
        return matrix;
    }

    /**
     * جمع مصفوفات تقييم العناصر لكل معيار
     */
    collectCriteriaItemRankMatrices(criteriaCount, itemsCount) {
        if (itemsCount < 2) return [this.createEmptyMatrix(itemsCount)];
        
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
                        if (input && input.value) {
                            const value = this.parseComparisonValue(input.value);
                            matrix[i][j] = value;
                            matrix[j][i] = 1 / value; // القيمة المتماثلة
                        } else {
                            matrix[i][j] = 1; // قيمة افتراضية
                            matrix[j][i] = 1;
                        }
                    }
                }
            }
            
            allMatrices.push(matrix);
        }
        
        return allMatrices;
    }

    /**
     * إنشاء مصفوفة فارغة
     */
    createEmptyMatrix(size) {
        return Array(size).fill().map(() => Array(size).fill(1));
    }

    /**
     * تحويل قيمة المقارنة إلى رقم
     */
    parseComparisonValue(value) {
        if (!value) return 1;
        
        // تحويل الكسور (مثل 1/3)
        if (value.includes('/')) {
            const parts = value.split('/');
            if (parts.length === 2) {
                const numerator = parseFloat(parts[0]);
                const denominator = parseFloat(parts[1]);
                if (!isNaN(numerator) && !isNaN(denominator) && denominator !== 0) {
                    return numerator / denominator;
                }
            }
        }
        
        // تحويل النسبة المئوية
        if (value.includes('%')) {
            const num = parseFloat(value.replace('%', ''));
            if (!isNaN(num)) {
                return num / 100;
            }
        }
        
        // تحويل الرقم العادي
        const num = parseFloat(value);
        return isNaN(num) ? 1 : num;
    }

    /**
     * التحقق من صحة البيانات المجمعة
     */
    validateCollectedData(data) {
        const errors = [];
        
        if (!data.items || data.items.length < 2) {
            errors.push('يجب إدخال عنصرين على الأقل');
        }
        
        if (!data.criteria || data.criteria.length < 2) {
            errors.push('يجب إدخال معيارين على الأقل');
        }
        
        // التحقق من مصفوفة المعايير
        if (data.criteriaRank) {
            const matrixErrors = this.validateMatrix(data.criteriaRank, 'معايير');
            errors.push(...matrixErrors);
        }
        
        // التحقق من مصفوفات العناصر
        if (data.criteriaItemRank) {
            data.criteriaItemRank.forEach((matrix, index) => {
                const matrixErrors = this.validateMatrix(matrix, `عناصر المعيار ${data.criteria[index]}`);
                errors.push(...matrixErrors);
            });
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors,
            data: data
        };
    }

    /**
     * التحقق من صحة مصفوفة
     */
    validateMatrix(matrix, name) {
        const errors = [];
        
        if (!matrix || !Array.isArray(matrix)) {
            errors.push(`مصفوفة ${name} غير صالحة`);
            return errors;
        }
        
        const size = matrix.length;
        
        // التحقق من أن المصفوفة مربعة
        for (let i = 0; i < size; i++) {
            if (!Array.isArray(matrix[i]) || matrix[i].length !== size) {
                errors.push(`مصفوفة ${name} ليست مربعة`);
                break;
            }
        }
        
        // التحقق من القيم القطرية
        for (let i = 0; i < size; i++) {
            if (matrix[i][i] !== 1) {
                errors.push(`القيم القطرية في مصفوفة ${name} يجب أن تكون 1`);
                break;
            }
        }
        
        return errors;
    }

    /**
     * تنسيق البيانات للعرض
     */
    formatDataForDisplay(data) {
        return {
            summary: {
                itemsCount: data.items.length,
                criteriaCount: data.criteria.length,
                goal: data.goal || 'غير محدد',
                collectedAt: new Date().toLocaleString()
            },
            items: data.items,
            criteria: data.criteria,
            matrices: {
                criteriaRankSize: data.criteriaRank ? `${data.criteriaRank.length}x${data.criteriaRank[0]?.length || 0}` : '0x0',
                criteriaItemRankCount: data.criteriaItemRank ? data.criteriaItemRank.length : 0
            }
        };
    }
}

export default FormDataCollector;
