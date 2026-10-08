import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      
      // Login/Register ke baad state update karne ke liye
      setAuth: (user, token) => set({ user, accessToken: token }),
      
      // Logout karne ke liye
      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'aptiquiz-auth-storage', // localStorage mein ye naam se save hoga
    }
  )
);