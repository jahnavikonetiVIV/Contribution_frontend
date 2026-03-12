const API_BASE = 'https://contribution-backend-3ka2.onrender.com';

const TOKEN_KEY = 'contribution_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    'Accept': '*/*',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  return fetch(url, { ...options, headers });
}

export async function loginUser(username, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || error.detail || `Login failed (${response.status})`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}

export async function registerUser(username, password) {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: {
      'Accept': '*/*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || error.detail || `Registration failed (${response.status})`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : {};
}
