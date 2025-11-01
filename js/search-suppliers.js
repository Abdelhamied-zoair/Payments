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

function applyFilters() {
    const q = document.getElementById('q').value.trim().toLowerCase();
    const bank = document.getElementById('bank').value.trim().toLowerCase();
    const from = document.getElementById('dateFrom').value;
    const to = document.getElementById('dateTo').value;

    let rows = getAllSuppliers();

    if (q) {
        rows = rows.filter(r => (
            (r.supplierName && r.supplierName.toLowerCase().includes(q)) ||
            (r.supplierEmail && r.supplierEmail.toLowerCase().includes(q)) ||
            (r.taxNumber && r.taxNumber.toLowerCase().includes(q)) ||
            (r.contactNumber && r.contactNumber.includes(q))
        ));
    }
    
    if (bank) {
        rows = rows.filter(r => r.bankName && r.bankName.toLowerCase().includes(bank));
    }

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
        td.colSpan = 5;
        td.style.padding = '20px';
        td.style.textAlign = 'center';
        td.style.color = '#666';
        td.textContent = 'لا توجد نتائج تطابق معايير البحث';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    rows.forEach(r => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="c-supp-name group-basic">
                <div style="font-weight: 600; color: #2c3e50;">${r.supplierName || '-'}</div>
                ${r.contactNumber ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">${r.contactNumber}</div>` : ''}
            </td>
            <td class="c-tax group-details">${r.taxNumber || '-'}</td>
            <td class="c-iban group-details">
                <span style="font-family: monospace; font-size: 12px;">${r.ibanNumber || '-'}</span>
            </td>
            <td class="c-bank group-basic">
                <span style="color: #3498db; font-weight: 500;">${r.bankName || '-'}</span>
            </td>
            <td class="c-email group-details">
                ${r.supplierEmail ? `<a href="mailto:${r.supplierEmail}" style="color: #e74c3c; text-decoration: none;">${r.supplierEmail}</a>` : '-'}
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
    setupSidebarToggle();
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