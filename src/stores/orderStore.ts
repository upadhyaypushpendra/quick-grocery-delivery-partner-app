import { create } from 'zustand';

export interface OrderRequest {
  id: string;
  orderId: string;
  deliveryFee: number;
  pickupLatitude?: number;
  pickupLongitude?: number;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  expiresAt: Date | string;
  createdAt: Date | string;
}

interface OrderStore {
  pendingOrders: OrderRequest[];

  removePendingOrder: (orderId: string) => void;
  acceptOrder: (orderId: string) => void;
  setPendingOrders: (orders: OrderRequest[]) => void;
  clear: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  pendingOrders: [],

  removePendingOrder: (orderId) =>
    set((state) => ({
      pendingOrders: state.pendingOrders.filter((o) => o.id !== orderId),
    })),

  acceptOrder: (orderId) =>
    set((state) => {
      return {
        pendingOrders: state.pendingOrders.filter((o) => o.id !== orderId),
      };
    }),

  setPendingOrders: (orders) =>
    set((state) => (state.pendingOrders === orders ? state : { pendingOrders: orders })),

  clear: () =>
    set((state) =>
      state.pendingOrders.length === 0 ? state : { pendingOrders: [] },
    ),
}));
