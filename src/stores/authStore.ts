import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DeliveryPartner {
  id: string;
  firstName: string;
  lastName: string;
  identifier: string;
  role: string;
}

interface AuthStore {
  user: DeliveryPartner | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: DeliveryPartner | null) => void;
  setAccessToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  setAuthState: (user: DeliveryPartner | null, token: string | null) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      logout: () => set({
        user: null,
        accessToken: null,
        error: null,
      }),

      setAuthState: (user, token) => set({
        user,
        accessToken: token,
        error: null,
      }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
