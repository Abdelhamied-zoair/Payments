function loadUserData(){
  const u = JSON.parse(localStorage.getItem('currentUser')) || { name:'Admin' };
  const nameEl = document.querySelector('.user-name');
  const avEl = document.querySelector('.user-avatar');
  if (nameEl) nameEl.textContent = u.name;
  if (avEl) avEl.textContent = (u.name||'A').charAt(0);
}

function showToast(m, t){
  const d = document.createElement('div');
  d.textContent = m;
  d.style.cssText = 'position:fixed;top:100px;left:50%;transform:translateX(-50%);background:'+(t==='error'?'#e74c3c':'#27ae60')+';color:#fff;padding:12px 20px;border-radius:8px;box-shadow:0 6px 18px rgba(0,0,0,.2);z-index:10000;font-weight:500';
  document.body.appendChild(d);
  setTimeout(()=>{ d.style.opacity='0'; d.style.transition='opacity .4s'; setTimeout(()=>document.body.contains(d)&&document.body.removeChild(d),400); },2500);
}

async function loadNotifications(){
  try {
    const rows = await API.notifications.list();
    const badge = document.getElementById('notifBadge');
    if (badge) badge.textContent = String((rows||[]).filter(n=>n.status==='pending').length);
    renderTable(rows||[]);
  } catch(e){
    console.error('Load notifications failed:', e);
    renderTable([]);
  }
}

function renderTable(rows){
  const tbody = document.querySelector('#notificationsTable tbody');
  tbody.innerHTML='';
  rows.forEach(n=>{
    const tr = document.createElement('tr');
    const statusColor = n.status==='approved'?'#d1fae5':(n.status==='rejected'?'#fee2e2':'#fef3c7');
    const statusText = n.status==='approved'?'مقبول':(n.status==='rejected'?'مرفوض':'معلق');
    const typeText = n.type==='supplier'?'مورد':(n.type==='request'?'طلب دفعة':'-');
    const dateStr = n.created_at ? new Date(n.created_at).toLocaleString('ar-EG') : '-';
    const actions = (n.status==='pending') ? `<button class="btn btn-primary" data-act="accept" data-id="${n.id}"><i class="fas fa-check"></i> قبول</button>
      <button class="btn btn-secondary" data-act="reject" data-id="${n.id}"><i class="fas fa-times"></i> رفض</button>` : '';
    tr.innerHTML = `<td>${n.title||'-'}</td><td>${typeText}</td><td>${n.from||'-'}</td><td><span class="status-badge" style="background:${statusColor}">${statusText}</span></td><td>${dateStr}</td><td>${actions}</td>`;
    tbody.appendChild(tr);
  });
  Array.from(tbody.querySelectorAll('button[data-id]')).forEach(btn=>{
    btn.addEventListener('click', async function(){
      const id = this.getAttribute('data-id');
      const act = this.getAttribute('data-act');
      try {
        const updated = await API.notifications.update(id, { decision: act });
        showToast(act==='accept'?'تم القبول':'تم الرفض');
        if (updated?.type==='supplier' && updated?.supplier_id) window.location.href='search-suppliers.html';
        else if (updated?.type==='request') window.location.href='search-requests.html';
        else loadNotifications();
      } catch(e){
        console.error('Decision failed:', e);
        showToast('تعذر تنفيذ الإجراء','error');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', function(){
  loadUserData();
  if (window.innerWidth>767) document.body.classList.add('sidebar-closed');
  loadNotifications();
});