import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";

import { updateOrderAction } from "@/features/operations/actions";
import { canManageOrders, canViewScope } from "@/features/operations/permissions";
import { getOrder, getFormOptions } from "@/features/operations/queries";
import { ModuleHeader, SectionCard, formGridClass, formInputClass, formTextAreaClass, orderStatusBadge } from "@/components/operations/ui";
import { requireUser } from "@/lib/authz";

const scope = "kitchen" as const;

type Props = { params: Promise<{ id: string }> };

export default async function KitchenOrderDetailPage({ params }: Props) {
  const user = await requireUser();
  if (!canViewScope(user.role as UserRole, scope)) return null;

  const { id } = await params;
  const [order, options] = await Promise.all([getOrder(id), getFormOptions(scope)]);
  if (!order) notFound();

  const canManage = canManageOrders(user.role as UserRole, scope);

  return (
    <div className="space-y-4">
      <ModuleHeader title={`Order #${order.ticketNumber}`} description="Order detail, status tracking, and update controls." />
      <p className="text-sm text-muted-foreground">Table {order.tableLabel} · {order.station} · {orderStatusBadge(order.status)}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Order Summary">
          <p className="text-sm">{order.summary}</p>
          <p className="text-xs text-muted-foreground">Created: {order.createdAt.toLocaleString("en-US")}</p>
          <p className="text-xs text-muted-foreground">Updated: {order.updatedAt.toLocaleString("en-US")}</p>
        </SectionCard>

        <SectionCard title="Linked Records">
          <p className="text-sm">Service: {order.service.name}</p>
          <p className="text-sm">Tasks linked: {order.tasks.length}</p>
          <p className="text-sm">Alerts linked: {order.alerts.length}</p>
        </SectionCard>
      </div>

      {canManage ? (
        <form action={updateOrderAction.bind(null, scope)} className="space-y-3 rounded-lg border bg-card p-4">
          <input name="id" type="hidden" value={order.id} />
          <h2 className="text-sm font-semibold">Edit Order</h2>
          <div className={formGridClass()}>
            <input className={formInputClass()} defaultValue={order.ticketNumber} name="ticketNumber" required />
            <input className={formInputClass()} defaultValue={order.tableLabel} name="tableLabel" required />
            <input className={formInputClass()} defaultValue={order.station} name="station" required />
            <input className={formInputClass()} defaultValue={order.priority} max={5} min={1} name="priority" required type="number" />
            <select className={formInputClass()} defaultValue={order.status} name="status" required>
              <option value="PENDING">pending</option>
              <option value="IN_PROGRESS">in progress</option>
              <option value="READY">ready</option>
              <option value="COMPLETED">completed</option>
              <option value="CANCELLED">cancelled</option>
            </select>
            <select className={formInputClass()} defaultValue={order.serviceId} name="serviceId" required>
              {options.services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
          </div>
          <textarea className={formTextAreaClass()} defaultValue={order.summary} name="summary" required />
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Save changes</button>
        </form>
      ) : (
        <p className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">You have read-only access for this module.</p>
      )}

      <Link className="text-sm underline" href="/kitchen/orders">Back to orders</Link>
    </div>
  );
}

