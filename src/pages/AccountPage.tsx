import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useLogout } from '../hooks/useAuth';
import { useWallet } from '../hooks/useWallet';
import toast from 'react-hot-toast';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const logout = useLogout();
  const { data: walletData, isLoading: walletLoading, error: walletError } = useWallet();

  useEffect(() => {
    if (walletError) {
      toast.error('Failed to load wallet data');
    }
  }, [walletError]);

  const handleLogout = async () => {
    await logout.mutateAsync();
    navigate('/auth/login');
  };

  const formatCurrency = (value: number | string) => {
    return parseFloat(value.toString()).toFixed(2);
  };

  return (
    <div className="min-h-screen bg-brand-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-brand-600">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-brand-700">
                👤 {user?.firstName} {user?.lastName}
              </h1>
              <p className="text-brand-600 mt-1">{user?.identifier}</p>
            </div>
          </div>
        </div>

        {/* Wallet Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-brand-700 mb-6">💰 Wallet & Earnings</h2>

          {walletLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin">⏳</div>
              <p className="ml-2 text-brand-600">Loading wallet data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Available Balance */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-700 mb-2">Available Balance</p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{formatCurrency(walletData?.balance || 0)}
                </p>
                <p className="text-xs text-green-600 mt-2">Ready to withdraw</p>
              </div>

              {/* Total Earnings */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-700 mb-2">Total Earnings</p>
                <p className="text-3xl font-bold text-blue-600">
                  ₹{formatCurrency(walletData?.totalEarnings || 0)}
                </p>
                <p className="text-xs text-blue-600 mt-2">Lifetime earnings</p>
              </div>

              {/* Pending Earnings */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-yellow-700 mb-2">Pending Earnings</p>
                <p className="text-3xl font-bold text-yellow-600">
                  ₹{formatCurrency(walletData?.pendingEarnings || 0)}
                </p>
                <p className="text-xs text-yellow-600 mt-2">Waiting for approval</p>
              </div>

              {/* Total Withdrawn */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-purple-700 mb-2">Total Withdrawn</p>
                <p className="text-3xl font-bold text-purple-600">
                  ₹{formatCurrency(walletData?.totalWithdrawn || 0)}
                </p>
                <p className="text-xs text-purple-600 mt-2">Withdrawn to date</p>
              </div>
            </div>
          )}
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-brand-700 mb-4">📋 Account Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-l-4 border-brand-300 pl-4">
              <p className="text-sm text-brand-600 font-semibold">First Name</p>
              <p className="text-lg text-brand-700">{user?.firstName}</p>
            </div>
            <div className="border-l-4 border-brand-300 pl-4">
              <p className="text-sm text-brand-600 font-semibold">Last Name</p>
              <p className="text-lg text-brand-700">{user?.lastName}</p>
            </div>
            <div className="border-l-4 border-brand-300 pl-4">
              <p className="text-sm text-brand-600 font-semibold">Contact (Email/Phone)</p>
              <p className="text-lg text-brand-700">{user?.identifier}</p>
            </div>
            <div className="border-l-4 border-brand-300 pl-4">
              <p className="text-sm text-brand-600 font-semibold">Account ID</p>
              <p className="text-sm text-brand-600 font-mono">{user?.id}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <button
            disabled
            className="w-full bg-brand-50 text-brand-600 py-3 rounded-lg font-bold border-2 border-brand-200 opacity-60 cursor-not-allowed transition"
          >
            💳 Request Withdrawal
          </button>
          <button
            disabled
            className="w-full bg-brand-50 text-brand-600 py-3 rounded-lg font-bold border-2 border-brand-200 opacity-60 cursor-not-allowed transition"
          >
            ✏️ Edit Profile
          </button>
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 disabled:bg-red-300 transition"
          >
            {logout.isPending ? 'Logging out...' : '🚪 Logout'}
          </button>
        </div>
      </div>
    </div>
  );
}
