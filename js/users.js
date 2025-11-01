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
}

function setupSidebarToggle(){
    const btn = document.createElement('button'); btn.className='menu-toggle'; btn.innerHTML='<i class="fas fa-bars"></i>';
    btn.onclick = function(){ if (window.innerWidth<=767) document.querySelector('.sidebar').classList.toggle('active'); else { document.body.classList.toggle('sidebar-closed'); this.innerHTML = document.body.classList.contains('sidebar-closed')?'<i class="fas fa-bars"></i>':'<i class="fas fa-times"></i>'; }};
    document.body.appendChild(btn);
}

function renderUsers(){
    const body = document.getElementById('usersTableBody'); body.innerHTML='';
    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.forEach((u,idx)=>{
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${u.email}</td><td>${u.role}</td><td><button class="btn btn-secondary" data-i="${idx}"><i class=\"fas fa-trash\"></i> حذف</button></td>`;
        body.appendChild(tr);
    });
    Array.from(body.querySelectorAll('button')).forEach(btn=>{
        btn.addEventListener('click', function(){
            const i = Number(this.getAttribute('data-i'));
            const users = JSON.parse(localStorage.getItem('users')) || [];
            if (confirm('حذف المستخدم؟')) { users.splice(i,1); localStorage.setItem('users', JSON.stringify(users)); renderUsers(); }
        });
    });
}

function addUserFlow(){
    const email = prompt('أدخل الإيميل:'); if (!email) return;
    const role = prompt('أدخل الدور (user/admin/superuser/approver):','user'); if (!role) return;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    users.push({ email, role }); localStorage.setItem('users', JSON.stringify(users)); renderUsers();
}

document.addEventListener('DOMContentLoaded', function(){
    loadUserData(); setupSidebarToggle(); if (window.innerWidth>767) document.body.classList.add('sidebar-closed');
    // seed users if empty
    if (!(JSON.parse(localStorage.getItem('users'))||[]).length) {
        localStorage.setItem('users', JSON.stringify([
            { email:'admin@example.com', role:'superuser' },
            { email:'manager@example.com', role:'admin' },
            { email:'user1@example.com', role:'user' },
            { email:'approver@example.com', role:'approver' }
        ]));
    }
    renderUsers();
    document.getElementById('addUserBtn').addEventListener('click', addUserFlow);
});




