import React, { useRef, useState } from "react";
import GenericOrderList from "../../components/orders/GenericOrderList";
import { useNewOrders } from "../../hooks/useOrderQueries";
import {
  useAcceptOrder,
  useRejectOrder,
  useUpdatePreparingTime,
} from "../../hooks/useOrderMutations";
import SetPreparingTimeModal from "../../components/SetPreparingTimeModal";
import RejectOrderModal from "../../components/RejectOrderModal";
import { Order } from "../../api/orderServicesTypes";
import type { OrderScreenProps } from './orderFlowTypes';
import { useAuth } from '../../auth/AuthProvider';
import { alertForNewStoreOrder } from '../../hooks/orderAlertCoordinator';

export default function NewOrdersScreen({ initialOrderType, onOrderTypeChange, onOrderFlow, newOrderCounts, focusOrderId, onClearOrderFocus, highlightOrderCode }: OrderScreenProps) {
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectingOrderCode, setRejectingOrderCode] = useState<string | null>(null);
  const [rejectingOrderType, setRejectingOrderType] = useState<Order['orderType']>('delivery');
  const [modalVisible, setModalVisible] = useState(false);
  const acceptingOrderIdsRef = useRef<Set<string>>(new Set());
  const [acceptingOrderIds, setAcceptingOrderIds] = useState<string[]>([]);
  const { session } = useAuth();

  const acceptMutation = useAcceptOrder();
  const rejectMutation = useRejectOrder();
  const updateTimeMutation = useUpdatePreparingTime();

  const handleAccept = (order: Order) => {
    setPendingOrder(order);
    setModalVisible(true);
  };

  const handleReject = (orderId: string, orderType: Order['orderType'], orderCode?: string) => {
    setRejectingOrderId(orderId);
    setRejectingOrderType(orderType);
    setRejectingOrderCode(orderCode ?? null);
  };

  const handleRejectConfirm = (reason: string) => {
    if (!rejectingOrderId) return;
    const orderCode = rejectingOrderCode ?? undefined;
    rejectMutation.mutate(
      { orderId: rejectingOrderId, data: { reason } },
      {
        onSuccess: () => {
          setRejectingOrderId(null);
          setRejectingOrderCode(null);
          onOrderFlow({ tab: 'completed', orderType: rejectingOrderType, orderCode, notice: 'rejected' });
        },
        onError: () => {
          setRejectingOrderId(null);
          setRejectingOrderCode(null);
          onOrderFlow({ tab: 'new', orderType: rejectingOrderType, orderCode, notice: 'failed' });
        },
      },
    );
  };

  const closeRejectModal = () => {
    if (rejectMutation.isPending) return;
    setRejectingOrderId(null);
    setRejectingOrderCode(null);
  };

  const handleSetPreparingTime = async (minutes: number) => {
    if (!pendingOrder) return;

    const { orderId, orderCode, orderType } = pendingOrder;
    if (acceptingOrderIdsRef.current.has(orderId)) return;
    acceptingOrderIdsRef.current.add(orderId);
    setAcceptingOrderIds((ids) => [...ids, orderId]);
    setModalVisible(false);
    setPendingOrder(null);

    try {
      await acceptMutation.mutateAsync({ orderId, order: pendingOrder });
      onOrderFlow({ tab: 'inProgress', orderType, orderCode, notice: 'accepted' });
      void updateTimeMutation.mutateAsync({
        orderId,
        data: { preparingTimeInMinutes: minutes },
      }).catch(() => {
        onOrderFlow({ tab: 'inProgress', orderType, orderCode, notice: 'acceptedNeedsTime', navigate: false });
      });
    } catch {
      onOrderFlow({ tab: 'new', orderType, orderCode, notice: 'failed' });
    } finally {
      acceptingOrderIdsRef.current.delete(orderId);
      setAcceptingOrderIds((ids) => ids.filter((id) => id !== orderId));
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setPendingOrder(null);
  };

  const renderActions = (order: Order) => ({
    onAccept: () => handleAccept(order),
    onReject: () => handleReject(order.orderId, order.orderType, order.orderCode),
    isAccepting: acceptingOrderIds.includes(order.orderId),
    isRejecting: rejectMutation.isPending && rejectingOrderId === order.orderId,
  });

  return (
    <>
      <GenericOrderList
        highlightOrderCode={highlightOrderCode}
        focusOrderId={focusOrderId}
        onClearOrderFocus={onClearOrderFocus}
        useOrdersHook={useNewOrders}
        renderActions={renderActions}
        initialOrderType={initialOrderType}
        onOrderTypeChange={onOrderTypeChange}
        orderTypeCounts={newOrderCounts}
        autoScrollToTopOnNewItem
        onNewOrdersFromManualRefresh={(discovered) => {
          if (!session.user?.id) return;
          for (const order of [...discovered].sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt))) {
            void alertForNewStoreOrder({
              userId: session.user.id,
              orderId: order.orderId,
              occurredAt: order.createdAt,
              allowOlderEvent: true,
              showNotice: false,
            });
          }
        }}
      />
      <SetPreparingTimeModal
        visible={modalVisible}
        onClose={closeModal}
        onDone={handleSetPreparingTime}
      />
      <RejectOrderModal
        visible={Boolean(rejectingOrderId)}
        orderCode={rejectingOrderCode}
        isSubmitting={rejectMutation.isPending}
        onClose={closeRejectModal}
        onConfirm={handleRejectConfirm}
      />
    </>
  );
}
