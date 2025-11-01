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
            this.innerHTML = document.body.classList.contains('sidebar-closed') ? '<i class="fas fa-bars"></i>' : '<i class="fas fa-times"></i>';
        }
    });
    document.body.appendChild(menuToggle);
}

// دالة لتحويل الحالة الإنجليزية إلى عربية
function getStatusArabic(status) {
    const statusMap = {
        'pending': 'معلق',
        'accepted': 'مقبول',
        'cancel': 'ملغي'
    };
    return statusMap[status] || status;
}

// دالة للحصول على لون الحالة
function getStatusColor(status) {
    const colorMap = {
        'pending': '#fef3c7', // أصفر فاتح
        'accepted': '#d1fae5', // أخضر فاتح
        'cancel': '#fee2e2'   // أحمر فاتح
    };
    return colorMap[status] || '#f3f4f6';
}

// دالة للحصول على لون النص للحالة
function getStatusTextColor(status) {
    const colorMap = {
        'pending': '#92400e', // بني داكن
        'accepted': '#065f46', // أخضر داكن
        'cancel': '#7f1d1d'   // أحمر داكن
    };
    return colorMap[status] || '#374151';
}

function seedDemoRequestsIfNeeded() {
    let payments = JSON.parse(localStorage.getItem('payments')) || [];
    if (payments.length >= 10) return; // عندك بيانات كفاية

    const statuses = ['pending', 'accepted', 'cancel'];
    const types = ['invoice', 'advance', 'other'];
    const names = ['طلب مشروع أ', 'دفعة مشروع ب', 'دفعة صيانة', 'طلب شراء', 'دفعة توريد', 'طلب عقد', 'دفعة معدات', 'دفعة مواد', 'طلب خدمة', 'دفعة مشروع ت'];

    for (let i = 0; i < 10; i++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const type = types[Math.floor(Math.random() * types.length)];
        const title = names[i % names.length];
        const createdAt = new Date(Date.now() - Math.floor(Math.random()*30)*24*60*60*1000).toISOString();
        payments.push({
            id: Date.now() + i,
            status,
            paymentType: type,
            projectName: `مشروع ${String.fromCharCode(65 + (i%26))}`,
            requestTitle: title,
            amount: Math.floor(Math.random()*9000)+1000,
            notes: '',
            createdAt
        });
    }
    localStorage.setItem('payments', JSON.stringify(payments));
}

function formatDate(iso) {
    try { return new Date(iso).toLocaleDateString('ar-EG'); } catch { return iso; }
}

function getAllRequests() {
    return JSON.parse(localStorage.getItem('payments')) || [];
}

function applyFilters() {
    const q = document.getElementById('q').value.trim().toLowerCase();
    let status = document.getElementById('status').value;
    const type = document.getElementById('paymentTypeFilter').value;
    const from = document.getElementById('dateFrom').value;
    const to = document.getElementById('dateTo').value;
    
    // التحقق من وجود معلمة status في URL
    const urlParams = getUrlParams();
    if (urlParams.status) {
        status = urlParams.status;
        // تحديث قيمة حقل التصفية في النموذج
        document.getElementById('status').value = status;
    }

    let rows = getAllRequests();

    if (q) {
        rows = rows.filter(r => (
            (r.requestTitle && r.requestTitle.toLowerCase().includes(q)) ||
            (r.projectName && r.projectName.toLowerCase().includes(q)) ||
            (r.notes && r.notes.toLowerCase().includes(q))
        ));
    }
    if (status) rows = rows.filter(r => r.status === status);
    if (type) rows = rows.filter(r => r.paymentType === type);

    if (from) {
        const fromTs = new Date(from).getTime();
        rows = rows.filter(r => new Date(r.createdAt).getTime() >= fromTs);
    }
    if (to) {
        const toTs = new Date(to).getTime();
        rows = rows.filter(r => new Date(r.createdAt).getTime() <= toTs);
    }

    renderTable(rows);
}

function renderTable(rows) {
    const tbody = document.querySelector('#requestsTable tbody');
    tbody.innerHTML = '';
    if (!rows.length) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.style.padding = '14px';
        td.style.textAlign = 'center';
        td.textContent = 'لا توجد نتائج.';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    rows.forEach(r => {
        const tr = document.createElement('tr');
        const amountStr = (typeof r.amount === 'number' && !isNaN(r.amount)) ? r.amount.toLocaleString('ar-EG') + ' ر.س' : '-';
        const statusArabic = getStatusArabic(r.status);
        const statusColor = getStatusColor(r.status);
        const statusTextColor = getStatusTextColor(r.status);
        
        tr.innerHTML = `
            <td class="c-name group-basic">${r.requestTitle || r.projectName || '-'}</td>
            <td class="c-status group-basic">
                <span class="status-badge" style="background:${statusColor}; color:${statusTextColor}">${statusArabic}</span>
            </td>
            <td class="c-date group-details">${formatDate(r.createdAt)}</td>
            <td class="c-type group-details">${r.paymentType || '-'}</td>
            <td class="c-amount group-details">${amountStr}</td>
            <td class="c-invoice group-details">${r.invoiceNumber || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// دالة لإعداد السايدبار
function setupSidebar() {
    // الحصول على معلمات URL لتحديد العنصر النشط
    const urlParams = getUrlParams();
    const currentStatus = urlParams.status;
    
    // إزالة النشاط من جميع العناصر
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
        item.classList.remove('is-active');
    });
    
    // إضافة النشاط للعنصر الحالي بناءً على الحالة
    if (currentStatus === 'accepted') {
        document.querySelector('a[href="search-requests.html?status=accepted"]').classList.add('is-active');
    } else if (currentStatus === 'pending') {
        document.querySelector('a[href="search-requests.html?status=pending"]').classList.add('is-active');
    } else if (currentStatus === 'cancel') {
        document.querySelector('a[href="search-requests.html?status=cancel"]').classList.add('is-active');
    }
    
    // إضافة event listeners للروابط
    document.querySelectorAll('.sidebar-menu .menu-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (!this.classList.contains('logout-item')) {
                e.preventDefault();
                document.querySelectorAll('.sidebar-menu .menu-item').forEach(i => i.classList.remove('is-active'));
                this.classList.add('is-active');
                
                // الانتقال للرابط
                const href = this.getAttribute('href');
                if (href) {
                    window.location.href = href;
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    setupSidebarToggle();
    setupSidebar();
    
    if (window.innerWidth > 767) {
        document.body.classList.add('sidebar-closed');
    }

    seedDemoRequestsIfNeeded();
    applyFilters();

    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('q').value = '';
        document.getElementById('status').value = '';
        document.getElementById('paymentTypeFilter').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        applyFilters();
    });

    // تبديل الأعمدة على الموبايل
    const table = document.getElementById('requestsTable');
    const btnBasic = document.getElementById('reqViewBasic');
    const btnDetails = document.getElementById('reqViewDetails');
    if (btnBasic && btnDetails) {
        btnBasic.addEventListener('click', () => { table.classList.remove('view-details'); });
        btnDetails.addEventListener('click', () => { table.classList.add('view-details'); });
    }
});

window.addEventListener('resize', function() {
    if (window.innerWidth > 767) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active');
    }
});


