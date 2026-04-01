import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
// import { useRegisterSW } from 'virtual:pwa-register/react';
import { useAuthStore } from './stores/authStore';
import { useMe } from './hooks/useAuth';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Protected Pages
import HomePage from './pages/HomePage';
import AccountPage from './pages/AccountPage';
import DeliveryHistoryPage from './pages/DeliveryHistoryPage';
// import DashboardPage from './pages/DashboardPage';
// import DeliveryPage from './pages/DeliveryPage';
// import WalletPage from './pages/WalletPage';

// Components
import ProtectedRoute from './components/layout/ProtectedRoute';
import AppShell from './components/layout/AppShell';

function App() {
  // PWA registration
  // useRegisterSW({
  //   onNeedRefresh() {
  //     if (confirm('New version available! Update now?')) {
  //       window.location.reload();
  //     }
  //   },
  //   onOfflineReady() {
  //     console.log('App is ready for offline use');
  //   },
  // });

  // Restore auth state on mount
  const me = useMe();
  const { setAuthState } = useAuthStore();

  useEffect(() => {
    if (me.data) {
      setAuthState(me.data.user, me.data.accessToken);
    }
  }, [me.data, setAuthState]);

  return (
    <BrowserRouter>
      <Toaster position="bottom-center" />
      <Routes>
        <Route element={<AppShell />}>

          {/* Auth Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* Protected Routes with AppShell */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />

          <Route path="/account" element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          } />

          <Route
            path="/deliveries"
            element={
              <ProtectedRoute>
                <DeliveryHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/auth/login" replace />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
