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

// زر السايدبار يُدار عبر ensureMenuToggle في common.js

function seedDemoSuppliersIfNeeded() {
    let suppliers = JSON.parse(localStorage.getItem('suppliers')) || [];
    if (suppliers.length >= 10) return;
    const banks = ['البنك الأهلي', 'بنك القاهرة', 'QNB', 'بنك مصر', 'ADIB'];
    const names = ['شركة ألف للتجارة', 'مؤسسة بيتا للمقاولات', 'تجارة جاما الدولية', 'حلول دلتا التقنية', 'مزود إبسيلون للخدمات', 'شركة أوميغا للتوريدات', 'توريدات فيجا', 'خدمات كابا المتكاملة', 'ألفا برو للحلول', 'سما التجارية'];
    
    for (let i = 0; i < 10; i++) {
        suppliers.push({
            id: Date.now() + i,
            supplierName: names[i % names.length],
            taxNumber: 'TN' + (1000000 + Math.floor(Math.random()*900000)).toString(),
            ibanNumber: 'EG' + (1000000000000000000000000 + Math.floor(Math.random()*900000000000000000000000)).toString().slice(0,24),
            bankName: banks[Math.floor(Math.random()*banks.length)],
            supplierEmail: 'supplier' + (i+1) + '@example.com',
            supplierAddress: `عنوان المورد ${i+1} - القاهرة`,
            contactNumber: `01${Math.floor(Math.random()*90000000)+10000000}`,
            createdAt: new Date(Date.now() - Math.floor(Math.random()*30)*24*60*60*1000).toISOString()
        });
    }
    localStorage.setItem('suppliers', JSON.stringify(suppliers));
}

function formatDate(iso) {
    try { 
        return new Date(iso).toLocaleDateString('ar-EG'); 
    } catch { 
        return iso; 
    }
}

function getAllSuppliers() {
    return JSON.parse(localStorage.getItem('suppliers')) || [];
}

async function applyFilters() {
    const q = document.getElementById('q').value.trim();
    const bank = document.getElementById('bank').value.trim();
    const from = document.getElementById('dateFrom').value;
    const to = document.getElementById('dateTo').value;
    try {
        const rows = await API.suppliers.list({ q, bank, dateFrom: from, dateTo: to });
        renderTable(rows);
    } catch (err) {
        console.error('Load suppliers failed:', err);
        showMessage('تعذر تحميل الموردين، حاول مرة أخرى.', 'error');
    }
}

function renderTable(rows) {
    const tbody = document.querySelector('#requestsTable tbody');
    tbody.innerHTML = '';
    
    if (!Array.isArray(rows) || !rows.length) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = 6;
        td.style.padding = '20px';
        td.style.textAlign = 'center';
        td.style.color = '#666';
        td.textContent = 'لا توجد نتائج تطابق معايير البحث';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    rows.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="c-supp-name group-basic">
                <div style="font-weight: 600; color: #2c3e50;">${s.name || '-'}</div>
                ${s.phone ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">${s.phone}</div>` : ''}
            </td>
            <td class="c-tax group-details">${s.tax_number || '-'}</td>
            <td class="c-iban group-details">
                <span style="font-family: monospace; font-size: 12px;">${s.iban || '-'}</span>
            </td>
            <td class="c-bank group-basic">
                <span style="color: #3498db; font-weight: 500;">${s.bank_name || '-'}</span>
            </td>
            <td class="c-email group-details">
                ${s.email ? `<a href="mailto:${s.email}" style="color: #e74c3c; text-decoration: none;">${s.email}</a>` : '-'}
            </td>
            <td class="c-actions">
                <button class="btn btn-secondary btn-edit" data-id="${s.id}" title="تعديل"><i class="fas fa-edit"></i></button>
                <button class="btn btn-secondary btn-delete" data-id="${s.id}" title="حذف"><i class="fas fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// دالة لعرض رسائل للمستخدم
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
        padding: 12px 20px;
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

// دالة للبحث في الحقول
function setupSearch() {
    const searchInput = document.querySelector('.search-box input');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    showMessage(`جاري البحث عن: ${query}`);
                    applyFilters();
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    ensureMenuToggle();
    setupSidebar();
    
    if (window.innerWidth > 767) {
        document.body.classList.add('sidebar-closed');
    }

    seedDemoSuppliersIfNeeded();
    applyFilters();

    // إعداد أزرار البحث
    document.getElementById('applyFilters').addEventListener('click', function() {
        showMessage('جاري تطبيق الفلاتر...');
        applyFilters();
    });
    
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.getElementById('q').value = '';
        document.getElementById('bank').value = '';
        document.getElementById('dateFrom').value = '';
        document.getElementById('dateTo').value = '';
        showMessage('تم مسح جميع الفلاتر');
        applyFilters();
    });

    // تبديل الأعمدة على الموبايل
    const table = document.getElementById('requestsTable');
    const btnBasic = document.getElementById('supViewBasic');
    const btnDetails = document.getElementById('supViewDetails');
    
    if (btnBasic && btnDetails) {
        btnBasic.addEventListener('click', () => { 
            table.classList.remove('view-details');
            btnBasic.classList.add('active');
            btnDetails.classList.remove('active');
            showMessage('عرض البيانات الأساسية');
        });
        
        btnDetails.addEventListener('click', () => { 
            table.classList.add('view-details');
            btnDetails.classList.add('active');
            btnBasic.classList.remove('active');
            showMessage('عرض كافة التفاصيل');
        });
        
        // تعيين الوضع الأساسي كافتراضي
        btnBasic.classList.add('active');
    }

    // إعداد البحث في شريط البحث الرئيسي
    setupSearch();
    
    console.log('Search Suppliers page loaded successfully');

    // اقتراحات تلقائية
    const qInput = document.getElementById('q');
    const bankInput = document.getElementById('bank');
    const qSuggest = document.getElementById('qSuggest');
    const bankSuggest = document.getElementById('bankSuggest');

    const renderSuggest = (container, items) => {
        if (!container) return;
        if (!items.length) {
            container.innerHTML = '<div style="padding:10px; color:#666;">لا توجد اقتراحات</div>';
            container.style.display = 'block';
            return;
        }
        container.innerHTML = items.map(text => `<div class="sg-item" style="padding:10px 12px; border-bottom:1px solid #f2f2f2; cursor:pointer;">${text}</div>`).join('');
        container.style.display = 'block';
    };

    const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));

    const buildQSugg = (q) => {
        const rows = getAllSuppliers();
        const query = (q||'').trim().toLowerCase();
        if (!query) { if (qSuggest) qSuggest.style.display = 'none'; return; }
        const fields = unique(rows.flatMap(r => [r.supplierName, r.supplierEmail, r.taxNumber, r.contactNumber]));
        const matches = fields.filter(v => String(v).toLowerCase().includes(query)).slice(0, 10);
        renderSuggest(qSuggest, matches);
    };

    const buildBankSugg = (q) => {
        const rows = getAllSuppliers();
        const query = (q||'').trim().toLowerCase();
        if (!query) { if (bankSuggest) bankSuggest.style.display = 'none'; return; }
        const fields = unique(rows.map(r => r.bankName));
        const matches = fields.filter(v => String(v).toLowerCase().includes(query)).slice(0, 10);
        renderSuggest(bankSuggest, matches);
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

    if (bankInput && bankSuggest) {
        bankInput.addEventListener('input', () => buildBankSugg(bankInput.value));
        bankInput.addEventListener('focus', () => { if (bankInput.value) buildBankSugg(bankInput.value); });
        bankInput.addEventListener('blur', () => setTimeout(() => { bankSuggest.style.display = 'none'; }, 150));
        bankSuggest.addEventListener('mousedown', (e) => { e.preventDefault(); });
        bankSuggest.addEventListener('click', (e) => {
            const item = e.target.closest('.sg-item');
            if (!item) return;
            bankInput.value = item.textContent.trim();
            bankSuggest.style.display = 'none';
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

// دالة لإضافة مورد جديد من صفحة البحث
function addNewSupplier() {
    window.location.href = 'add-supplier.html';
}

// دالة لتصدير البيانات
function exportSuppliersData() {
    const suppliers = getAllSuppliers();
    if (suppliers.length === 0) {
        showMessage('لا توجد بيانات للتصدير', 'error');
        return;
    }
    
    showMessage('جاري تحضير بيانات التصدير...');
    
    // محاكاة عملية التصدير
    setTimeout(() => {
        showMessage(`تم تصدير بيانات ${suppliers.length} مورد بنجاح`);
    }, 2000);
}