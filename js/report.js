function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('currentUser')) || { name: 'Admin', role: 'superuser', email: 'admin@example.com' };
    const nameEl = document.querySelector('.user-name');
    const avatarEl = document.querySelector('.user-avatar');
    if (nameEl) nameEl.textContent = userData.name;
    if (avatarEl) avatarEl.textContent = (userData.name||'A').charAt(0);
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
        { email: 'c4payments@gmail.com', role: 'superuser' }
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

async function renderMetrics() {
    try {
        const m = await API.metrics.get();
        const usersEl = document.querySelector('#metricUsers .card-description');
        const visitsEl = document.querySelector('#metricVisits .card-description');
        if (usersEl) usersEl.textContent = `إجمالي المستخدمين: ${m.usersCount}`;
        if (visitsEl) visitsEl.textContent = `مرات الدخول: ${m.visits}`;
    } catch(_) {}
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

async function renderRequestsData() {
    const body = document.getElementById('requestsDataBody');
    if (!body) return;
    body.innerHTML = '';
    try {
        const rows = await API.requests.list();
        rows.forEach(r => {
            const title = r.request_title || r.project_name || '-';
            const amountStr = (typeof r.amount === 'number' && !isNaN(r.amount)) ? r.amount.toLocaleString('ar-EG') : '-';
            const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString('ar-EG') : '-';
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${title}</td><td>${r.supplier_name||r.supplier_id||'-'}</td><td>${r.payment_type||'-'}</td><td>${amountStr}</td><td>${r.status||'-'}</td><td>${dateStr}</td>`;
            body.appendChild(tr);
        });
    } catch(e) {
        console.error('Load requests metrics failed:', e);
    }
}

async function renderSuppliersData() {
    const body = document.getElementById('suppliersDataBody');
    if (!body) return;
    body.innerHTML = '';
    try {
        const rows = await API.suppliers.list();
        rows.forEach(s => {
            const tr = document.createElement('tr');
            const dateStr = s.created_at ? new Date(s.created_at).toLocaleDateString('ar-EG') : '-';
            tr.innerHTML = `<td>${s.name||'-'}</td><td>${s.email||'-'}</td><td>${s.phone||'-'}</td><td>${s.bank_name||'-'}</td><td class="c-iban">${s.iban||'-'}</td><td>${s.tax_number||'-'}</td><td>${dateStr}</td>`;
            body.appendChild(tr);
        });
    } catch(e) {
        console.error('Load suppliers metrics failed:', e);
    }
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
    // count visits (server-side)
    API.metrics.visit().catch(()=>{});

    loadUserData();
    
    const urlParams = getUrlParams();
    if (urlParams.view === 'dashboard') {
        const summary = document.querySelector('.dashboard-summary');
        if (summary) summary.style.display = 'block';
        renderMetrics();
    }
    renderSupplierNotes();
    renderRequestsData();
    renderSuppliersData();

    // لا أحداث بطاقات الإحصائيات بعد إزالة الكروت
});
