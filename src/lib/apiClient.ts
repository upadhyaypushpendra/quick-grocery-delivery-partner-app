import axios from "axios";
import { useAuthStore } from "../stores/authStore";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

// Separate instance for refresh (without interceptors to avoid token attachment)
const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

// Request interceptor: attach auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason?: any) => void;
}> = [];

// Response interceptor: handle 401 + token refresh
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const isAuthMutationEndpoint =
      original.url?.includes("/auth/login") ||
      original.url?.includes("/auth/register") ||
      original.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !isAuthMutationEndpoint
    ) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return apiClient(original);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const { data } = await refreshClient.post("/auth/refresh");
        const newToken = data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);

        failedQueue.forEach(({ resolve }) => resolve(newToken));
        failedQueue = [];

        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch (err) {
        failedQueue.forEach(({ reject }) => reject(err));
        failedQueue = [];

        //@ts-ignore
        useAuthStore.getState().clearAuth();
        window.location.href = "/auth/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
