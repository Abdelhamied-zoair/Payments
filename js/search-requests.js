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

// الاعتماد على الزر العام من common.js عبر ensureMenuToggle

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

function formatDate(iso) {
    try { return new Date(iso).toLocaleDateString('ar-EG'); } catch { return iso; }
}

let fetchedRowsCache = [];
async function fetchRequests(filters) {
    const rows = await API.requests.list(filters || {});
    fetchedRowsCache = Array.isArray(rows) ? rows : [];
    return fetchedRowsCache;
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

    const rows = [];

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

    fetchRequests({ q, status, type, from, to }).then(renderTable).catch(err => {
        console.error('Load requests failed:', err);
        renderTable([]);
    });
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
            <td class="c-name group-basic">${r.request_title || r.project_name || '-'}</td>
            <td class="c-status group-basic">
                <span class="status-badge" style="background:${statusColor}; color:${statusTextColor}">${statusArabic}</span>
            </td>
            <td class="c-date group-details">${formatDate(r.created_at)}</td>
            <td class="c-type group-details">${r.payment_type || '-'}</td>
            <td class="c-amount group-details">${amountStr}</td>
            <td class="c-invoice group-details">${r.invoice_number || '-'}</td>
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
    ensureMenuToggle();
    setupSidebar();
    
    if (window.innerWidth > 767) {
        document.body.classList.add('sidebar-closed');
    }

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

    // اقتراحات تلقائية لحقل البحث الرئيسي
    const qInput = document.getElementById('q');
    const qSuggest = document.getElementById('qSuggest');
    const renderSuggest = (items) => {
        if (!qSuggest) return;
        if (!items.length) {
            qSuggest.innerHTML = '<div style="padding:10px; color:#666;">لا توجد اقتراحات</div>';
            qSuggest.style.display = 'block';
            return;
        }
        qSuggest.innerHTML = items.map(text => `<div class="sg-item" style="padding:10px 12px; border-bottom:1px solid #f2f2f2; cursor:pointer;">${text}</div>`).join('');
        qSuggest.style.display = 'block';
    };

    const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));
    const buildQSugg = (q) => {
        const rows = fetchedRowsCache;
        const query = (q||'').trim().toLowerCase();
        if (!query) { if (qSuggest) qSuggest.style.display = 'none'; return; }
        const fields = unique(rows.flatMap(r => [r.request_title, r.project_name, r.notes, r.invoice_number]));
        const matches = fields.filter(v => String(v).toLowerCase().includes(query)).slice(0, 10);
        renderSuggest(matches);
    };

    if (qInput && qSuggest) {
        qInput.addEventListener('input', () => buildQSugg(qInput.value));
        qInput.addEventListener('focus', () => { if (qInput.value) buildQSugg(qInput.value); });
        qInput.addEventListener('blur', () => setTimeout(() => { qSuggest.style.display = 'none'; }, 150));
        qSuggest.addEventListener('mousedown', (e) => { e.preventDefault(); });
        qSuggest.addEventListener('click', (e) => {
            const item = e.target.closest('.sg-item');
            if (!item) return;
            qInput.value = item.textContent.trim();
            qSuggest.style.display = 'none';
            applyFilters();
        });
    }
});

window.addEventListener('resize', function() {
    if (window.innerWidth > 767) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active');
    }
});


