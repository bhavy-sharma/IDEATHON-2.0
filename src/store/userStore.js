import { create } from 'zustand';
import Cookies from 'js-cookie';

export const useUserStore = create((set) => ({
  // 1. Load hote hi cookie se token aur user read karo
  user: null, // Ya agar user object bhi save karna hai toh: JSON.parse(Cookies.get('user') || 'null')
  accessToken: Cookies.get('accessToken') || null,

  // 2. Login ke time cookie mein save karo (7 days ke liye)
  setAuth: (user, token) => {
    Cookies.set('accessToken', token, { expires: 7, path: '/' });
    Cookies.set('user', JSON.stringify(user), { expires: 7, path: '/' });
    
    set({ 
      user, 
      accessToken: token 
    });
  },

  // 3. Logout ke time cookie delete kar do
  clearAuth: () => {
    Cookies.remove('accessToken', { path: '/' });
    Cookies.remove('user', { path: '/' });
    
    set({ 
      user: null, 
      accessToken: null 
    });
  },
}));