// ملف JavaScript الخاص بصفحة الإعدادات

document.addEventListener('DOMContentLoaded', function() {
    // تحميل بيانات المستخدم
    loadUserData();
    
    // إعداد أزرار الحفظ
    setupSaveButtons();
    
    // إعداد زر تغيير كلمة المرور
    setupChangePasswordButton();
    
    // إعداد الوضع الداكن
    setupDarkModeToggle();
    
    // تحميل الإعدادات المحفوظة
    loadSavedSettings();
});

// استخدام الدوال من common.js

// دالة لتحميل بيانات المستخدم من localStorage
function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('currentUser'));
    
    if (userData) {
        document.querySelector('.user-name').textContent = userData.name;
        document.querySelector('.user-avatar').textContent = userData.name.charAt(0);
        
        // إضافة بادجة الدور
        const roleBadge = document.createElement('span');
        roleBadge.className = 'role-badge';
        roleBadge.textContent = userData.role.toUpperCase();
        document.querySelector('.user-profile').appendChild(roleBadge);
    } else {
        // إذا مفيش بيانات مستخدم، ارجع لصفحة Login
        window.location.href = 'index.html';
    }
}

// إعداد أزرار الحفظ
function setupSaveButtons() {
    const saveButtons = document.querySelectorAll('.save-btn');
    
    saveButtons.forEach(button => {
        button.addEventListener('click', function() {
            // جمع البيانات من النموذج القريب
            const section = this.closest('.settings-card');
            const inputs = section.querySelectorAll('input, select');
            const sectionData = {};
            
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    sectionData[input.id] = input.checked;
                } else {
                    sectionData[input.id] = input.value;
                }
            });
            
            // حفظ البيانات (يمكن استخدام API أو localStorage)
            console.log('تم حفظ البيانات:', sectionData);
            
            // عرض رسالة نجاح
            showNotification('تم حفظ التغييرات بنجاح');
        });
    });
}

// إعداد زر تغيير كلمة المرور
function setupChangePasswordButton() {
    const changePasswordBtn = document.querySelector('.change-password-btn');
    
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            // يمكن هنا فتح نافذة منبثقة لتغيير كلمة المرور
            const currentPassword = prompt('أدخل كلمة المرور الحالية:');
            
            if (currentPassword) {
                const newPassword = prompt('أدخل كلمة المرور الجديدة:');
                
                if (newPassword) {
                    const confirmPassword = prompt('تأكيد كلمة المرور الجديدة:');
                    
                    if (newPassword === confirmPassword) {
                        // إرسال طلب لتغيير كلمة المرور
                        console.log('تم تغيير كلمة المرور بنجاح');
                        showNotification('تم تغيير كلمة المرور بنجاح');
                    } else {
                        showNotification('كلمات المرور غير متطابقة', 'error');
                    }
                }
            }
        });
    }
}

// إعداد خيار الوضع الداكن
function setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('dark-mode');
    
    if (darkModeToggle) {
        // تطبيق الوضع الداكن عند تحميل الصفحة إذا كان مفعلاً
        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        }
        
        // تبديل الوضع الداكن عند النقر على الخيار
        darkModeToggle.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('darkMode', 'false');
            }
        });
    }
}

// إعداد تبديل السايدبار
function setupSidebarToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            document.body.classList.toggle('sidebar-active');
        });
        
        // إغلاق السايدبار عند النقر خارجه في الشاشات الصغيرة
        document.addEventListener('click', function(event) {
            const isMobile = window.innerWidth < 992;
            const clickedOutsideSidebar = !sidebar.contains(event.target) && !menuToggle.contains(event.target);
            
            if (isMobile && clickedOutsideSidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                document.body.classList.remove('sidebar-active');
            }
        });
        
        // تعديل حالة السايدبار عند تغيير حجم النافذة
        window.addEventListener('resize', function() {
            if (window.innerWidth >= 992) {
                sidebar.classList.remove('active');
                document.body.classList.remove('sidebar-active');
            }
        });
    }
}

// تحميل الإعدادات المحفوظة
function loadSavedSettings() {
    // يمكن هنا استدعاء API لجلب الإعدادات المحفوظة
    // أو استخدام localStorage
    const savedSettings = localStorage.getItem('userSettings');
    
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // تطبيق الإعدادات المحفوظة
        for (const key in settings) {
            const element = document.getElementById(key);
            
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = settings[key];
                } else {
                    element.value = settings[key];
                }
            }
        }
    }
}

// عرض إشعار للمستخدم
function showNotification(message, type = 'success') {
    // إنشاء عنصر الإشعار
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // إضافة الإشعار للصفحة
    document.body.appendChild(notification);
    
    // إظهار الإشعار
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // إخفاء الإشعار بعد 3 ثوان
    setTimeout(() => {
        notification.classList.remove('show');
        
        // إزالة الإشعار من الصفحة بعد انتهاء الانيميشن
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// إضافة CSS للإشعارات
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background-color: #4caf50;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16);
            z-index: 1000;
            opacity: 0;
            transition: transform 0.3s, opacity 0.3s;
        }
        
        .notification.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        
        .notification.error {
            background-color: #f44336;
        }
    `;
    document.head.appendChild(style);
})();