const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem('stocksense_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('stocksense_token');
    window.location.href = '/login';
    return Promise.reject(new Error('Session expired'));
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.message || 'An error occurred with the request');
  }

  return payload.data;
}

export const api = {
  get: (endpoint) => fetchWithAuth(endpoint),
  post: (endpoint, body) => fetchWithAuth(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => fetchWithAuth(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => fetchWithAuth(endpoint, { method: 'DELETE' }),
};