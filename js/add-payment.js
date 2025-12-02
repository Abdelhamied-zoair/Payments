// تحميل بيانات المستخدم
function loadUserData() {
    let userData = JSON.parse(localStorage.getItem('currentUser'));
    if (!userData) {
        const auth = JSON.parse(localStorage.getItem('auth')||'{}');
        if (auth && auth.user) {
            userData = { name: auth.user.username || (auth.user.email||'').split('@')[0], role: auth.user.role, email: auth.user.email };
            try { localStorage.setItem('currentUser', JSON.stringify(userData)); } catch(_) {}
        }
    }
    if (userData) {
        const nameEl = document.querySelector('.user-name');
        const avatarEl = document.querySelector('.user-avatar');
        if (nameEl) nameEl.textContent = userData.name;
        if (avatarEl) avatarEl.textContent = userData.name.charAt(0);
    } else {
        // لا تقم بإخراج المستخدم مباشرة؛ اعرض رسالة
        alert('انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى');
        window.location.href = 'index.html';
    }
}

// تحميل الموردين من الـ API وملء القائمة
let SUPPLIERS_CACHE = [];
async function populateSuppliers(filterText = '') {
    const select = document.getElementById('supplierSelect');
    const q = (filterText || '').trim();
    try {
        const rows = await API.suppliers.list(q ? { q } : {});
        SUPPLIERS_CACHE = rows || [];
        select.innerHTML = '<option value="">اختر المورد</option>';
        SUPPLIERS_CACHE.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.name || s.supplierName || ('Supplier ' + s.id);
            select.appendChild(opt);
        });
    } catch (e) {
        console.error('Failed to load suppliers:', e);
        showToast('تعذر تحميل الموردين، حاول مرة أخرى.', 'error');
        select.innerHTML = '<option value="">اختر المورد</option>';
    }
}

// زر السايدبار يُدار عبر ensureMenuToggle في common.js

// إعداد السايدبار
function setupSidebar() {
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

// رسائل سريعة

// تحقق الحقول
function validateForm() {
    let isValid = true;
    const paymentType = document.getElementById('paymentType');
    const projectName = document.getElementById('projectName');
    const amount = document.getElementById('amount');
    const invoiceNumber = document.getElementById('invoiceNumber');
    const supplierSelect = document.getElementById('supplierSelect');
    
    const setError = (id, text) => { const el = document.getElementById(id); el.textContent = text; el.style.display = 'block'; };
    const clearError = (id) => { const el = document.getElementById(id); el.style.display = 'none'; };

    if (!paymentType.value) { setError('paymentTypeError', 'هذا الحقل مطلوب'); isValid = false; } else { clearError('paymentTypeError'); }
    if (!projectName.value.trim()) { setError('projectNameError', 'هذا الحقل مطلوب'); isValid = false; } else { clearError('projectNameError'); }
    if (!amount.value || Number(amount.value) <= 0) { setError('amountError', 'برجاء إدخال مبلغ صالح'); isValid = false; } else { clearError('amountError'); }
    if (!supplierSelect.value) { setError('supplierSelectError', 'اختر المورد'); isValid = false; } else { clearError('supplierSelectError'); }

    if (paymentType.value === 'invoice') {
        if (!invoiceNumber.value.trim()) { setError('invoiceNumberError', 'رقم الفاتورة مطلوب'); isValid = false; } else { clearError('invoiceNumberError'); }
    } else {
        clearError('invoiceNumberError');
    }

    return isValid;
}

// إعداد الفورم
function setupForm() {
    const form = document.getElementById('paymentForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const paymentType = document.getElementById('paymentType');
    const invoiceExtras = document.getElementById('invoiceExtras');
    const uploadBtn = document.getElementById('uploadInvoiceBtn');
    const invoiceInput = document.getElementById('invoiceImage');
    const invoiceName = document.getElementById('invoiceImageName');
    const addDetailsBtn = document.getElementById('addRequestDetailsBtn');
    const additionalFields = document.getElementById('additionalRequestFields');
    const supplierSelect = document.getElementById('supplierSelect');
    const supplierName = document.getElementById('supplierName');
    const supplierEmail = document.getElementById('supplierEmail');
    const taxNumberView = document.getElementById('taxNumberView');
    const bankNameView = document.getElementById('bankNameView');
    const ibanNumberView = document.getElementById('ibanNumberView');
    const supplierSearch = document.getElementById('supplierSearch');
    const manageSuppliersBtn = document.getElementById('manageSuppliersBtn');
    const addSupplierBtn = document.getElementById('addSupplierBtn');

    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('input', () => {
            const err = document.getElementById(input.id + 'Error');
            if (err) err.style.display = 'none';
        });
    });

    supplierSelect.addEventListener('change', function() {
        const selected = SUPPLIERS_CACHE.find(s => String(s.id) === String(this.value));
        if (selected) {
            supplierName.value = selected.name || selected.supplierName || '';
            supplierEmail.value = selected.email || selected.supplierEmail || '';
            taxNumberView.value = selected.tax_number || selected.taxNumber || '';
            bankNameView.value = selected.bank_name || selected.bankName || '';
            ibanNumberView.value = selected.iban || selected.ibanNumber || '';
            const err = document.getElementById('supplierSelectError');
            if (err) err.style.display = 'none';
        } else {
            supplierName.value = '';
            supplierEmail.value = '';
            taxNumberView.value = '';
            bankNameView.value = '';
            ibanNumberView.value = '';
        }
    });

    supplierSearch.addEventListener('input', function() {
        populateSuppliers(this.value);
    });

    manageSuppliersBtn.addEventListener('click', function() {
        window.location.href = 'search-suppliers.html';
    });
    addSupplierBtn.addEventListener('click', function() {
        window.location.href = 'add-supplier.html';
    });

    paymentType.addEventListener('change', function() {
        const isInvoice = this.value === 'invoice';
        invoiceExtras.style.display = isInvoice ? 'grid' : 'none';
        document.getElementById('invoiceNumberError').style.display = 'none';
        document.getElementById('invoiceImageError').style.display = 'none';
    });

    uploadBtn.addEventListener('click', function() {
        invoiceInput.click();
    });

    invoiceInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            invoiceName.textContent = this.files[0].name;
        } else {
            invoiceName.textContent = 'لم يتم اختيار ملف';
        }
    });

    addDetailsBtn.addEventListener('click', function() {
        const visible = additionalFields.style.display !== 'none';
        additionalFields.style.display = visible ? 'none' : 'block';
        this.innerHTML = visible
            ? '<i class="fas fa-plus"></i> إضافة تفاصيل الطلب'
            : '<i class="fas fa-minus"></i> إخفاء تفاصيل الطلب';
    });

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        if (!validateForm()) {
            showMessage('يرجى ملء الحقول المطلوبة بشكل صحيح', 'error');
            return;
        }

        const paymentTypeVal = paymentType.value;
        const projectNameVal = document.getElementById('projectName').value.trim();
        const amountVal = Number(document.getElementById('amount').value);
        const notesVal = document.getElementById('notes').value.trim();
        const invoiceNumberVal = document.getElementById('invoiceNumber').value.trim();
        const requestTitleVal = document.getElementById('requestTitle') ? document.getElementById('requestTitle').value.trim() : '';
        const dueDateVal = document.getElementById('dueDate') ? document.getElementById('dueDate').value : '';
        const requestDescriptionVal = document.getElementById('requestDescription') ? document.getElementById('requestDescription').value.trim() : '';

        const selected = SUPPLIERS_CACHE.find(s => String(s.id) === String(supplierSelect.value));
        if (!selected) {
            showToast('اختر موردًا صالحًا قبل الإرسال', 'error');
            return;
        }

        // محاولة رفع صورة الفاتورة إن وُجدت
        let invoiceImageUrl = null;
        if (paymentTypeVal === 'invoice' && invoiceInput && invoiceInput.files && invoiceInput.files[0]) {
            const file = invoiceInput.files[0];
            try {
                const reader = new FileReader();
                const dataUrl = await new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
                const uploaded = await API.uploads.uploadInvoice(String(dataUrl), file.name);
                invoiceImageUrl = uploaded?.url || null;
            } catch (e) {
                console.error('Invoice upload failed:', e);
                showToast('تعذر رفع صورة الفاتورة، سيتم إرسال الطلب بدون صورة', 'error');
            }
        }

        const payload = {
            supplier_id: selected.id,
            payment_type: paymentTypeVal,
            project_name: projectNameVal,
            amount: amountVal,
            notes: notesVal || null,
            invoice_number: paymentTypeVal === 'invoice' ? (invoiceNumberVal || null) : null,
            invoice_image_url: invoiceImageUrl,
            request_title: requestTitleVal || null,
            due_date: dueDateVal || null,
            description: requestDescriptionVal || null,
            status: 'pending'
        };

        const btn = form.querySelector('.btn-primary');
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        btn.disabled = true;

        try {
            const created = await API.requests.create(payload);
            try { 
                await API.notifications.create({ 
                    type: 'request', 
                    title: 'طلب دفعة جديد', 
                    request_id: created?.id || null 
                }); 
            } catch(_) {}

            showMessage('تم إرسال طلب الدفعة بنجاح - الحالة: قيد المراجعة');
            btn.innerHTML = original;
            btn.disabled = false;
            try {
                const hdr = document.querySelector('.form-header');
                if (hdr && !document.getElementById('openSearchAfterSubmit')) {
                    const linkBtn = document.createElement('button');
                    linkBtn.id = 'openSearchAfterSubmit';
                    linkBtn.className = 'btn btn-secondary';
                    linkBtn.style.marginTop = '10px';
                    linkBtn.innerHTML = '<i class="fas fa-search"></i> فتح صفحة البحث عن الطلبات';
                    linkBtn.addEventListener('click', function(){ window.location.href = 'search-requests.html'; });
                    hdr.appendChild(linkBtn);
                }
            } catch(_) {}

        } catch (err) {
            console.error('Request create error:', err);
            showToast('تعذر إرسال الطلب، حاول مرة أخرى.', 'error');
            btn.innerHTML = original;
            btn.disabled = false;
        }
    });

    cancelBtn.addEventListener('click', function() {
        if (confirm('هل تريد إلغاء الطلب؟')) {
            window.location.href = 'home.html';
        }
    });
}

// تشغيل عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupSidebar();
    
    populateSuppliers('');
    setupForm();

    const quickInput = document.getElementById('quickRequestSearch');
    const quickResults = document.getElementById('quickRequestResults');
    if (quickInput && quickResults) {

        const render = (rows) => {
            if (!rows.length) {
                quickResults.innerHTML = '<div style="padding:10px; color:#666;">لا توجد نتائج</div>';
                quickResults.style.display = 'block';
                return;
            }
            const items = rows.slice(0, 10).map(r => {
                const title = r.request_title || r.project_name || 'طلب بدون عنوان';
                const amountStr = (typeof r.amount === 'number' && !isNaN(r.amount)) ? r.amount.toLocaleString('ar-EG') + ' ر.س' : '-';
                const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString('ar-EG') : '';
                const status = r.status || '-';
                const type = r.payment_type || '-';
                const invoice = r.invoice_number || '';
                return `
                <a href="search-requests.html" class="qr-item" style="display:block; padding:10px 12px; border-bottom:1px solid #f2f2f2; text-decoration:none;">
                    <div style="display:flex; justify-content:space-between; gap:8px;">
                        <div style="font-weight:600; color:#2c3e50;">${title}</div>
                        <div style="font-size:12px; color:#666;">${dateStr}</div>
                    </div>
                    <div style="font-size:12px; color:#666; margin-top:4px; display:flex; gap:12px; flex-wrap:wrap;">
                        <span>الحالة: ${status}</span>
                        <span>النوع: ${type}</span>
                        <span>المبلغ: ${amountStr}</span>
                        ${invoice ? `<span>فاتورة: ${invoice}</span>` : ''}
                    </div>
                </a>`;
            }).join('');
            quickResults.innerHTML = items;
            quickResults.style.display = 'block';
        };

        const apply = async (q) => {
            const query = (q || '').trim();
            if (!query) { quickResults.style.display = 'none'; return; }
            try {
                const rows = await API.requests.list({ q: query });
                render(rows);
            } catch (e) {
                console.error('Quick search failed:', e);
                quickResults.style.display = 'none';
            }
        };

        quickInput.addEventListener('input', function() { apply(this.value); });
        quickInput.addEventListener('focus', function() { if (this.value) apply(this.value); });
        quickInput.addEventListener('blur', function() { 
            setTimeout(() => { quickResults.style.display = 'none'; }, 150); 
        });

        quickResults.addEventListener('mousedown', function(e) { e.preventDefault(); });
    }
});

// تعديل السايدبار عند تغيير حجم الشاشة
window.addEventListener('resize', function() {
    if (window.innerWidth > 767) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active');
    }
});
