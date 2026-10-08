import axios from 'axios';
import { useUserStore } from '@/store/userStore';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useUserStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const user = useUserStore.getState().user;
        useUserStore.getState().setAuth(user, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        useUserStore.getState().clearAuth();
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

// ============================================
// Room API
// ============================================

export const roomApi = {
  // Create a new room (HOST only)
  create: (data) =>
    api.post('/rooms', data),

  getByCode: async (code) => {
    return await axios.get(`/api/rooms/${code}`);
  },

  // List rooms hosted by the current user
  list: (params = {}) =>
    api.get('/rooms', { params }),

  // Get a single room by ID
  getById: (id) =>
    api.get(`/rooms/id/${id}`),

  // End a room manually (HOST only)
  end: (id) =>
    api.post(`/rooms/${id}/end`),
};

export const questionApi = {
  getSets: (page = 1, limit = 10) =>
    api.get('/questions/sets', { params: { page, limit } }),
  create: (data) => api.post('/questions', data),
};