// دالة لعرض الرسائل
function showAlert(message, type = 'error') {
    const alertDiv = document.getElementById('alertMessage');
    alertDiv.textContent = message;
    alertDiv.className = `alert ${type}`;
    alertDiv.style.display = 'block';
    
    // إخفاء الرسالة بعد 5 ثواني
    setTimeout(() => {
        alertDiv.style.display = 'none';
    }, 5000);
}

// تسجيل دخول محلي صارم لثلاثة إيميلات فقط وكلمة مرور واحدة
async function apiLogin(identifier, password) {
    const id = String(identifier||'').toLowerCase().trim();
    const allowed = {
        'anas@c4.sa': { role: 'admin', name: 'Anas' },
        'abdelhamid@c4.sa': { role: 'superuser', name: 'Abdelhamid' },
        'corecode@c4.sa': { role: 'user', name: 'Core Code' },
    };
    if (!allowed[id] || password !== 'admin789') {
        const err = new Error('unauthorized');
        err.code = 'UNAUTHORIZED';
        throw err;
    }
    const u = allowed[id];
    const user = { name: u.name, role: u.role, email: id };
    try { localStorage.removeItem('auth'); } catch(_) {}
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
}

// دالة التحقق من صحة البيانات
function validateForm(identifier, password) {
    if (!identifier || !password) {
        showAlert('من فضلك أكمل جميع الحقول');
        return false;
    }
    return true;
}

// event listener للفورم
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    
    // التحقق من البيانات
    if (!validateForm(email, password)) {
        return;
    }
    
    // عرض حالة التحميل
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جارٍ تسجيل الدخول...';
    
    try {
        const user = await apiLogin(email, password);
        if (user) {
            showAlert(`مرحبًا بعودتك، ${user.name}!`, 'success');
            setTimeout(() => { window.location.href = 'home.html'; }, 1200);
        }
    } catch (error) {
        showAlert('غير مصرح بالدخول. تأكد من البريد وكلمة المرور.');
        console.error('Login error:', error);
    } finally {
        // إخفاء حالة التحميل
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> دخول';
    }
});

// event listener لنسيت الباسوورد
document.getElementById('forgotPassword').addEventListener('click', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    
    if (!email) {
        showAlert('من فضلك أدخل بريدك الإلكتروني أولاً');
        document.getElementById('email').focus();
        return;
    }
    
    showAlert(`سيتم إرسال تعليمات إعادة تعيين كلمة المرور إلى: ${email}`, 'success');
});

// تأثيرات إضافية عند التركيز على الحقول
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// إدخال تلقائي للبيانات للتجربة (يمكن حذفها لاحقاً)
document.addEventListener('DOMContentLoaded', function() {
    // إضافة نص مساعد للإدخال
    // const emailInput = document.getElementById('email');
    // emailInput.placeholder = "أدخل أي بريد إلكتروني (مثال: test@test.com)";
    
    // const passwordInput = document.getElementById('password'); 
    // passwordInput.placeholder = "أدخل أي كلمة مرور (3 أحرف على الأقل)";
    
    console.log('Login page ready - يمكنك استخدام أي إيميل وباسوورد للتجربة');
});
