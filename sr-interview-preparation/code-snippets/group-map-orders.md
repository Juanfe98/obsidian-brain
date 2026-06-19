```ts
type OrderStatus = "pending" | "paid" | "cancelled" | "refunded";

type Order = {
  id: string;
  customerName: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
};

type CustomerOrderSummary = {
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  paidOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  refundedOrders: number;
};

function getOrderSummaryByCustomer(orders: Order[]): CustomerOrderSummary[] {
  const summaryByCustomer = new Map<string, CustomerOrderSummary>();

  for (const order of orders) {
    const existingSummary = summaryByCustomer.get(order.customerName);

    if (!existingSummary) {
      summaryByCustomer.set(order.customerName, {
        customerName: order.customerName,
        totalOrders: 0,
        totalSpent: 0,
        paidOrders: 0,
        pendingOrders: 0,
        cancelledOrders: 0,
        refundedOrders: 0,
      });
    }

    const summary = summaryByCustomer.get(order.customerName)!;

    summary.totalOrders += 1;

    if (order.status === "paid") {
      summary.totalSpent += order.total;
      summary.paidOrders += 1;
    }

    if (order.status === "pending") {
      summary.pendingOrders += 1;
    }

    if (order.status === "cancelled") {
      summary.cancelledOrders += 1;
    }

    if (order.status === "refunded") {
      summary.refundedOrders += 1;
    }
  }

  return Array.from(summaryByCustomer.values());
}
```
