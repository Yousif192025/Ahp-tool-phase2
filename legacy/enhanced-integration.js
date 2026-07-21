// js/enhanced-integration.js
/**
 * ملف التكامل بين النظام المحسن والواجهة الحالية
 * هذا الملف يربط جميع المكونات مع واجهة المستخدم
 */

// الانتظار حتى يتم تحميل الصفحة بالكامل
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting SFacts Enhanced Integration...');
    
    // الانتظار قليلاً لضمان تحميل جميع المكتبات
    setTimeout(initializeEnhancedSystem, 500);
});

/**
 * تهيئة النظام المحسن
 */
function initializeEnhancedSystem() {
    console.log('Initializing enhanced system...');
    
    try {
        // 1. التحقق من توفر النظام المحسن
        if (!window.SFactsApp) {
            console.warn('SFactsApp not found, enhanced features disabled');
            showEnhancedStatus('Enhanced features not available', 'warning');
            return;
        }
        
        console.log('✅ SFactsApp loaded successfully');
        
        // 2. إضافة واجهة المستخدم المحسنة
        addEnhancedUIElements();
        
        // 3. تحسين زر الحساب الأصلي
        enhanceOriginalCalculateButton();
        
        // 4. إعداد مستمعي الأحداث
        setupEventListeners();
        
        // 5. إظهار حالة النظام
        showEnhancedStatus('Enhanced system ready', 'success');
        
        console.log('✅ Enhanced system initialized successfully');
        
    } catch (error) {
        console.error('Error initializing enhanced system:', error);
        showEnhancedStatus('Initialization failed: ' + error.message, 'error');
    }
}

/**
 * إضافة عناصر واجهة المستخدم المحسنة
 */
function addEnhancedUIElements() {
    console.log('Adding enhanced UI elements...');
    
    // 1. إضافة زر الحساب المتقدم بجانب الزر الأصلي
    addAdvancedCalculateButton();
    
    // 2. إضافة لوحة التحكم في الشريط الجانبي
    addEnhancedSidebarPanel();
    
    // 3. إضافة إشعارات التحسين
    addEnhancedNotifications();
    
    // 4. إضافة قسم النتائج المحسنة
    addEnhancedResultsSection();
}

/**
 * إضافة زر الحساب المتقدم
 */
function addAdvancedCalculateButton() {
    const originalBtn = document.getElementById('calcbtn');
    if (!originalBtn) {
        console.warn('Original calculate button not found');
        return;
    }
    
    // التحقق إذا كان الزر موجوداً بالفعل
    if (document.getElementById('enhanced-calc-btn')) {
        return;
    }
    
    // إنشاء زر الحساب المتقدم
    const advancedBtn = document.createElement('button');
    advancedBtn.id = 'enhanced-calc-btn';
    advancedBtn.textContent = 'Calculate (Enhanced)';
    advancedBtn.className = 'enhanced-button';
    
    // إضافة الأنماط
    advancedBtn.style.cssText = `
        margin-left: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
    `;
    
    // تأثيرات التمرير
    advancedBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
    });
    
    advancedBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
    });
    
    // إضافة مستمع الأحداث
    advancedBtn.addEventListener('click', performEnhancedCalculation);
    
    // إدراج الزر بعد الزر الأصلي
    originalBtn.parentNode.insertBefore(advancedBtn, originalBtn.nextSibling);
    
    console.log('✅ Advanced calculate button added');
}

/**
 * إضافة لوحة التحكم في الشريط الجانبي
 */
function addEnhancedSidebarPanel() {
    const sidebar = document.querySelector('aside');
    if (!sidebar) {
        console.warn('Sidebar not found');
        return;
    }
    
    // التحقق إذا كانت اللوحة موجودة بالفعل
    if (document.getElementById('enhanced-control-panel')) {
        return;
    }
    
    // إنشاء لوحة التحكم
    const panel = document.createElement('div');
    panel.id = 'enhanced-control-panel';
    panel.className = 'enhanced-panel';
    
    panel.innerHTML = `
        <div class="panel-header">
            <h3>🔄 Enhanced Features</h3>
        </div>
        <div class="panel-body">
            <div class="button-group">
                <button id="btn-validate-form" class="panel-btn">
                    <span class="btn-icon">✓</span>
                    Validate Form
                </button>
                <button id="btn-sensitivity" class="panel-btn">
                    <span class="btn-icon">📊</span>
                    Sensitivity
                </button>
                <button id="btn-export" class="panel-btn">
                    <span class="btn-icon">💾</span>
                    Export
                </button>
                <button id="btn-debug" class="panel-btn">
                    <span class="btn-icon">🐛</span>
                    Debug
                </button>
            </div>
            
            <div class="status-section">
                <h4>System Status</h4>
                <div id="system-status" class="status-indicator ready">
                    <span class="status-dot"></span>
                    <span class="status-text">Ready</span>
                </div>
                <div id="data-status" class="status-indicator">
                    <span class="status-dot"></span>
                    <span class="status-text">No data collected</span>
                </div>
            </div>
            
            <div class="quick-actions">
                <h4>Quick Actions</h4>
                <button id="btn-quick-test" class="quick-btn">Test Data</button>
                <button id="btn-reset-enhanced" class="quick-btn">Reset</button>
            </div>
        </div>
    `;
    
    // إضافة الأنماط
    const style = document.createElement('style');
    style.textContent = `
        .enhanced-panel {
            background: white;
            border-radius: 10px;
            padding: 15px;
            margin-top: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border: 1px solid #e0e0e0;
        }
        
        .panel-header h3 {
            margin: 0 0 15px 0;
            color: #333;
            font-size: 16px;
            display: flex;
            align-items: center;
        }
        
        .panel-header h3:before {
            content: "🚀";
            margin-right: 8px;
        }
        
        .button-group {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .panel-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
        }
        
        .panel-btn:hover {
            background: #e9ecef;
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .btn-icon {
            margin-right: 5px;
            font-size: 16px;
        }
        
        .status-section {
            margin: 15px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 6px;
        }
        
        .status-section h4 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #666;
        }
        
        .status-indicator {
            display: flex;
            align-items: center;
            margin: 5px 0;
            padding: 5px;
            border-radius: 4px;
        }
        
        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            margin-right: 8px;
            background: #6c757d;
        }
        
        .status-indicator.ready .status-dot {
            background: #28a745;
        }
        
        .status-indicator.error .status-dot {
            background: #dc3545;
        }
        
        .status-indicator.warning .status-dot {
            background: #ffc107;
        }
        
        .status-text {
            font-size: 13px;
            color: #333;
        }
        
        .quick-actions {
            margin-top: 15px;
        }
        
        .quick-actions h4 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #666;
        }
        
        .quick-btn {
            padding: 6px 12px;
            margin-right: 8px;
            background: #6c757d;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            transition: background 0.2s ease;
        }
        
        .quick-btn:hover {
            background: #545b62;
        }
        
        @media (max-width: 768px) {
            .button-group {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    document.head.appendChild(style);
    sidebar.appendChild(panel);
    
    console.log('✅ Enhanced control panel added');
}

/**
 * إضافة إشعارات التحسين
 */
function addEnhancedNotifications() {
    // إنشاء عنصر الإشعارات
    const notificationContainer = document.createElement('div');
    notificationContainer.id = 'enhanced-notifications';
    notificationContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 300px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    
    document.body.appendChild(notificationContainer);
}

/**
 * إضافة قسم النتائج المحسنة
 */
function addEnhancedResultsSection() {
    const resultsSection = document.getElementById('results');
    if (!resultsSection) {
        console.warn('Results section not found');
        return;
    }
    
    // التحقق إذا كان القسم موجوداً بالفعل
    if (document.getElementById('enhanced-results-container')) {
        return;
    }
    
    const container = document.createElement('div');
    container.id = 'enhanced-results-container';
    container.style.cssText = `
        display: none;
        margin-top: 30px;
        padding: 25px;
        background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
        border-radius: 12px;
        border: 2px solid #667eea30;
        animation: fadeIn 0.5s ease;
    `;
    
    container.innerHTML = `
        <div class="enhanced-header">
            <h2 style="margin-top: 0; color: #333;">
                <span style="color: #667eea;">🚀</span> Enhanced Analysis Results
            </h2>
            <button id="close-enhanced-results" style="
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #666;
            ">×</button>
        </div>
        
        <div class="results-tabs" style="
            display: flex;
            border-bottom: 2px solid #e0e0e0;
            margin-bottom: 20px;
        ">
            <button class="tab-btn active" data-tab="sensitivity">Sensitivity Analysis</button>
            <button class="tab-btn" data-tab="validation">Validation</button>
            <button class="tab-btn" data-tab="export">Export</button>
            <button class="tab-btn" data-tab="debug">Debug Info</button>
        </div>
        
        <div id="tab-sensitivity" class="tab-content active">
            <div id="sensitivity-content">
                <p style="color: #666; font-style: italic;">
                    Run enhanced calculation to see sensitivity analysis...
                </p>
            </div>
        </div>
        
        <div id="tab-validation" class="tab-content">
            <div id="validation-content">
                <p style="color: #666; font-style: italic;">
                    Click "Validate Form" to check input data...
                </p>
            </div>
        </div>
        
        <div id="tab-export" class="tab-content">
            <div id="export-content">
                <div class="export-options" style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 10px;
                    margin-bottom: 20px;
                ">
                    <button class="export-btn" data-format="json">Export JSON</button>
                    <button class="export-btn" data-format="csv">Export CSV</button>
                    <button class="export-btn" data-format="summary">Executive Summary</button>
                    <button class="export-btn" data-format="full">Full Report</button>
                </div>
                <div id="export-preview" style="
                    background: white;
                    padding: 15px;
                    border-radius: 6px;
                    border: 1px solid #ddd;
                    max-height: 200px;
                    overflow-y: auto;
                    font-family: monospace;
                    font-size: 12px;
                    white-space: pre-wrap;
                "></div>
            </div>
        </div>
        
        <div id="tab-debug" class="tab-content">
            <div id="debug-content">
                <button id="btn-run-debug" style="
                    padding: 10px 20px;
                    background: #17a2b8;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-bottom: 15px;
                ">Run Debug Analysis</button>
                <div id="debug-output" style="
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 12px;
                    white-space: pre-wrap;
                    max-height: 300px;
                    overflow-y: auto;
                "></div>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .enhanced-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
            }
            
            .tab-btn {
                padding: 10px 20px;
                background: none;
                border: none;
                border-bottom: 3px solid transparent;
                cursor: pointer;
                color: #666;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            
            .tab-btn:hover {
                color: #667eea;
            }
            
            .tab-btn.active {
                color: #667eea;
                border-bottom-color: #667eea;
                background: #667eea10;
            }
            
            .tab-content {
                display: none;
                animation: fadeIn 0.3s ease;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .export-btn {
                padding: 10px 15px;
                background: #28a745;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: background 0.3s ease;
            }
            
            .export-btn:hover {
                background: #218838;
            }
        </style>
    `;
    
    resultsSection.appendChild(container);
    
    // إضافة الأنيميشن
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    `;
    document.head.appendChild(animationStyle);
    
    console.log('✅ Enhanced results section added');
}

/**
 * تحسين زر الحساب الأصلي
 */
function enhanceOriginalCalculateButton() {
    const originalBtn = document.getElementById('calcbtn');
    if (!originalBtn) return;
    
    // نسخ المستمع الأصلي
    const originalClick = originalBtn.onclick;
    
    // استبداله بمستمع محسن
    originalBtn.onclick = function(e) {
        // تشغيل المستمع الأصلي أولاً
        if (originalClick) {
            originalClick.call(this, e);
        }
        
        // ثم تشغيل النظام المحسن
        setTimeout(() => {
            try {
                if (window.calculateFromForm) {
                    const results = window.calculateFromForm();
                    if (results && results.success) {
                        showEnhancedNotification('Enhanced analysis available!', 'success');
                        displayEnhancedResults(results);
                    }
                }
            } catch (error) {
                console.warn('Enhanced analysis failed:', error);
            }
        }, 100);
    };
    
    // إضافة تأثيرات
    originalBtn.style.transition = 'all 0.3s ease';
    originalBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
    });
    
    originalBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
}

/**
 * إعداد مستمعي الأحداث
 */
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // زر التحقق من النموذج
    document.getElementById('btn-validate-form')?.addEventListener('click', validateFormData);
    
    // زر تحليل الحساسية
    document.getElementById('btn-sensitivity')?.addEventListener('click', showSensitivityAnalysis);
    
    // زر التصدير
    document.getElementById('btn-export')?.addEventListener('click', showExportOptions);
    
    // زر التصحيح
    document.getElementById('btn-debug')?.addEventListener('click', runDebugAnalysis);
    
    // اختبار سريع
    document.getElementById('btn-quick-test')?.addEventListener('click', fillTestData);
    
    // إعادة تعيين
    document.getElementById('btn-reset-enhanced')?.addEventListener('click', resetEnhancedSystem);
    
    // إغلاق النتائج
    document.getElementById('close-enhanced-results')?.addEventListener('click', function() {
        document.getElementById('enhanced-results-container').style.display = 'none';
    });
    
    // التبويبات
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // أزرار التصدير
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const format = this.getAttribute('data-format');
            exportResults(format);
        });
    });
    
    // تصحيح
    document.getElementById('btn-run-debug')?.addEventListener('click', runDebugAnalysis);
    
    console.log('✅ Event listeners set up');
}

/**
 * تنفيذ الحساب المحسن
 */
async function performEnhancedCalculation() {
    console.log('Performing enhanced calculation...');
    
    try {
        if (!window.calculateFromForm) {
            throw new Error('Enhanced calculation not available');
        }
        
        showEnhancedNotification('Running enhanced analysis...', 'info');
        updateSystemStatus('Calculating...', 'warning');
        
        // تنفيذ الحساب
        const results = await Promise.resolve(window.calculateFromForm());
        
        if (results.success) {
            showEnhancedNotification('Analysis complete!', 'success');
            updateSystemStatus('Ready', 'success');
            updateDataStatus(`${results.data?.criteria?.detailed?.length || 0} criteria, ${results.data?.rankings?.detailed?.length || 0} alternatives`);
            
            // عرض النتائج
            displayEnhancedResults(results);
            
            // حفظ النتائج للاستخدام لاحقاً
            window.lastEnhancedResults = results;
            
        } else {
            showEnhancedNotification('Calculation failed: ' + results.error, 'error');
            updateSystemStatus('Error', 'error');
            
            // عرض الأخطاء
            if (results.validationErrors) {
                showValidationErrors(results.validationErrors);
            }
        }
        
    } catch (error) {
        console.error('Enhanced calculation error:', error);
        showEnhancedNotification('Error: ' + error.message, 'error');
        updateSystemStatus('Error', 'error');
    }
}

/**
 * التحقق من بيانات النموذج
 */
function validateFormData() {
    console.log('Validating form data...');
    
    try {
        if (!window.validateCurrentForm) {
            throw new Error('Validation not available');
        }
        
        showEnhancedNotification('Validating form data...', 'info');
        
        const validation = window.validateCurrentForm();
        
        if (validation.success) {
            showEnhancedNotification('Form data is valid!', 'success');
            updateDataStatus('Valid ✓');
            
            // عرض تفاصيل التحقق
            displayValidationResults(validation);
            
            // التبديل إلى تبويب التحقق
            switchTab('validation');
            
        } else {
            showEnhancedNotification('Validation failed', 'error');
            updateDataStatus('Invalid ✗');
            
            // عرض الأخطاء
            displayValidationResults(validation);
        }
        
    } catch (error) {
        console.error('Validation error:', error);
        showEnhancedNotification('Validation error: ' + error.message, 'error');
    }
}

/**
 * عرض تحليل الحساسية
 */
function showSensitivityAnalysis() {
    if (!window.lastEnhancedResults) {
        showEnhancedNotification('Please run enhanced calculation first', 'warning');
        return;
    }
    
    switchTab('sensitivity');
    displaySensitivityResults(window.lastEnhancedResults);
}

/**
 * عرض خيارات التصدير
 */
function showExportOptions() {
    switchTab('export');
    
    // عرض معاينة للتصدير إذا كانت هناك نتائج
    if (window.lastEnhancedResults) {
        const preview = document.getElementById('export-preview');
        preview.textContent = JSON.stringify(window.lastEnhancedResults, null, 2).substring(0, 500) + '...';
    }
}

/**
 * تصدير النتائج
 */
function exportResults(format) {
    try {
        if (!window.exportAHPResults) {
            throw new Error('Export not available');
        }
        
        let content, filename, mimeType;
        
        switch (format) {
            case 'json':
                content = window.exportAHPResults('json');
                filename = 'ahp-analysis.json';
                mimeType = 'application/json';
                break;
                
            case 'csv':
                content = window.exportAHPResults('csv');
                filename = 'ahp-analysis.csv';
                mimeType = 'text/csv';
                break;
                
            case 'summary':
                content = window.getAHPFullReport ? window.getAHPFullReport() : 'No report available';
                filename = 'ahp-executive-summary.txt';
                mimeType = 'text/plain';
                break;
                
            case 'full':
                content = window.exportAHPResults('full');
                filename = 'ahp-full-report.json';
                mimeType = 'application/json';
                break;
                
            default:
                throw new Error('Unknown export format: ' + format);
        }
        
        // تنزيل الملف
        downloadFile(content, filename, mimeType);
        showEnhancedNotification(`Exported as ${format.toUpperCase()}`, 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showEnhancedNotification('Export failed: ' + error.message, 'error');
    }
}

/**
 * تشغيل تحليل التصحيح
 */
function runDebugAnalysis() {
    console.log('Running debug analysis...');
    
    try {
        const debugOutput = document.getElementById('debug-output');
        if (!debugOutput) return;
        
        let debugInfo = '=== SFacts Debug Analysis ===\n\n';
        
        // معلومات النظام
        debugInfo += 'SYSTEM INFO:\n';
        debugInfo += '------------\n';
        debugInfo += `Time: ${new Date().toLocaleString()}\n`;
        debugInfo += `User Agent: ${navigator.userAgent}\n`;
        debugInfo += `Online: ${navigator.onLine}\n\n`;
        
        // معلومات SFacts
        debugInfo += 'SFacts STATUS:\n';
        debugInfo += '--------------\n';
        debugInfo += `SFactsApp: ${window.SFactsApp ? 'Loaded ✓' : 'Not found ✗'}\n`;
        debugInfo += `FormDataCollector: ${window.FormDataCollector ? 'Loaded ✓' : 'Not found ✗'}\n`;
        debugInfo += `Last Results: ${window.lastEnhancedResults ? 'Available ✓' : 'None ✗'}\n\n`;
        
        // بيانات النموذج
        debugInfo += 'FORM DATA:\n';
        debugInfo += '----------\n';
        
        const items = [];
        const criteria = [];
        
        for (let i = 0; i < 8; i++) {
            const item = document.getElementById('item' + i);
            const criterion = document.getElementById('criteria' + i);
            
            if (item && item.value) items.push(item.value);
            if (criterion && criterion.value) criteria.push(criterion.value);
        }
        
        debugInfo += `Items: ${items.length} (${items.join(', ')})\n`;
        debugInfo += `Criteria: ${criteria.length} (${criteria.join(', ')})\n`;
        
        // معلومات HTML
        debugInfo += '\nHTML ELEMENTS:\n';
        debugInfo += '--------------\n';
        debugInfo += `calcbtn: ${document.getElementById('calcbtn') ? 'Found' : 'Not found'}\n`;
        debugInfo += `goal: ${document.getElementById('goal') ? 'Found' : 'Not found'}\n`;
        debugInfo += `results: ${document.getElementById('results') ? 'Found' : 'Not found'}\n`;
        
        debugOutput.textContent = debugInfo;
        
        showEnhancedNotification('Debug analysis complete', 'info');
        
    } catch (error) {
        console.error('Debug analysis error:', error);
        showEnhancedNotification('Debug failed: ' + error.message, 'error');
    }
}

/**
 * تعبئة بيانات الاختبار
 */
function fillTestData() {
    console.log('Filling test data...');
    
    // تعبئة الهدف
    const goalInput = document.getElementById('goal');
    if (goalInput) goalInput.value = 'Choose the best mobile learning platform';
    
    // تعبئة العناصر
    const testItems = ['Platform A', 'Platform B', 'Platform C', 'Platform D'];
    testItems.forEach((item, index) => {
        const input = document.getElementById('item' + index);
        if (input) input.value = item;
    });
    
    // تعبئة المعايير
    const testCriteria = ['Usability', 'Cost', 'Features', 'Support'];
    testCriteria.forEach((criterion, index) => {
        const input = document.getElementById('criteria' + index);
        if (input) input.value = criterion;
    });
    
    // تعبئة بعض القيم في الجداول (اختياري)
    const testValues = {
        'criteria0v1': '3', 'criteria0v2': '5', 'criteria0v3': '2',
        'criteria1v2': '2', 'criteria1v3': '4',
        'criteria2v3': '3'
    };
    
    Object.keys(testValues).forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = testValues[id];
    });
    
    showEnhancedNotification('Test data filled', 'success');
}

/**
 * إعادة تعيين النظام المحسن
 */
function resetEnhancedSystem() {
    if (confirm('Reset enhanced system? This will clear all enhanced results.')) {
        window.lastEnhancedResults = null;
        
        // إخفاء النتائج
        const resultsContainer = document.getElementById('enhanced-results-container');
        if (resultsContainer) resultsContainer.style.display = 'none';
        
        // تحديث الحالة
        updateSystemStatus('Ready', 'success');
        updateDataStatus('No data collected');
        
        showEnhancedNotification('Enhanced system reset', 'info');
    }
}

/**
 * عرض النتائج المحسنة
 */
function displayEnhancedResults(results) {
    const container = document.getElementById('enhanced-results-container');
    if (container) {
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });
    }
    
    // عرض تحليل الحساسية
    displaySensitivityResults(results);
    
    // عرض التحقق
    displayValidationResults(results);
}

/**
 * عرض نتائج الحساسية
 */
function displaySensitivityResults(results) {
    const content = document.getElementById('sensitivity-content');
    if (!content) return;
    
    let html = '';
    
    if (results.sensitivity) {
        html += '<div class="sensitivity-card">';
        html += '<h3 style="color: #333; margin-top: 0;">Sensitivity Analysis</h3>';
        
        if (results.sensitivity.summary) {
            html += `<p><strong>Model Stability:</strong> <span style="color: ${results.sensitivity.summary.stability === 'عالية' ? '#28a745' : results.sensitivity.summary.stability === 'متوسطة' ? '#ffc107' : '#dc3545'}">${results.sensitivity.summary.stability}</span></p>`;
            html += `<p><strong>Average Impact:</strong> ${(results.sensitivity.summary.averageImpact * 100).toFixed(2)}%</p>`;
        }
        
        if (results.sensitivity.mostSensitive) {
            html += `<p><strong>Most Sensitive Criterion:</strong> ${results.sensitivity.mostSensitive.criterion}</p>`;
        }
        
        if (results.sensitivity.summary?.recommendations) {
            html += '<div style="background: #e7f3ff; padding: 10px; border-radius: 5px; margin-top: 15px;">';
            html += '<h4 style="margin-top: 0;">Recommendations</h4>';
            html += '<ul style="margin: 0; padding-left: 20px;">';
            results.sensitivity.summary.recommendations.forEach(rec => {
                html += `<li>${rec}</li>`;
            });
            html += '</ul>';
            html += '</div>';
        }
        
        html += '</div>';
    } else {
        html += '<p style="color: #666;">No sensitivity analysis available</p>';
    }
    
    content.innerHTML = html;
}

/**
 * عرض نتائج التحقق
 */
function displayValidationResults(results) {
    const content = document.getElementById('validation-content');
    if (!content) return;
    
    let html = '';
    
    if (results.validation) {
        html += '<div class="validation-card">';
        html += '<h3 style="color: #333; margin-top: 0;">Validation Results</h3>';
        
        html += `<p><strong>Status:</strong> <span style="color: ${results.validation.isValid ? '#28a745' : '#dc3545'}">${results.validation.isValid ? '✓ Valid' : '✗ Invalid'}</span></p>`;
        
        if (results.validation.warnings && results.validation.warnings.length > 0) {
            html += '<div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin-top: 10px;">';
            html += '<h4 style="color: #856404; margin-top: 0;">Warnings</h4>';
            html += '<ul style="margin: 0; padding-left: 20px; color: #856404;">';
            results.validation.warnings.forEach(warning => {
                html += `<li>${warning}</li>`;
            });
            html += '</ul>';
            html += '</div>';
        }
        
        if (results.validationErrors) {
            html += '<div style="background: #f8d7da; padding: 10px; border-radius: 5px; margin-top: 10px;">';
            html += '<h4 style="color: #721c24; margin-top: 0;">Errors</h4>';
            html += '<ul style="margin: 0; padding-left: 20px; color: #721c24;">';
            results.validationErrors.forEach(error => {
                html += `<li>${error}</li>`;
            });
            html += '</ul>';
            html += '</div>';
        }
        
        html += '</div>';
    } else {
        html += '<p style="color: #666;">No validation results available</p>';
    }
    
    content.innerHTML = html;
}

/**
 * عرض أخطاء التحقق
 */
function showValidationErrors(errors) {
    let message = 'Validation errors:\n';
    errors.forEach((error, index) => {
        message += `${index + 1}. ${error}\n`;
    });
    
    alert(message);
}

/**
 * تبديل التبويبات
 */
function switchTab(tabId) {
    // إخفاء جميع المحتويات
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // إلغاء تنشيط جميع الأزرار
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // إظهار المحتوى المحدد
    const tabContent = document.getElementById('tab-' + tabId);
    const tabButton = document.querySelector(`[data-tab="${tabId}"]`);
    
    if (tabContent) tabContent.classList.add('active');
    if (tabButton) tabButton.classList.add('active');
}

/**
 * تنزيل الملف
 */
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * إظهار إشعار محسن
 */
function showEnhancedNotification(message, type = 'info') {
    const container = document.getElementById('enhanced-notifications');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = 'enhanced-notification ' + type;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    notification.innerHTML = `
        <div style="
            background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : type === 'warning' ? '#fff3cd' : '#d1ecf1'};
            color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : type === 'warning' ? '#856404' : '#0c5460'};
            padding: 12px 15px;
            border-radius: 6px;
            margin-bottom: 5px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: flex;
            align-items: center;
            animation: slideIn 0.3s ease;
        ">
            <span style="margin-right: 10px; font-size: 18px;">${icons[type] || 'ℹ️'}</span>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="
                margin-left: auto;
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: inherit;
                opacity: 0.7;
            ">×</button>
        </div>
    `;
    
    // إضافة الأنيميشن
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    container.appendChild(notification);
    
    // إزالة تلقائية بعد 5 ثوانٍ
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

/**
 * تحديث حالة النظام
 */
function updateSystemStatus(status, type = 'info') {
    const statusElement = document.getElementById('system-status');
    if (!statusElement) return;
    
    statusElement.className = 'status-indicator ' + type;
    statusElement.querySelector('.status-text').textContent = status;
}

/**
 * تحديث حالة البيانات
 */
function updateDataStatus(status) {
    const statusElement = document.getElementById('data-status');
    if (!statusElement) return;
    
    statusElement.querySelector('.status-text').textContent = status;
}

/**
 * إظهار حالة النظام المحسن
 */
function showEnhancedStatus(message, type = 'info') {
    console.log(`Enhanced Status [${type}]:`, message);
    
    // يمكنك إضافة عرض رسالة في واجهة المستخدم هنا
    if (type === 'error') {
        showEnhancedNotification(message, 'error');
    }
}

// تصدير الوظائف للاستخدام العالمي
window.SFactsIntegration = {
    initialize: initializeEnhancedSystem,
    calculate: performEnhancedCalculation,
    validate: validateFormData,
    export: exportResults,
    debug: runDebugAnalysis,
    reset: resetEnhancedSystem
};

console.log('✅ Enhanced integration module loaded');
