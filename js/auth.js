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

// دالة لمحاكاة عملية الدخول
async function simulateLogin(email, password) {
    // في التطبيق الحقيقي، هنا بتكون API call
    return new Promise((resolve) => {
        setTimeout(() => {
            // بيانات الدخول الثابتة - أي إيميل وباسوورد هيشتغلو
            if (email && password) {
                // تحديد نوع المستخدم حسب الإيميل
                let role = 'user';
                let name = 'User';
                
                if (email.includes('admin') || email.includes('super')) {
                    role = 'super';
                    name = 'Super Admin';
                } else if (email.includes('pro')) {
                    role = 'pro'; 
                    name = 'Pro User';
                } else {
                    // يأخذ الجزء الأول من الإيميل كاسم
                    name = email.split('@')[0];
                    name = name.charAt(0).toUpperCase() + name.slice(1);
                }
                
                const user = {
                    email: email,
                    name: name,
                    role: role
                };
                resolve(user);
            } else {
                resolve(null);
            }
        }, 1000);
    });
}

// دالة التحقق من صحة البيانات
function validateForm(email, password) {
    if (!email || !password) {
        showAlert('Please fill in all fields');
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showAlert('Please enter a valid email address');
        return false;
    }
    
    if (password.length < 3) {
        showAlert('Password must be at least 3 characters long');
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
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> LOGGING IN...';
    
    try {
        // محاكاة عملية الدخول
        const user = await simulateLogin(email, password);
        
        if (user) {
            showAlert(`Welcome back, ${user.name}!`, 'success');
            
            // حفظ بيانات المستخدم في localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // التوجيه للصفحة الرئيسية بعد ثانيتين
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 2000);
        } else {
            showAlert('Invalid email or password');
        }
    } catch (error) {
        showAlert('An error occurred. Please try again.');
        console.error('Login error:', error);
    } finally {
        // إخفاء حالة التحميل
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> LOG IN';
    }
});

// event listener لنسيت الباسوورد
document.getElementById('forgotPassword').addEventListener('click', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    
    if (!email) {
        showAlert('Please enter your email first');
        document.getElementById('email').focus();
        return;
    }
    
    showAlert(`Password reset instructions will be sent to: ${email}`, 'success');
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