// تحميل بيانات المستخدم
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    if (userData) {
        const nameEl = document.querySelector('.user-name');
        const avatarEl = document.querySelector('.user-avatar');
        if (nameEl) nameEl.textContent = userData.name;
        if (avatarEl) avatarEl.textContent = userData.name.charAt(0);
    } else {
        window.location.href = 'index.html';
    }
}

// تحميل الموردين وملء القائمة
function populateSuppliers(filterText = '') {
    const select = document.getElementById('supplierSelect');
    const suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
    const q = (filterText || '').toLowerCase();
    const filtered = q
        ? suppliers.filter(s => (
            (s.supplierName && s.supplierName.toLowerCase().includes(q)) ||
            (s.supplierEmail && s.supplierEmail.toLowerCase().includes(q)) ||
            (s.taxNumber && s.taxNumber.toLowerCase().includes(q))
        ))
        : suppliers;

    select.innerHTML = '<option value="">اختر المورد</option>';
    filtered.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.supplierName || ('Supplier ' + s.id);
        select.appendChild(opt);
    });
}

// زرار السايدبار
function setupSidebarToggle() {
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.setAttribute('aria-label', 'Toggle sidebar');
    
    menuToggle.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        if (window.innerWidth <= 767) {
            sidebar.classList.toggle('active');
        } else {
            document.body.classList.toggle('sidebar-closed');
            this.innerHTML = document.body.classList.contains('sidebar-closed')
                ? '<i class="fas fa-bars"></i>'
                : '<i class="fas fa-times"></i>';
        }
    });
    
    document.body.appendChild(menuToggle);
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

// رسائل علوية سريعة
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
        padding: 12px 20px;
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
        setTimeout(() => document.body.contains(messageDiv) && document.body.removeChild(messageDiv), 500);
    }, 2500);
}

// تحقق بسيط
function validateForm() {
    let isValid = true;
    const paymentType = document.getElementById('paymentType');
    const projectName = document.getElementById('projectName');
    const amount = document.getElementById('amount');
    const invoiceNumber = document.getElementById('invoiceNumber');
    const invoiceImage = document.getElementById('invoiceImage');
    const supplierSelect = document.getElementById('supplierSelect');
    
    const setError = (id, text) => { const el = document.getElementById(id); el.textContent = text; el.style.display = 'block'; };
    const clearError = (id) => { const el = document.getElementById(id); el.style.display = 'none'; };

    if (!paymentType.value) { setError('paymentTypeError', 'هذا الحقل مطلوب'); isValid = false; } else { clearError('paymentTypeError'); }
    if (!projectName.value.trim()) { setError('projectNameError', 'هذا الحقل مطلوب'); isValid = false; } else { clearError('projectNameError'); }
    if (!amount.value || Number(amount.value) <= 0) { setError('amountError', 'برجاء إدخال مبلغ صالح'); isValid = false; } else { clearError('amountError'); }
    if (!supplierSelect.value) { setError('supplierSelectError', 'اختر المورد'); isValid = false; } else { clearError('supplierSelectError'); }

    // شروط إضافية في حالة نوع الدفعة = فاتورة
    if (paymentType.value === 'invoice') {
        if (!invoiceNumber.value.trim()) { setError('invoiceNumberError', 'رقم الفاتورة مطلوب'); isValid = false; } else { clearError('invoiceNumberError'); }
        if (!invoiceImage.files || invoiceImage.files.length === 0) { setError('invoiceImageError', 'برجاء إرفاق صورة الفاتورة'); isValid = false; } else { clearError('invoiceImageError'); }
    } else {
        clearError('invoiceNumberError');
        clearError('invoiceImageError');
    }

    return isValid;
}

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

    // تحسين تجربة الإدخال
    document.querySelectorAll('.form-input').forEach(input => {
        input.addEventListener('input', () => {
            const err = document.getElementById(input.id + 'Error');
            if (err) err.style.display = 'none';
        });
    });

    // تغيير المورد يملأ البيانات
    supplierSelect.addEventListener('change', function() {
        const suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
        const selected = suppliers.find(s => String(s.id) === String(this.value));
        if (selected) {
            supplierName.value = selected.supplierName || '';
            supplierEmail.value = selected.supplierEmail || '';
            taxNumberView.value = selected.taxNumber || '';
            bankNameView.value = selected.bankName || '';
            ibanNumberView.value = selected.ibanNumber || '';
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

    // بحث حي داخل الموردين
    supplierSearch.addEventListener('input', function() {
        populateSuppliers(this.value);
    });

    // إدارة الموردين/إضافة مورد
    manageSuppliersBtn.addEventListener('click', function() {
        window.location.href = 'search-suppliers.html';
    });
    addSupplierBtn.addEventListener('click', function() {
        window.location.href = 'add-supplier.html';
    });

    // إظهار/إخفاء حقول الفاتورة
    paymentType.addEventListener('change', function() {
        const isInvoice = this.value === 'invoice';
        invoiceExtras.style.display = isInvoice ? 'grid' : 'none';
        // تفريغ الأخطاء إن وُجدت
        document.getElementById('invoiceNumberError').style.display = 'none';
        document.getElementById('invoiceImageError').style.display = 'none';
    });

    // زر اختيار الصورة
    uploadBtn.addEventListener('click', function() {
        invoiceInput.click();
    });

    // تحديث اسم الملف المختار
    invoiceInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            invoiceName.textContent = this.files[0].name;
            document.getElementById('invoiceImageError').style.display = 'none';
        } else {
            invoiceName.textContent = 'لم يتم اختيار ملف';
        }
    });

    // إظهار/إخفاء تفاصيل الطلب الإضافية
    addDetailsBtn.addEventListener('click', function() {
        const visible = additionalFields.style.display !== 'none';
        additionalFields.style.display = visible ? 'none' : 'block';
        this.innerHTML = visible
            ? '<i class="fas fa-plus"></i> إضافة تفاصيل الطلب'
            : '<i class="fas fa-minus"></i> إخفاء تفاصيل الطلب';
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!validateForm()) {
            showMessage('يرجى ملء الحقول المطلوبة بشكل صحيح', 'error');
            return;
        }

        const data = {
            paymentType: document.getElementById('paymentType').value,
            projectName: document.getElementById('projectName').value.trim(),
            amount: Number(document.getElementById('amount').value),
            notes: document.getElementById('notes').value.trim(),
            createdAt: new Date().toISOString()
        };

        // بيانات المورد
        const suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
        const selected = suppliers.find(s => String(s.id) === String(supplierSelect.value));
        if (selected) {
            data.supplierId = selected.id;
            data.supplierName = selected.supplierName;
            data.taxNumber = selected.taxNumber;
            data.bankName = selected.bankName;
            data.ibanNumber = selected.ibanNumber;
            data.supplierEmail = selected.supplierEmail;
        }

        // لو فاتورة: نحفظ رقم الفاتورة واسم الملف، ونخزن صورة مصغرة Base64 بشكل مبسط
        if (paymentType.value === 'invoice') {
            data.invoiceNumber = document.getElementById('invoiceNumber').value.trim();
            if (invoiceInput.files && invoiceInput.files[0]) {
                data.invoiceImageName = invoiceInput.files[0].name;
            }
        }

        const btn = form.querySelector('.btn-primary');
        const original = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        btn.disabled = true;

        setTimeout(() => {
            const payments = JSON.parse(localStorage.getItem('payments')) || [];
            // حالة الطلب تبدأ Pending
            const requestExtra = {
                requestTitle: document.getElementById('requestTitle') ? document.getElementById('requestTitle').value.trim() : '',
                requestRef: document.getElementById('requestRef') ? document.getElementById('requestRef').value.trim() : '',
                dueDate: document.getElementById('dueDate') ? document.getElementById('dueDate').value : '',
                requestDescription: document.getElementById('requestDescription') ? document.getElementById('requestDescription').value.trim() : ''
            };
            payments.push({ id: Date.now(), status: 'pending', ...data, ...requestExtra });
            localStorage.setItem('payments', JSON.stringify(payments));

            showMessage('تم إرسال طلب الدفعة بنجاح - الحالة: Pending');
            btn.innerHTML = original;
            btn.disabled = false;
            setTimeout(() => window.location.href = 'home.html', 1200);
        }, 1200);
    });

    cancelBtn.addEventListener('click', function() {
        if (confirm('هل تريد إلغاء الطلب؟')) {
            window.location.href = 'home.html';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupSidebarToggle();
    setupSidebar();
    
    // اجعل السايدبار مقفول افتراضيًا على الشاشات الكبيرة
    if (window.innerWidth > 767) {
        document.body.classList.add('sidebar-closed');
    }

    populateSuppliers();
    setupForm();
});

window.addEventListener('resize', function() {
    if (window.innerWidth > 767) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active');
    }
});