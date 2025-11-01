// دالة لتحميل بيانات المستخدم
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    
    if (userData) {
        document.querySelector('.user-name').textContent = userData.name;
        document.querySelector('.user-avatar').textContent = userData.name.charAt(0);
    } else {
        window.location.href = 'index.html';
    }
}

// زر فتح/غلق السايدبار
function setupSidebarToggle() {
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.setAttribute('aria-label', 'Toggle sidebar');

    menuToggle.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        const body = document.body;

        if (window.innerWidth <= 767) {
            sidebar.classList.toggle('active');
        } else {
            body.classList.toggle('sidebar-closed');
            if (body.classList.contains('sidebar-closed')) {
                this.innerHTML = '<i class="fas fa-bars"></i>';
            } else {
                this.innerHTML = '<i class="fas fa-times"></i>';
            }
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
        const errorElement = document.getElementById(field.id + 'Error');
        
        if (!input.value.trim()) {
            errorElement.textContent = `${field.name} مطلوب`;
            errorElement.style.display = 'block';
            input.style.borderColor = '#e74c3c';
            isValid = false;
        } else {
            errorElement.style.display = 'none';
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
        supplierAddress: document.getElementById('supplierAddress').value.trim(),
        supplierEmail: document.getElementById('supplierEmail').value.trim(),
        contactNumber: document.getElementById('contactNumber').value.trim(),
        createdAt: new Date().toISOString()
    };
    
    // عرض حالة التحميل
    const submitBtn = document.querySelector('.btn-primary');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإضافة...';
    submitBtn.disabled = true;
    
    // محاكاة إرسال البيانات (في التطبيق الحقيقي بتكون API call)
    setTimeout(() => {
        // حفظ البيانات في localStorage (مؤقت)
        const existingSuppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
        existingSuppliers.push({
            id: Date.now(),
            ...formData
        });
        localStorage.setItem('suppliers', JSON.stringify(existingSuppliers));
        
        // عرض رسالة النجاح
        showMessage('تم إضافة المورد بنجاح!');
        
        // إعادة الزر لحالته الطبيعية
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // إعادة توجيه بعد ثانيتين
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 2000);
        
    }, 1500);
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
    
    form.addEventListener('submit', handleFormSubmit);
    cancelBtn.addEventListener('click', handleCancel);
    
    // إضافة تحقق فوري للحقول المطلوبة
    const requiredInputs = document.querySelectorAll('.required input');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const errorElement = document.getElementById(this.id + 'Error');
            if (!this.value.trim()) {
                errorElement.textContent = 'هذا الحقل مطلوب';
                errorElement.style.display = 'block';
                this.style.borderColor = '#e74c3c';
            } else {
                errorElement.style.display = 'none';
                this.style.borderColor = '#e1e1e1';
            }
        });
        
        input.addEventListener('input', function() {
            const errorElement = document.getElementById(this.id + 'Error');
            if (this.value.trim()) {
                errorElement.style.display = 'none';
                this.style.borderColor = '#e1e1e1';
            }
        });
    });
}

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupEventListeners();
    setupSidebarToggle();
    setupSidebar();
    
    // اجعل السايدبار مقفول افتراضيًا على الشاشات الكبيرة
    if (window.innerWidth > 767) {
        document.body.classList.add('sidebar-closed');
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }
    
    console.log('Add Supplier page loaded');
});

// حافظ على حالة الأيقونة في الريسايز
window.addEventListener('resize', function() {
    if (window.innerWidth > 767) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active');
        const menuToggle = document.querySelector('.menu-toggle');
        if (menuToggle) {
            if (document.body.classList.contains('sidebar-closed')) {
                menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            } else {
                menuToggle.innerHTML = '<i class="fas fa-times"></i>';
            }
        }
    }
});