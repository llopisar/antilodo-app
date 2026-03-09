import { UserRole } from "@prisma/client";

import { createOrderAction } from "@/features/operations/actions";
import { canManageOrders, canViewScope } from "@/features/operations/permissions";
import { getFormOptions, listOrders } from "@/features/operations/queries";
import {
  FilterForm,
  InlineStat,
  ListCard,
  ModuleHeader,
  emptyState,
  formGridClass,
  formInputClass,
  formTextAreaClass,
  orderStatusBadge,
} from "@/components/operations/ui";
import { requireUser } from "@/lib/authz";

const scope = "kitchen" as const;

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function KitchenOrdersPage({ searchParams }: Props) {
  const user = await requireUser();
  if (!canViewScope(user.role as UserRole, scope)) return null;

  const params = await searchParams;
  const [orders, options] = await Promise.all([
    listOrders(scope, params.q, params.status),
    getFormOptions(scope),
  ]);

  const canManage = canManageOrders(user.role as UserRole, scope);
  const openCount = orders.filter((o) => o.status !== "COMPLETED" && o.status !== "CANCELLED").length;

  return (
    <div className="space-y-4">
      <ModuleHeader title="Kitchen Orders" description="Incoming tickets, kitchen queue control, and status tracking." />
      <div className="grid gap-3 sm:grid-cols-3">
        <InlineStat label="Total" value={String(orders.length)} />
        <InlineStat label="Open" value={String(openCount)} />
        <InlineStat label="Ready" value={String(orders.filter((o) => o.status === "READY").length)} />
      </div>

      <FilterForm action="/kitchen/orders" query={params.q} status={params.status} statusOptions={["PENDING", "IN_PROGRESS", "READY", "COMPLETED", "CANCELLED"]} />

      {canManage ? (
        <form action={createOrderAction.bind(null, scope)} className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">Create Order</h2>
          <div className={formGridClass()}>
            <input className={formInputClass()} name="ticketNumber" placeholder="Ticket number" required />
            <input className={formInputClass()} name="tableLabel" placeholder="Table label" required />
            <input className={formInputClass()} name="station" placeholder="Station" required />
            <input className={formInputClass()} max={5} min={1} name="priority" placeholder="Priority (1-5)" required type="number" />
            <select className={formInputClass()} name="serviceId" required>
              <option value="">Select service</option>
              {options.services.map((service) => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          </div>
          <textarea className={formTextAreaClass()} name="summary" placeholder="Order summary" required />
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Create order</button>
        </form>
      ) : null}

      <div className="grid gap-3">
        {orders.length === 0 ? emptyState("No orders found for the selected filters.") : null}
        {orders.map((order) => (
          <ListCard
            key={order.id}
            title={`#${order.ticketNumber} · ${order.tableLabel}`}
            subtitle={`${order.station} · ${order.summary}`}
            href={`/kitchen/orders/${order.id}`}
            badges={orderStatusBadge(order.status)}
            meta={`Service: ${order.service.name} · Priority: ${order.priority} · Updated: ${order.updatedAt.toLocaleString("en-US")}`}
          />
        ))}
      </div>
    </div>
  );
}


