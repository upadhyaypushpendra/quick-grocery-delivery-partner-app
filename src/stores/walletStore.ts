import { create } from 'zustand';

interface WalletState {
  balance: number;
  totalEarnings: number;
  pendingEarnings: number;
  totalWithdrawn: number;

  setBalance: (balance: number) => void;
  setWalletData: (data: {
    balance: number;
    totalEarnings: number;
    pendingEarnings: number;
    totalWithdrawn: number;
  }) => void;
  reset: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  balance: 0,
  totalEarnings: 0,
  pendingEarnings: 0,
  totalWithdrawn: 0,

  setBalance: (balance) => set({ balance }),
  setWalletData: (data) =>
    set({
      balance: data.balance,
      totalEarnings: data.totalEarnings,
      pendingEarnings: data.pendingEarnings,
      totalWithdrawn: data.totalWithdrawn,
    }),
  reset: () =>
    set({
      balance: 0,
      totalEarnings: 0,
      pendingEarnings: 0,
      totalWithdrawn: 0,
    }),
}));
