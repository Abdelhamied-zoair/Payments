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

// دالة لإدارة فتح وإغلاق السايدبار
// الاعتماد على الزر العام من common.js عبر ensureMenuToggle

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
                    // الانتقال للصفحة المطلوبة
                    window.location.href = href;
                } else {
                    const label = this.querySelector('span') ? this.querySelector('span').textContent : this.textContent.trim();
                    showPageMessage(`فتح: ${label}`);
                }
            }
        });
    });
}

// دالة لإعداد البطاقات
function setupCards() {
    document.querySelectorAll('.card-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.card');
            const cardTitle = card.querySelector('.card-title').textContent;
            
            // تأثير النقر
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الفتح...';
            this.disabled = true;
            
            // تحديد الصفحة المستهدفة بناءً على عنوان البطاقة
            let targetPage = 'home.html';
            if (cardTitle === 'إضافة مورد') targetPage = 'add-supplier.html';
            else if (cardTitle === 'طلب دفعة') targetPage = 'add-payment.html';
            else if (cardTitle === 'البحث عن طلب') targetPage = 'search-requests.html';
            else if (cardTitle === 'البحث عن مورد') targetPage = 'search-suppliers.html';
            else if (cardTitle === 'تقرير') targetPage = 'report.html';
            
            // محاكاة فتح الصفحة
            setTimeout(() => {
                showPageMessage(`تم فتح: ${cardTitle}`);
                
                // الانتقال للصفحة
                window.location.href = targetPage;
            }, 1500);
        });
    });
}

// دالة لعرض رسائل الصفحة
const showPageMessage = (m) => showToast(m, 'success');

// دالة للبحث
function setupSearch() {
    const searchInput = document.querySelector('.search-box input');
    
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.trim();
            
            if (query.length > 2) {
                console.log(`Searching for: ${query}`);
            }
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    showPageMessage(`جاري البحث عن: ${query}`);
                }
            }
        });
    }
}

// دالة لإعداد الأيقونات
function setupIcons() {
    // أيقونة الإعدادات
    const settingsIcon = document.querySelector('.icon-item .fa-cog');
    if (settingsIcon) {
        settingsIcon.closest('.icon-item').addEventListener('click', function() {
            showPageMessage('فتح الإعدادات');
        });
    }
    
    // أيقونة الإشعارات
    const bellIcon = document.querySelector('.icon-item .fa-bell');
    if (bellIcon) {
        bellIcon.closest('.icon-item').addEventListener('click', function() {
            showPageMessage('عرض الإشعارات');
        });
    }
    
    // أيقونة الملف الشخصي
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', function() {
            showPageMessage('فتح الملف الشخصي');
        });
    }
}

// دالة تسجيل الخروج
function setupLogout() {
    const logoutBtn = document.querySelector('.logout-item');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('هل تريد تسجيل الخروج؟')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            }
        });
    }
}

// دالة لجعل اسم الموقع لينك
function setupBrandLink() {
    const brandLink = document.querySelector('.brand-link');
    if (brandLink) {
        brandLink.addEventListener('click', function(e) {
            e.preventDefault();
            showPageMessage('العودة للصفحة الرئيسية');
            // في التطبيق الحقيقي: window.location.href = 'home.html';
        });
    }
}

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupSidebar();
    setupCards();
    setupSearch();
    setupIcons();
    setupLogout();
    setupBrandLink();
    
    console.log('Home page loaded successfully');
    
    
});

// تحديث الواجهة عند تغيير حجم النافذة
