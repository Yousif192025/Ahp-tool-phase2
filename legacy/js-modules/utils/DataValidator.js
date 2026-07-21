/**
 * أداة التحقق من صحة البيانات المدخلة
 */
class DataValidator {
    /**
     * التحقق من صحة مصفوفة المقارنة
     */
    static validateComparisonMatrix(matrix, matrixName = 'المصفوفة') {
        const errors = [];

        if (!Array.isArray(matrix)) {
            errors.push(`${matrixName} يجب أن تكون مصفوفة`);
            return errors;
        }

        // التحقق من أن المصفوفة مربعة
        const size = matrix.length;
        for (let i = 0; i < size; i++) {
            if (!Array.isArray(matrix[i]) || matrix[i].length !== size) {
                errors.push(`${matrixName} يجب أن تكون مصفوفة مربعة`);
                break;
            }
        }

        // التحقق من القيم القطرية (يجب أن تكون 1)
        for (let i = 0; i < size; i++) {
            if (matrix[i][i] !== 1) {
                errors.push(`القيم القطرية في ${matrixName} يجب أن تكون 1`);
                break;
            }
        }

        // التحقق من التماثل
        for (let i = 0; i < size; i++) {
            for (let j = i + 1; j < size; j++) {
                if (Math.abs(matrix[i][j] - 1 / matrix[j][i]) > 0.001) {
                    errors.push(`${matrixName} غير متماثلة في الموضع [${i},${j}]`);
                    break;
                }
            }
            if (errors.length > 0) break;
        }

        return errors;
    }

    /**
     * التحقق من نطاق القيم
     */
    static validateValueRange(value, min = 0.111, max = 9) {
        if (value < min || value > max) {
            return `القيمة ${value} خارج النطاق المسموح [${min}, ${max}]`;
        }
        return null;
    }

    /**
     * التحقق من أسماء العناصر والمعايير
     */
    static validateNames(names, type = 'العناصر') {
        const errors = [];

        if (!names || names.length === 0) {
            errors.push(`يجب إدخال ${type}`);
            return errors;
        }

        names.forEach((name, index) => {
            if (!name || name.trim() === '') {
                errors.push(`${type} رقم ${index + 1} لا يمكن أن يكون فارغاً`);
            }
            if (name.length > 100) {
                errors.push(`${type} "${name}" طويل جداً (الحد الأقصى 100 حرف)`);
            }
        });

        // التحقق من التكرار
        const uniqueNames = new Set(names.map(name => name.toLowerCase().trim()));
        if (uniqueNames.size !== names.length) {
            errors.push(`يوجد تكرار في أسماء ${type}`);
        }

        return errors;
    }

    /**
     * التحقق الشامل لجميع المدخلات
     */
    static validateAllInputs(items, criteria, criteriaItemRank, criteriaRank) {
        const errors = [];

        // التحقق من الأسماء
        errors.push(...this.validateNames(items, 'العناصر'));
        errors.push(...this.validateNames(criteria, 'المعايير'));

        // التحقق من مصفوفة المعايير
        const criteriaMatrixErrors = this.validateComparisonMatrix(criteriaRank, 'مصفوفة المعايير');
        errors.push(...criteriaMatrixErrors);

        // التحقق من مصفوفات العناصر
        if (criteriaItemRank.length !== criteria.length) {
            errors.push('عدد مصفوفات تقييم العناصر لا يتطابق مع عدد المعايير');
        } else {
            criteriaItemRank.forEach((matrix, index) => {
                const matrixErrors = this.validateComparisonMatrix(
                    matrix, 
                    `مصفوفة العناصر للمعيار ${criteria[index]}`
                );
                errors.push(...matrixErrors.map(error => `${error} (المعيار: ${criteria[index]})`));
            });
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            warnings: this.generateWarnings(items, criteria, criteriaItemRank, criteriaRank)
        };
    }

    /**
     * توليد تحذيرات (ليست أخطاء)
     */
    static generateWarnings(items, criteria, criteriaItemRank, criteriaRank) {
        const warnings = [];

        if (items.length < 2) {
            warnings.push('يوصى بإدخال أكثر من عنصر واحد للمقارنة');
        }

        if (criteria.length < 2) {
            warnings.push('يوصى بإدخال أكثر من معيار واحد للمقارنة');
        }

        if (items.length > 10) {
            warnings.push('عدد العناصر كبير قد يؤثر على دقة المقارنات');
        }

        if (criteria.length > 8) {
            warnings.push('عدد المعايير كبير قد يصعب عملية المقارنة');
        }

        return warnings;
    }

    /**
     * تنظيف وتنسيق البيانات المدخلة
     */
    static sanitizeInput(data) {
        if (typeof data === 'string') {
            return data.trim().replace(/\s+/g, ' ');
        }
        
        if (Array.isArray(data)) {
            return data.map(item => this.sanitizeInput(item));
        }
        
        return data;
    }
}

export default DataValidator;
