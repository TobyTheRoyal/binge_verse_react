export interface RequestOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch(url: string, options: RequestOptions = {}) {
  const headers = new Headers(options.headers || {});
  if (options.auth) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/auth/login';
    throw new Error('Unauthorized');
  }
  return res;
}