import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../lib/apiClient';

interface RegisterRequest {
  firstName: string;
  lastName: string;
  identifier: string;
  role: 'delivery_partner';
}

interface LoginRequest {
  identifier: string;
}

interface VerifyOtpRequest {
  identifier: string;
  otp: string;
}

interface AuthResponse {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    identifier: string;
    role: string;
  };
  accessToken: string;
}

interface OtpResponse {
  message: string;
  identifier: string;
  otp?: string; // Only in development
}

/**
 * Register mutation
 */
export const useRegister = () => {
  const { setError } = useAuthStore();

  return useMutation({
    mutationFn: async (data: Omit<RegisterRequest, 'role'>) => {
      const response = await apiClient.post<OtpResponse>('/auth/register', {
        ...data,
        role: 'delivery_partner',
      });
      return response.data;
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
    },
  });
};

/**
 * Login mutation - sends OTP
 */
export const useLogin = () => {
  const { setError } = useAuthStore();

  return useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await apiClient.post<OtpResponse>('/auth/login', {
        ...data,
        role: 'delivery_partner',
      });
      return response.data;
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
    },
  });
};

/**
 * Verify OTP mutation
 */
export const useVerifyOtp = () => {
  const { setAuthState, setError } = useAuthStore();

  return useMutation({
    mutationFn: async (data: VerifyOtpRequest) => {
      setError(null); // Clear any previous errors before making request
      const response = await apiClient.post<AuthResponse>('/auth/verify-otp', {
        ...data,
        role: 'delivery_partner',
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.user.role !== 'delivery_partner') {
        setError('This app is for delivery partners only. Please use the correct app.');
        return;
      }
      setAuthState(data.user, data.accessToken);
      setError(null); // Explicitly clear error on success
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'OTP verification failed';
      setError(message);
    },
  });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSettled: () => {
      logout();
      delete apiClient.defaults.headers.common['Authorization'];
    },
  });
};

/**
 * Fetch current logged-in user
 */
export const useMe = () => {
  const { user, accessToken } = useAuthStore();

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const response = await apiClient.get<AuthResponse>('/auth/me');
      return response.data;
    },
    enabled: !!accessToken && !user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Resend OTP mutation
 */
export const useResendOtp = () => {
  const { setError } = useAuthStore();

  return useMutation({
    mutationFn: async (data: { identifier: string }) => {
      const response = await apiClient.post<OtpResponse>('/otp/resend', data);
      return response.data;
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      setError(message);
    },
  });
};
