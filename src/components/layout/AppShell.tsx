import { Outlet } from 'react-router-dom';
import DeliveryPartnerRuntime from '../DeliveryPartnerRuntime';
import Header from './Header';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DeliveryPartnerRuntime />
      <Header />
      <main className="max-w-6xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
