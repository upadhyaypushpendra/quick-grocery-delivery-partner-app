import { useQuery } from '@tanstack/react-query';
import { useWalletStore } from '../stores/walletStore';
import apiClient from '../lib/apiClient';
import { toNumber } from '../lib/parsers';

interface WalletResponse {
  balance: number | string;
  totalEarnings: number | string;
  pendingEarnings: number | string;
  totalWithdrawn: number | string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    identifier: string;
    role: string;
  };
}

/**
 * Fetch wallet data
 */
export const useWallet = () => {
  const { setWalletData } = useWalletStore();

  return useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const response = await apiClient.get<WalletResponse>('/wallet');
      return response.data;
    },
    onSuccess: (data) => {
      setWalletData({
        balance: toNumber(data.balance, 0),
        totalEarnings: toNumber(data.totalEarnings, 0),
        pendingEarnings: toNumber(data.pendingEarnings, 0),
        totalWithdrawn: toNumber(data.totalWithdrawn, 0),
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Fetch wallet balance only
 */
export const useWalletBalance = () => {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const response = await apiClient.get<{
        balance: number | string;
        totalEarnings: number | string;
        pendingEarnings: number | string;
      }>('/wallet/balance');
      return {
        balance: toNumber(response.data.balance, 0),
        totalEarnings: toNumber(response.data.totalEarnings, 0),
        pendingEarnings: toNumber(response.data.pendingEarnings, 0),
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};
