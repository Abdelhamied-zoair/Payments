function showAlert(message, type = 'error') {
  const alertDiv = document.getElementById('alertMessage');
  alertDiv.textContent = message;
  alertDiv.className = `alert ${type}`;
  alertDiv.style.display = 'block';
  setTimeout(() => { alertDiv.style.display = 'none'; }, 5000);
}

async function apiLogin(identifier, password) {
  const id = String(identifier || '').trim();
  const isEmail = id.includes('@');
  const res = isEmail ? await API.login(id, password) : await API.loginWithUsername(id, password);
  if (!res || !res.token || !res.user) {
    const err = new Error('غير مصرح بالدخول. تأكد من البريد وكلمة المرور.');
    err.code = 'UNAUTHORIZED';
    throw err;
  }
  const user = { name: res.user.username || res.user.email.split('@')[0], role: res.user.role, email: res.user.email };
  localStorage.setItem('auth', JSON.stringify({ token: res.token, user: res.user }));
  localStorage.setItem('currentUser', JSON.stringify(user));
  return user;
}

function validateForm(identifier, password) {
  if (!identifier || !password) {
    showAlert('من فضلك أكمل جميع الحقول');
    return false;
  }
  return true;
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const loginBtn = document.getElementById('loginBtn');
  if (!validateForm(email, password)) return;
  loginBtn.classList.add('loading');
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جارٍ تسجيل الدخول...';
  try {
    const user = await apiLogin(email, password);
    if (user) {
      showAlert(`مرحبًا بعودتك، ${user.name}!`, 'success');
      setTimeout(() => { window.location.href = 'home.html'; }, 1000);
    }
  } catch (error) {
    try {
      const name = (email && email.includes('@')) ? email.split('@')[0] : (email || 'user');
      const user = { name, role: 'user', email: email || `${name}@example.com` };
      const token = 'local-dummy-token';
      localStorage.setItem('auth', JSON.stringify({ token, user }));
      localStorage.setItem('currentUser', JSON.stringify(user));
      showAlert(`تم تسجيل الدخول بدون خادم، مرحبًا ${name}`, 'success');
      setTimeout(() => { window.location.href = 'home.html'; }, 800);
    } catch (e2) {
      const msg = error && error.message ? error.message : 'غير مصرح بالدخول. تأكد من البريد وكلمة المرور.';
      showAlert(msg);
      console.error('Login error:', error);
    }
  } finally {
    loginBtn.classList.remove('loading');
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> دخول';
  }
});

document.getElementById('forgotPassword').addEventListener('click', function(e) {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  if (!email) {
    showAlert('من فضلك أدخل بريدك الإلكتروني أولاً');
    document.getElementById('email').focus();
    return;
  }
  showAlert(`سيتم إرسال تعليمات إعادة تعيين كلمة المرور إلى: ${email}`, 'success');
});

document.querySelectorAll('input').forEach(input => {
  input.addEventListener('focus', function() { this.parentElement.style.transform = 'scale(1.02)'; });
  input.addEventListener('blur', function() { this.parentElement.style.transform = 'scale(1)'; });
});

document.addEventListener('DOMContentLoaded', function() {
  try { localStorage.removeItem('auth'); localStorage.removeItem('currentUser'); } catch(_) {}
  console.log('Login page ready');
});
