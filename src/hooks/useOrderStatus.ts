import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/apiClient';
import type { OrderStatus } from '../constants/orderStatus';
import { getApiErrorMessage } from '../lib/parsers';

/**
 * Update order status (Delivery Partner action)
 */
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { orderId: string; status: OrderStatus }) => {
      const response = await apiClient.patch(`/orders/${payload.orderId}/status`, {
        status: payload.status,
      });
      return response.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
    onError: (error: unknown) => {
      console.error(
        'Failed to update order status:',
        getApiErrorMessage(error, 'Unknown order status error'),
      );
    },
  });
};

/**
 * Mark order as delivered (DP confirms delivery)
 */
export const useMarkDelivered = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      const response = await apiClient.post(`/orders/${orderId}/delivered`);
      return response.data;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['deliveries'] }),
        queryClient.invalidateQueries({ queryKey: ['wallet'] }),
        queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] }),
      ]);
    },
    onError: (error: unknown) => {
      console.error(
        'Failed to mark as delivered:',
        getApiErrorMessage(error, 'Unknown delivery completion error'),
      );
    },
  });
};
