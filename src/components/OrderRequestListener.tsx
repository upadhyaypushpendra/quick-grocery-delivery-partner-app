import { useOrderStore } from '../stores/orderStore';
import OrderRequestCard from './OrderRequestCard';
import { BellOff, Package } from 'lucide-react';

export default function OrderRequestListener() {
  const { pendingOrders } = useOrderStore();

  if (pendingOrders.length === 0) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <p className="text-sm font-semibold text-yellow-700 flex items-center gap-1"><BellOff className="w-4 h-4" /> No pending orders</p>
        <p className="text-xs text-yellow-600 mt-1">Waiting for order requests...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-brand-700 flex items-center gap-2">
          <Package className="w-5 h-5" /> Pending Orders ({pendingOrders.length})
        </h2>
        <p className="text-sm text-brand-600">Accept or decline delivery requests</p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {pendingOrders.map((order) => (
          <OrderRequestCard key={order.id} {...order} />
        ))}
      </div>
    </div>
  );
}
