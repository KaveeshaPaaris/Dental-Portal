import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Attach Supabase JWT to every request automatically
api.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    // Dynamically import to avoid SSR issues
    const { supabase } = await import('./supabaseClient');
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Redirect to login on 401
      if (window.location.pathname.startsWith('/admin') &&
          !window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
