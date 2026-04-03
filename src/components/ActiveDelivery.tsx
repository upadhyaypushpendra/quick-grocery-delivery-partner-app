import toast from 'react-hot-toast';
import { getApiErrorMessage, toNumber, toOptionalNumber } from '../lib/parsers';
import {
  DP_OUT_FOR_DELIVERY_DONE_STATUSES,
  DP_REACHED_STATUSES,
  ORDER_STATUS_ICONS,
  ORDER_STATUS_ICON_FALLBACK,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from '../constants/orderStatus';
import { useMarkDelivered, useUpdateOrderStatus } from '../hooks/useOrderStatus';
import { MapPin, Map, Check, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface ActiveDeliveryProps {
  order: {
    id: string;
    status: string;
    deliveryLatitude?: number | string;
    deliveryLongitude?: number | string;
    deliveryFee?: number | string;
    totalAmount?: number | string;
    addressSnapshot?: {
      line1: string;
      line2?: string;
      city: string;
      postcode: string;
    };
  };
  onDelivered?: () => void;
  onRejected?: () => void;
}

export default function ActiveDelivery({ order, onDelivered, onRejected }: ActiveDeliveryProps) {
  const updateOrderStatus = useUpdateOrderStatus();
  const markDeliveredMutation = useMarkDelivered();

  const normalizedStatus = order.status as OrderStatus;
  const deliveryFee = toNumber(order.deliveryFee, 0);
  const totalAmount = toNumber(order.totalAmount, 0);
  const deliveryLatitude = toOptionalNumber(order.deliveryLatitude);
  const deliveryLongitude = toOptionalNumber(order.deliveryLongitude);
  const isUpdating = updateOrderStatus.isPending || markDeliveredMutation.isPending;
  const hasDeliveryStarted = DP_OUT_FOR_DELIVERY_DONE_STATUSES.includes(normalizedStatus);
  const hasReachedCustomer = DP_REACHED_STATUSES.includes(normalizedStatus);
  const canGetDirections =
    hasDeliveryStarted &&
    deliveryLatitude !== undefined &&
    deliveryLongitude !== undefined;

  const nextStatusMap: Partial<
    Record<OrderStatus, { status: OrderStatus; label: string }>
  > = {
    accepted: {
      status: 'going_for_pickup',
      label: 'Start Pickup',
    },
    going_for_pickup: {
      status: 'out_for_delivery',
      label: 'Start Delivery',
    },
  };

  const nextAction = nextStatusMap[normalizedStatus];
  const canMarkDelivered = hasReachedCustomer;

  const handleAdvanceStatus = async () => {
    if (!nextAction) return;

    try {
      await updateOrderStatus.mutateAsync({
        orderId: order.id,
        status: nextAction.status,
      });
      toast.success(`${ORDER_STATUS_LABELS[nextAction.status]} updated`);
      if (onDelivered) onDelivered();
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to update order status'));
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusColorMap: Partial<Record<OrderStatus, 'blue' | 'yellow' | 'purple' | 'green'>> = {
      accepted: 'blue',
      going_for_pickup: 'yellow',
      out_for_delivery: 'purple',
      reached: 'green',
    };

    const typedStatus = status as OrderStatus;
    return {
      label: ORDER_STATUS_LABELS[typedStatus] || status,
      Icon: (ORDER_STATUS_ICONS[typedStatus] || ORDER_STATUS_ICON_FALLBACK) as LucideIcon,
      color: statusColorMap[typedStatus] || 'gray',
    };
  };

  const statusInfo = getStatusDisplay(normalizedStatus);
  const colorClass = {
    blue: 'bg-blue-50 border-blue-300 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-300 text-yellow-700',
    purple: 'bg-purple-50 border-purple-300 text-purple-700',
    green: 'bg-green-50 border-green-300 text-green-700',
    gray: 'bg-gray-50 border-gray-300 text-gray-700',
  }[statusInfo.color];

  return (
    <div className={`border-2 rounded-lg p-6 ${colorClass}`}>
      {/* Status Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <statusInfo.Icon className="w-7 h-7" />
          <h2 className="text-2xl font-bold">{statusInfo.label}</h2>
        </div>
        <p className="text-sm font-semibold">Order #{order.id.slice(0, 8)}</p>
      </div>

      {/* Order Details */}
      <div className="bg-white rounded-lg p-4 mb-4 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-600 font-semibold">Delivery Amount</p>
            <p className="text-xl font-bold text-green-600">₹{deliveryFee.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 font-semibold">Order Total</p>
            <p className="text-xl font-bold text-brand-600">₹{totalAmount.toFixed(2)}</p>
          </div>
        </div>

        {/* Delivery Address */}
        {order.addressSnapshot && (
          <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600 font-semibold mb-2 flex items-center gap-1"><MapPin className="w-3 h-3" /> Delivery Address</p>
            <p className="text-sm text-gray-700">
              {order.addressSnapshot.line1}
              {order.addressSnapshot.line2 && `, ${order.addressSnapshot.line2}`}
            </p>
            <p className="text-sm text-gray-600">
              {order.addressSnapshot.city}, {order.addressSnapshot.postcode}
            </p>
          </div>
        )}

        {/* Coordinates */}
        {deliveryLatitude !== undefined && deliveryLongitude !== undefined && (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600 font-semibold mb-1">Location</p>
            <p className="text-xs text-gray-600 font-mono">
              {deliveryLatitude.toFixed(4)}, {deliveryLongitude.toFixed(4)}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {!nextAction && !canMarkDelivered && (
          <div className="rounded-lg border border-white/70 bg-white/70 px-4 py-3 text-sm font-medium text-gray-600">
            No delivery action is available for the current order state.
          </div>
        )}

        {canGetDirections && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${toOptionalNumber(order.deliveryLatitude)},${toOptionalNumber(order.deliveryLongitude)}&travelmode=driving`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            <Map className="w-4 h-4" /> Get Directions to Customer
          </a>
        )}

        <div className="flex gap-3">
        {nextAction && (
          <button
            onClick={handleAdvanceStatus}
            disabled={isUpdating}
            className="flex-1 bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {updateOrderStatus.isPending
              ? 'Updating...'
              : nextAction.label}
          </button>
        )}
        {canMarkDelivered && (
          <>
          <button
            onClick={() => {
              markDeliveredMutation.mutate(order.id, {
                onSuccess: () => {
                  toast.success('Order marked as delivered! ✓');
                  if (onDelivered) onDelivered();
                },
                onError: (error: unknown) => {
                  toast.error(getApiErrorMessage(error, 'Failed to mark as delivered'));
                },
              });
            }}
            disabled={isUpdating}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {markDeliveredMutation.isPending ? <span className="flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Marking Delivered...</span> : <span className="flex items-center justify-center gap-1"><Check className="w-4 h-4" /> Mark Delivered</span>}
          </button>
          <button
            onClick={() => {
              updateOrderStatus.mutate({orderId: order.id, status: 'cancelled'}, {
                onSuccess: () => {
                  toast.success('Order marked as rejected! ✗');
                  if (onRejected) onRejected();
                },
                onError: (error: unknown) => {
                  toast.error(getApiErrorMessage(error, 'Failed to mark as rejected'));
                },
              });
            }}
            disabled={isUpdating}
            className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {updateOrderStatus.isPending ? <span className="flex items-center justify-center gap-1"><X className="w-4 h-4" /> Marking Rejected...</span> : <span className="flex items-center justify-center gap-1"><X className="w-4 h-4" /> Mark Rejected</span>}
          </button>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
