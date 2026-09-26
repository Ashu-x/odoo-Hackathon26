const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('stocksense_token');
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (response.status === 401) {
    localStorage.removeItem('stocksense_token');
    if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') window.location.assign('/login');
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(body.message || 'Something went wrong.');
    error.status = response.status;
    error.details = body.errors;
    throw error;
  }
  return body.data;
}

export const api = {
  get: (path) => apiRequest(path),
  post: (path, data) => apiRequest(path, { method: 'POST', body: JSON.stringify(data) }),
  put: (path, data) => apiRequest(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (path) => apiRequest(path, { method: 'DELETE' }),
};
