import { useOrders } from '../hooks/useOrders';
import {
  ORDER_STATUS_COLORS,
  formatOrderStatus,
  type OrderStatus,
} from '../constants/orderStatus';

export default function OrderHistoryPage() {
  const { data: orders, isLoading } = useOrders();
  const completedOrders = orders?.filter((order) => order.completed) || [];

  return (
    <div className='p-4'>
      <h1 className="text-3xl font-bold mb-6 text-brand-700">Delivery History</h1>

      {isLoading ? (
        <div className="text-brand-600">Loading orders...</div>
      ) : completedOrders.length > 0 ? (
        <div className="space-y-4">
          {completedOrders.map((order) => {
            const status = order.status as OrderStatus;
            const colors = ORDER_STATUS_COLORS[status];

            return (
              <div
                key={order.id}
                className="block bg-brand-50 border-2 border-brand-200 rounded-lg p-6 hover:shadow-lg hover:border-brand-400 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-brand-600">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-brand-600 mt-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p className="font-bold text-lg text-green-800">Rs. {Number(order.deliveryFee).toFixed(2)}+</p>
                  </div>
                  <span className={`px-3 py-1 rounded text-sm font-bold ${colors.bg} ${colors.text}`}>
                    {formatOrderStatus(order.status)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-brand-600">No completed deliveries yet</p>
      )}
    </div>
  );
}
