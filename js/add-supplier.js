// دالة لتحميل بيانات المستخدم
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    
    if (userData) {
        const nameEl = document.querySelector('.user-name');
        const avatarEl = document.querySelector('.user-avatar');
        if (nameEl) nameEl.textContent = userData.name;
        if (avatarEl) avatarEl.textContent = (userData.name || '').charAt(0);
    } else {
        window.location.href = 'index.html';
    }
}

// دالة لإعداد السايدبار في كل الصفحات
function setupSidebar() {
    // إضافة event listeners للروابط + حالة Active
    const items = document.querySelectorAll('.sidebar-menu .menu-item');
    items.forEach(item => {
        item.addEventListener('click', function(e) {
            if (!this.classList.contains('logout-item')) {
                e.preventDefault();
                items.forEach(i => i.classList.remove('is-active'));
                this.classList.add('is-active');
                const href = this.getAttribute('href');
                if (href && href !== '#') {
                    window.location.href = href;
                }
            }
        });
    });
}

// دالة لعرض الرسائل
function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        font-weight: 500;
        max-width: 90%;
        text-align: center;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        messageDiv.style.transition = 'opacity 0.5s ease';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 500);
    }, 3000);
}

// دالة التحقق من الحقول المطلوبة
function validateRequiredFields() {
    const requiredFields = [
        { id: 'supplierName', name: 'اسم المورد' },
        { id: 'taxNumber', name: 'الرقم الضريبي' },
        { id: 'bankName', name: 'البنك' },
        { id: 'ibanNumber', name: 'رقم الأيبان' }
    ];

    let isValid = true;

    requiredFields.forEach(field => {
        const input = document.getElementById(field.id);
        const container = input ? input.closest('.form-group') : null;
        const errorElement = container ? container.querySelector('.error-message') : null;
        if (!input) { isValid = false; return; }

        if (!input.value.trim()) {
            if (errorElement) {
                errorElement.textContent = `${field.name} مطلوب`;
                errorElement.style.display = 'block';
            }
            input.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            if (errorElement) {
                errorElement.style.display = 'none';
            }
            input.style.borderColor = '#e1e1e1';
        }
    });

    return isValid;
}

// دالة مسح الأخطاء
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    const inputs = document.querySelectorAll('.form-input');
    
    errorElements.forEach(error => {
        error.style.display = 'none';
    });
    
    inputs.forEach(input => {
        input.style.borderColor = '#e1e1e1';
    });
}

// دالة إرسال الفورم
function handleFormSubmit(e) {
    e.preventDefault();
    
    // مسح الأخطاء السابقة
    clearErrors();
    
    // التحقق من الحقول المطلوبة
    if (!validateRequiredFields()) {
        showMessage('يرجى ملء جميع الحقول المطلوبة', 'error');
        return;
    }
    
    // جمع بيانات الفورم
    const formData = {
        supplierName: document.getElementById('supplierName').value.trim(),
        taxNumber: document.getElementById('taxNumber').value.trim(),
        bankName: document.getElementById('bankName').value.trim(),
        ibanNumber: document.getElementById('ibanNumber').value.trim(),
        supplierAddress: document.getElementById('supplierAddress') ? document.getElementById('supplierAddress').value.trim() : '',
        supplierEmail: document.getElementById('supplierEmail') ? document.getElementById('supplierEmail').value.trim() : '',
        contactNumber: document.getElementById('contactNumber') ? document.getElementById('contactNumber').value.trim() : '',
        createdAt: new Date().toISOString()
    };
    
    // عرض حالة التحميل
    const submitBtn = document.querySelector('.btn-primary');
    const originalText = submitBtn ? submitBtn.innerHTML : null;
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإضافة...';
        submitBtn.disabled = true;
    }
    
    // إرسال البيانات عبر API (إضافة أو تعديل حسب وجود id)
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('id');
    const payload = {
        name: formData.supplierName,
        email: formData.supplierEmail || null,
        phone: formData.contactNumber || null,
        address: formData.supplierAddress || null,
        bank_name: formData.bankName || null,
        iban: formData.ibanNumber || null,
        tax_number: formData.taxNumber || null,
    };
    const actionPromise = editId ? API.suppliers.update(editId, payload) : API.suppliers.create(payload);
    actionPromise.then(() => {
        showMessage(editId ? 'تم حفظ تعديلات المورد بنجاح!' : 'تم إضافة المورد بنجاح!');
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
        setTimeout(() => { window.location.href = 'search-suppliers.html'; }, 1200);
    }).catch(err => {
        console.error('Supplier save error:', err);
        showMessage(editId ? 'تعذر حفظ التعديلات، حاول مرة أخرى.' : 'تعذر إضافة المورد، حاول مرة أخرى.', 'error');
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// دالة إلغاء الإضافة
function handleCancel() {
    if (confirm('هل تريد إلغاء إضافة المورد؟ سيتم فقدان جميع البيانات غير المحفوظة.')) {
        window.location.href = 'home.html';
    }
}

// إعداد event listeners
function setupEventListeners() {
    const form = document.getElementById('supplierForm');
    const cancelBtn = document.getElementById('cancelBtn');
    
    if (form) form.addEventListener('submit', handleFormSubmit);
    if (cancelBtn) cancelBtn.addEventListener('click', handleCancel);
    
    // إضافة تحقق فوري للحقول المطلوبة
    const requiredInputs = document.querySelectorAll('.required input');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const container = this.closest('.form-group');
            const errorElement = container ? container.querySelector('.error-message') : null;
            if (!this.value.trim()) {
                if (errorElement) {
                    errorElement.textContent = 'هذا الحقل مطلوب';
                    errorElement.style.display = 'block';
                }
                this.style.borderColor = '#e74c3c';
            } else {
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
                this.style.borderColor = '#e1e1e1';
            }
        });
        
        input.addEventListener('input', function() {
            const container = this.closest('.form-group');
            const errorElement = container ? container.querySelector('.error-message') : null;
            if (this.value.trim()) {
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
                this.style.borderColor = '#e1e1e1';
            }
        });
    });
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupEventListeners();

    setupSidebar();
    
    console.log('Add Supplier page loaded');

    // لو الصفحة مفتوحة للتعديل عبر ?id=، حمّل بيانات المورد
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('id');
        if (editId) {
            const submitBtn = document.querySelector('.btn-primary');
            if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> حفظ التعديلات';
            API.suppliers.get(editId).then(s => {
                if (s) {
                    if (document.getElementById('supplierName')) document.getElementById('supplierName').value = s.name || '';
                    if (document.getElementById('taxNumber')) document.getElementById('taxNumber').value = s.tax_number || '';
                    if (document.getElementById('bankName')) document.getElementById('bankName').value = s.bank_name || '';
                    if (document.getElementById('ibanNumber')) document.getElementById('ibanNumber').value = s.iban || '';
                    if (document.getElementById('supplierAddress')) document.getElementById('supplierAddress').value = s.address || '';
                    if (document.getElementById('supplierEmail')) document.getElementById('supplierEmail').value = s.email || '';
                    if (document.getElementById('contactNumber')) document.getElementById('contactNumber').value = s.phone || '';
                }
            }).catch(err => {
                console.error('Load supplier failed:', err);
                showMessage('تعذر تحميل بيانات المورد للتعديل', 'error');
            });
        }
    } catch(_) {}

    // بحث سريع عن مورد موجود
    const quickInput = document.getElementById('quickSupplierSearch');
    const quickResults = document.getElementById('quickSupplierResults');
    if (quickInput && quickResults) {
        const render = (rows) => {
            if (!rows || rows.length === 0) {
                quickResults.innerHTML = '<div style="padding:10px; color:#666;">لا توجد نتائج</div>';
                quickResults.style.display = 'block';
                return;
            }
            const items = rows.slice(0, 8).map(r => {
                const name = r.supplierName || '-';
                const tax = r.taxNumber || '-';
                const bank = r.bankName || '-';
                const email = r.supplierEmail || '';
                return `
                <div class="qs-item" style="padding:10px 12px; border-bottom:1px solid #f2f2f2; cursor:pointer;">
                    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
                        <div style="font-weight:600; color:#2c3e50;">${name}</div>
                        <span style="font-size:12px; color:#3498db;">${bank}</span>
                    </div>
                    <div style="font-size:12px; color:#666; margin-top:4px; display:flex; gap:10px; flex-wrap:wrap;">
                        <span>ضريبي: ${tax}</span>
                        ${email ? `<span>البريد: ${email}</span>` : ''}
                    </div>
                </div>`;
            }).join('');
            quickResults.innerHTML = items;
            quickResults.style.display = 'block';
        };

        const apply = async (q) => {
            const query = (q || '').trim();
            if (!query) { quickResults.style.display = 'none'; quickResults.innerHTML = ''; return; }
            try {
                const rows = await API.suppliers.list({ q: query });
                // حوّل الحقول لتتوافق مع الريندر الحالي مؤقتًا
                const mapped = Array.isArray(rows) ? rows.map(s => ({
                    supplierName: s.name,
                    taxNumber: s.tax_number,
                    bankName: s.bank_name,
                    supplierEmail: s.email,
                })) : [];
                render(mapped);
            } catch (err) {
                console.error('Quick search failed:', err);
                quickResults.style.display = 'none';
            }
        };

        quickInput.addEventListener('input', function() { apply(this.value); });
        quickInput.addEventListener('focus', function() { if (this.value) apply(this.value); });
        quickInput.addEventListener('blur', function() { setTimeout(() => { quickResults.style.display = 'none'; }, 150); });
        quickResults.addEventListener('mousedown', function(e) { e.preventDefault(); });
    }
});
