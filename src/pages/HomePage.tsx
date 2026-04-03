import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useOrders } from '../hooks/useOrders';
import { useOrderTracking } from '../hooks/useOrderTracking';
import { useLocationStore } from '../stores/locationStore';
import OrderRequestListener from '../components/OrderRequestListener';
import ActiveDelivery from '../components/ActiveDelivery';
import { Truck, ClipboardList, Lightbulb } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const currentLocation = useLocationStore((s) => s.currentLocation);
  const isTracking = useLocationStore((s) => s.isTracking);
  const locationError = useLocationStore((s) => s.error);
  const { data: deliveries = [], isLoading: deliveriesLoading, refetch } = useOrders();

  const activeDelivery = useMemo(
    () => deliveries.find((delivery) => !delivery.completed),
    [deliveries],
  );

  const { statusEvents } = useOrderTracking(
    activeDelivery?.id,
    Boolean(activeDelivery && !activeDelivery.completed),
  );

  const liveActiveDelivery = useMemo(() => {
    if (!activeDelivery) return undefined;

    const allEvents = [...(activeDelivery.statusHistory || []), ...statusEvents]
      .filter((event) => Boolean(event?.status && event?.timestamp))
      .sort((a, b) => {
        const aTime = new Date(a.timestamp).getTime();
        const bTime = new Date(b.timestamp).getTime();
        return aTime - bTime;
      });

    const latestEvent = allEvents[allEvents.length - 1];

    return {
      ...activeDelivery,
      status: latestEvent?.status || activeDelivery.status,
      statusHistory: allEvents,
    };
  }, [activeDelivery, statusEvents]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-brand-700">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-brand-600 mt-1">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <div className="mb-6">
          {locationError ? (
            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-700">Location sharing unavailable</p>
              <p className="text-xs text-red-600 mt-1">{locationError}</p>
            </div>
          ) : isTracking && currentLocation ? (
            <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-4">
              <p className="text-sm font-semibold text-green-700">Location sharing active</p>
              <p className="text-xs text-green-600 mt-1">
                {currentLocation.latitude.toFixed(4)}, {currentLocation.longitude.toFixed(4)}
              </p>
            </div>
          ) : (
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-700">Starting location sharing</p>
              <p className="text-xs text-blue-600 mt-1">
                Keep this enabled so nearby orders can reach you.
              </p>
            </div>
          )}
        </div>

        {/* Active Delivery */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-brand-700 mb-3 flex items-center gap-2"><Truck className="w-5 h-5" /> Active Delivery</h2>
          {deliveriesLoading ? (
            <div className="bg-white rounded-lg shadow-md p-4 text-brand-600">
              Loading delivery...
            </div>
          ) : liveActiveDelivery ? (
            <ActiveDelivery
              order={liveActiveDelivery}
              onDelivered={() => void refetch()}
              onRejected={()=> void refetch()}
            />
          ) : (
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-brand-300">
              <p className="text-sm font-semibold text-brand-700">No active delivery</p>
              <p className="text-xs text-brand-600 mt-1">
                Accept a pending order request to start your next delivery.
              </p>
            </div>
          )}
        </div>

        {/* Order Requests */}
        {!liveActiveDelivery && (
          <div className="mb-6">
            <OrderRequestListener />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => navigate('/deliveries')}
            className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg hover:border-brand-400 transition border-2 border-brand-200"
          >
            <div className="flex items-start gap-4">
              <ClipboardList className="w-7 h-7 text-brand-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-brand-700">Delivery History</h3>
                <p className="text-sm text-brand-600 mt-1">View previous and completed deliveries</p>
              </div>
            </div>
          </button>

          {/* Info Card */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <p className="text-sm font-semibold text-blue-700 mb-2 flex items-center gap-1"><Lightbulb className="w-4 h-4" /> Quick Tips:</p>
            <ul className="text-xs text-blue-600 space-y-1">
              <li>✓ Keep location sharing enabled to receive more orders</li>
              <li>✓ Orders expire in 2 minutes - accept quickly to secure the delivery</li>
              <li>✓ Acceptance fee is added to your pending earnings immediately</li>
              <li>✓ Complete deliveries to move earnings to available balance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
