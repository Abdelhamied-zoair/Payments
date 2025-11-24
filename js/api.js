// Simple REST API helper with JWT auth and query params
(() => {
  const API_BASE = (() => {
    const saved = localStorage.getItem('apiBase');
    if (saved) return saved;
    const origin = (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000');
    if (origin.includes('4000') || origin.includes('4001')) return origin;
    return 'http://localhost:4000';
  })();

  async function request(path, options = {}) {
    const { method = 'GET', headers = {}, body = null, params = {} } = options;
    const url = new URL(API_BASE + path);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    });

    const auth = JSON.parse(localStorage.getItem('auth') || '{}');
    const finalHeaders = { 'Content-Type': 'application/json', ...headers };
    if (auth?.token) finalHeaders['Authorization'] = 'Bearer ' + auth.token;

    const res = await fetch(url.toString(), {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : null,
    });

    let data = null;
    try { data = await res.json(); } catch (e) { /* ignore */ }

    if (!res.ok) {
      const hasAuth = !!finalHeaders['Authorization'];
      if (res.status === 401 && hasAuth) {
        window.location.href = 'index.html';
      }
      const errMsg = (data && (data.error || data.message)) || 'Request failed';
      throw new Error(errMsg);
    }
    return data;
  }

  const API = {
    login: (email, password) => request('/auth/login', {
      method: 'POST',
      body: { email, password },
    }),
    loginWithUsername: (username, password) => request('/auth/login', {
      method: 'POST',
      body: { username, password },
    }),
    register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
    suppliers: {
      list: (params = {}) => request('/suppliers', { params }),
      get: (id) => request(`/suppliers/${id}`),
      create: (payload) => request('/suppliers', { method: 'POST', body: payload }),
      update: (id, payload) => request(`/suppliers/${id}`, { method: 'PUT', body: payload }),
      remove: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),
    },
    requests: {
      list: (params = {}) => request('/requests', { params }),
      create: (payload) => request('/requests', { method: 'POST', body: payload }),
      update: (id, payload) => request(`/requests/${id}`, { method: 'PUT', body: payload }),
      remove: (id) => request(`/requests/${id}`, { method: 'DELETE' }),
    },
    notifications: {
      list: (params = {}) => request('/notifications', { params }),
      create: (payload) => request('/notifications', { method: 'POST', body: payload }),
      update: (id, payload) => request(`/notifications/${id}`, { method: 'PUT', body: payload }),
    },
    payments: {
      list: (params = {}) => request('/payments', { params }),
      create: (payload) => request('/payments', { method: 'POST', body: payload }),
    },
  };

  window.API = API;
})();
