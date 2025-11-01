function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('currentUser')) || { name: 'Admin', role: 'superuser', email: 'admin@example.com' };
    const nameEl = document.querySelector('.user-name');
    const avatarEl = document.querySelector('.user-avatar');
    if (nameEl) nameEl.textContent = userData.name;
    if (avatarEl) avatarEl.textContent = (userData.name||'A').charAt(0);
}

function setupSidebarToggle() {
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    menuToggle.addEventListener('click', function(){
        if (window.innerWidth <= 767) {
            document.querySelector('.sidebar').classList.toggle('active');
        } else {
            document.body.classList.toggle('sidebar-closed');
            this.innerHTML = document.body.classList.contains('sidebar-closed') ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-times"></i>';
        }
    });
    document.body.appendChild(menuToggle);
}

function injectUsersLinkIfAdmin() {
    const user = JSON.parse(localStorage.getItem('currentUser')) || { role: 'superuser' };
    if (!['admin', 'superuser'].includes((user.role||'').toLowerCase())) return;
    const menu = document.querySelector('.sidebar-menu');
    const link = document.createElement('a');
    link.className = 'menu-item';
    link.href = 'users.html';
    link.innerHTML = '<i class="fas fa-user-shield"></i><span>Users</span>';
    menu.insertBefore(link, menu.querySelector('.logout-item'));
}

function seedDemoUsersIfNeeded() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.length) return;
    users = [
        { email: 'admin@example.com', role: 'superuser' },
        { email: 'manager@example.com', role: 'admin' },
        { email: 'user1@example.com', role: 'user' },
        { email: 'approver@example.com', role: 'approver' }
    ];
    localStorage.setItem('users', JSON.stringify(users));
}

function seedDemoDataIfNeeded() {
    // notifications
    let notifs = JSON.parse(localStorage.getItem('notifications')) || [];
    if (!notifs.length) {
        notifs = [
            { title: 'طلب موافقة', from: 'user1@example.com', time: new Date().toISOString(), status: 'unread' },
            { title: 'إشعار نظام', from: 'system', time: new Date(Date.now()-3600000).toISOString(), status: 'read' }
        ];
        localStorage.setItem('notifications', JSON.stringify(notifs));
    }

    // supplier notes
    let notes = JSON.parse(localStorage.getItem('supplierNotes')) || [];
    if (!notes.length) {
        const suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
        for (let i=0;i<Math.min(6, suppliers.length||6);i++) {
            const s = suppliers[i] || { supplierName: 'مورد '+(i+1), taxNumber: 'TN'+(1000+i), bankName: 'Bank', ibanNumber: 'EG....' };
            notes.push({ supplierName: s.supplierName, taxNumber: s.taxNumber, bankName: s.bankName, ibanNumber: s.ibanNumber, note: 'تمت مراجعة بيانات المورد', createdAt: new Date(Date.now()-i*86400000).toISOString() });
        }
        localStorage.setItem('supplierNotes', JSON.stringify(notes));
    }
}

function renderMetrics() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const visits = Number(localStorage.getItem('siteVisits')||'0');
    const emailsCount = users.filter(u=>u.email).length;
    document.querySelector('#metricUsers .card-description').textContent = `إجمالي المستخدمين: ${users.length}`;
    document.querySelector('#metricEmails .card-description').textContent = `عدد الإيميلات: ${emailsCount}`;
    document.querySelector('#metricVisits .card-description').textContent = `مرات الدخول: ${visits}`;
}

function renderNotifications() {
    const notifs = JSON.parse(localStorage.getItem('notifications')) || [];
    const body = document.getElementById('notifTableBody');
    body.innerHTML = '';
    document.getElementById('notifCount').textContent = String(notifs.filter(n=>n.status==='unread').length);
    notifs.forEach(n => {
        const tr = document.createElement('tr');
        const badgeClass = n.status==='read' ? 'badge badge--ok' : 'badge badge--warn';
        tr.innerHTML = `<td>${n.title}</td><td>${n.from}</td><td>${new Date(n.time).toLocaleString('ar-EG')}</td><td><span class="${badgeClass}">${n.status}</span></td>`;
        body.appendChild(tr);
    });
}

function renderSupplierNotes() {
    const notes = JSON.parse(localStorage.getItem('supplierNotes')) || [];
    const body = document.getElementById('notesTableBody');
    body.innerHTML='';
    notes.forEach(n => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${n.supplierName||'-'}</td><td>${n.taxNumber||'-'}</td><td>${n.bankName||'-'}</td><td class="c-iban">${n.ibanNumber||'-'}</td><td>${n.note||'-'}</td><td>${new Date(n.createdAt).toLocaleDateString('ar-EG')}</td>`;
        body.appendChild(tr);
    });
}

// دالة للحصول على معلمات URL
function getUrlParams() {
    const params = {};
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    
    for (const [key, value] of urlParams) {
        params[key] = value;
    }
    
    return params;
}

document.addEventListener('DOMContentLoaded', function(){
    // count visits
    const visits = Number(localStorage.getItem('siteVisits')||'0')+1;
    localStorage.setItem('siteVisits', String(visits));

    loadUserData();
    
    // التحقق من وجود معلمة view في URL
    const urlParams = getUrlParams();
    if (urlParams.view === 'dashboard') {
        // عرض لوحة المعلومات فقط
        const dashboardSection = document.querySelector('.dashboard-section');
        const otherSections = document.querySelectorAll('.report-section:not(.dashboard-section)');
        
        if (dashboardSection) {
            dashboardSection.style.display = 'block';
        }
        
        if (otherSections) {
            otherSections.forEach(section => {
                section.style.display = 'none';
            });
        }
        document.querySelector('.content-header h1').textContent = 'لوحة المعلومات';
    } else if (urlParams.view === 'notes') {
        // عرض قسم الملاحظات فقط
        const notesSection = document.querySelector('.notes-section');
        const otherSections = document.querySelectorAll('.report-section:not(.notes-section)');
        
        if (notesSection) {
            notesSection.style.display = 'block';
        }
        
        if (otherSections) {
            otherSections.forEach(section => {
                section.style.display = 'none';
            });
        }
        document.querySelector('.content-header h1').textContent = 'الملاحظات';
    }
    setupSidebarToggle();
    injectUsersLinkIfAdmin();
    seedDemoUsersIfNeeded();
    seedDemoDataIfNeeded();
    renderMetrics();
    renderNotifications();
    renderSupplierNotes();

    if (window.innerWidth > 767) document.body.classList.add('sidebar-closed');

    document.getElementById('viewUsersBtn').addEventListener('click', ()=> window.location.href='users.html');
    document.getElementById('viewEmailsBtn').addEventListener('click', ()=> window.location.href='users.html');
    document.getElementById('viewVisitsBtn').addEventListener('click', ()=> alert('إجمالي الزيارات: '+(localStorage.getItem('siteVisits')||'0')));
});