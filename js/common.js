// Inject Users link in sidebar for admin/superuser across pages
(function(){
    document.addEventListener('DOMContentLoaded', function(){
        try {
            // اجعل المستخدم Admin افتراضيًا لو مفيش مستخدم مسجل
            let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
            if (!currentUser) {
                currentUser = { name: 'Admin', email: 'admin@example.com', role: 'superuser' };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            const role = (currentUser && currentUser.role ? currentUser.role : 'superuser').toLowerCase();
            if (!['admin','superuser'].includes(role)) return;
            const menu = document.querySelector('.sidebar-menu');
            if (!menu) return;
            if (menu.querySelector('a.menu-item[href="users.html"]')) return;
            const link = document.createElement('a');
            link.className = 'menu-item';
            link.href = 'users.html';
            link.innerHTML = '<i class="fas fa-user-shield"></i><span>Users</span>';
            const logout = menu.querySelector('.logout-item');
            if (logout) menu.insertBefore(link, logout); else menu.appendChild(link);
        } catch(e) { /* ignore */ }
        
        // إعداد تبديل السايدبار في جميع الصفحات
        setupSidebarToggle();
    });
})();

// دالة لإدارة فتح وإغلاق السايدبار في جميع الصفحات
function setupSidebarToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    if (!menuToggle) return;
    
    // إضافة الحدث مباشرة عند التحميل
    toggleSidebar(menuToggle);
    
    // إضافة مستمع الحدث للنقرات المستقبلية
    menuToggle.addEventListener('click', function() {
        toggleSidebar(this);
    });
    
    // إضافة مستمع لتغيير حجم النافذة
    window.addEventListener('resize', function() {
        adjustSidebarForScreenSize();
    });
    
    // ضبط السايدبار حسب حجم الشاشة عند التحميل
    adjustSidebarForScreenSize();
}

// دالة مساعدة لتبديل حالة السايدبار
function toggleSidebar(toggleButton) {
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;
    
    if (window.innerWidth <= 767) {
        // في الجوال، يفتح ويقفل ك overlay
        sidebar.classList.toggle('active');
    } else {
        // في الشاشات الكبيرة، يفتح ويقفل بشكل عادي
        body.classList.toggle('sidebar-closed');
        
        // تغيير الأيقونة
        if (body.classList.contains('sidebar-closed')) {
            toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
        } else {
            toggleButton.innerHTML = '<i class="fas fa-times"></i>';
        }
    }
}

// دالة لضبط السايدبار حسب حجم الشاشة
function adjustSidebarForScreenSize() {
    const sidebar = document.querySelector('.sidebar');
    const body = document.body;
    
    if (window.innerWidth <= 767) {
        // في الشاشات الصغيرة، تأكد من إغلاق السايدبار افتراضيًا
        sidebar.classList.remove('active');
    }
}


