import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

/**
 * Attempt to refresh the access token using the refresh cookie.
 * Returns the new access token, or throws if refresh fails.
 * Deduplicates concurrent calls.
 */
export async function refreshAccessToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const { data } = await refreshClient.post('/auth/refresh');
    const newToken: string = data.accessToken;
    useAuthStore.getState().setAccessToken(newToken);
    pendingQueue.forEach(({ resolve }) => resolve(newToken));
    return newToken;
  } catch (err) {
    pendingQueue.forEach(({ reject }) => reject(err));
    useAuthStore.getState().clearAuth();
    window.location.href = '/auth/login';
    throw err;
  } finally {
    pendingQueue = [];
    isRefreshing = false;
  }
}
