function loadUserData() {
    const user = JSON.parse(localStorage.getItem('currentUser')) || { role: 'superuser', name: 'Admin', email:'admin@example.com' };
    const nameEl = document.querySelector('.user-name'); const av = document.querySelector('.user-avatar');
    if (nameEl) nameEl.textContent = user.name; if (av) av.textContent = (user.name||'A').charAt(0);
    // صلاحيات الصفحة
    const role = (user.role||'').toLowerCase();
    if (!['admin','superuser'].includes(role)) {
        alert('لا تملك صلاحية الوصول لهذه الصفحة');
        window.location.href = 'home.html';
    }

    const addBtn = document.getElementById('addUserBtn');
    const isAnasAdmin = String(user.email||'').toLowerCase()==='anas@c4.sa' && role==='admin';
    if (addBtn && !isAnasAdmin) {
        addBtn.setAttribute('disabled','true');
        addBtn.innerHTML = '<i class="fas fa-lock"></i> غير مسموح بإضافة مستخدم';
    }
}

// زر السايدبار يُدار عبر ensureMenuToggle في common.js

function setupSidebar(){
    const items = document.querySelectorAll('.sidebar-menu .menu-item');
    items.forEach(item => {
        item.addEventListener('click', function(e){
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

async function renderUsers(){
    const body = document.getElementById('usersTableBody'); body.innerHTML='';
    let users = [];
    try { users = await API.admin.users(); } catch(_) { users = []; }
    users.forEach((u)=>{
        const tr = document.createElement('tr');
        const roleBadge = `<span class="badge role-badge">${u.role}</span>`;
        const isAnasAdmin = String(u.email||'').toLowerCase()==='anas@c4.sa' && String(u.role||'').toLowerCase()==='admin';
        const actionBtn = !isAnasAdmin 
            ? `<button class="btn btn-secondary" data-id="${u.id}"><i class=\"fas fa-trash\"></i> حذف</button>`
            : `<button class="btn btn-secondary" disabled title="لا يمكن حذف الأدمن"><i class=\"fas fa-lock\"></i> محمي</button>`;
        tr.innerHTML = `<td class="c-email">${u.email||''}</td><td>${roleBadge}</td><td>${actionBtn}</td>`;
        body.appendChild(tr);
    });
    Array.from(body.querySelectorAll('button[data-id]')).forEach(btn=>{
        btn.addEventListener('click', async function(){
            const id = Number(this.getAttribute('data-id'));
            if (!confirm('حذف المستخدم؟')) return;
            try { await API.admin.removeUser(id); await renderUsers(); } catch(e){ alert('تعذر حذف المستخدم'); }
        });
    });
}

async function addUserFlow(){
    const section = document.getElementById('addUserSection');
    if (section) section.style.display = 'block';
    const submitBtn = document.getElementById('addUserSubmitBtn');
    if (!submitBtn) return;
    submitBtn.addEventListener('click', async function(){
        const name = (document.getElementById('new-user-name')||{}).value?.trim();
        const email = (document.getElementById('new-user-email')||{}).value?.trim();
        const password = (document.getElementById('new-user-password')||{}).value || '';
        const roleSel = document.getElementById('new-user-role');
        const role = roleSel ? roleSel.value : 'user';
        if (!name || !email || !password) { return alert('أكمل جميع الحقول'); }
        try {
            await API.register({ username: name, email, password, role });
            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (!users.some(u=>String(u.email||'').toLowerCase()===String(email).toLowerCase())) {
                users.push({ email, role }); localStorage.setItem('users', JSON.stringify(users));
            }
            renderUsers();
            alert('تمت إضافة المستخدم');
        } catch(e){
            console.error(e);
            alert('تعذر إضافة المستخدم');
        }
    }, { once: true });
}

document.addEventListener('DOMContentLoaded', function(){
    loadUserData();
    setupSidebar();
    renderUsers();
    const addBtn = document.getElementById('addUserBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function(){
            const user = JSON.parse(localStorage.getItem('currentUser')) || {};
            const isAnasAdmin = String(user.email||'').toLowerCase()==='anas@c4.sa' && String(user.role||'').toLowerCase()==='admin';
            if (!isAnasAdmin) return alert('مسموح فقط للأدمن anas@c4.sa إضافة مستخدم');
            addUserFlow();
        });
    }
});




