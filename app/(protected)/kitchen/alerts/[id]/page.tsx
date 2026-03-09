import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";

import { updateAlertAction } from "@/features/operations/actions";
import { canManageAlerts, canViewScope } from "@/features/operations/permissions";
import { getAlert, getFormOptions } from "@/features/operations/queries";
import { ModuleHeader, SectionCard, alertBadge, formGridClass, formInputClass, formTextAreaClass } from "@/components/operations/ui";
import { requireUser } from "@/lib/authz";

const scope = "kitchen" as const;
type Props = { params: Promise<{ id: string }> };

export default async function KitchenAlertDetailPage({ params }: Props) {
  const user = await requireUser();
  if (!canViewScope(user.role as UserRole, scope)) return null;
  const { id } = await params;
  const [alert, options] = await Promise.all([getAlert(id), getFormOptions(scope)]);
  if (!alert) notFound();

  const canManage = canManageAlerts(user.role as UserRole, scope);

  return (
    <div className="space-y-4">
      <ModuleHeader title={alert.title} description="Incident detail, ownership assignment, and status progression." />
      <p className="text-sm text-muted-foreground">{alertBadge(alert.severity, alert.status)} · Reported by {alert.reporter.name}</p>

      <SectionCard title="Alert Details">
        <p className="text-sm whitespace-pre-wrap">{alert.description}</p>
        <p className="text-sm">Owner: {alert.owner?.name ?? "Unassigned"}</p>
        <p className="text-sm">Service: {alert.service?.name ?? "None"}</p>
        <p className="text-sm">Order: {alert.order?.ticketNumber ?? "None"}</p>
        <p className="text-sm">Linked task: {alert.linkedTask?.title ?? "None"}</p>
        <p className="text-xs text-muted-foreground">Created: {alert.createdAt.toLocaleString("en-US")}</p>
      </SectionCard>

      {canManage ? (
        <form action={updateAlertAction.bind(null, scope)} className="space-y-3 rounded-lg border bg-card p-4">
          <input name="id" type="hidden" value={alert.id} />
          <h2 className="text-sm font-semibold">Edit Alert</h2>
          <div className={formGridClass()}>
            <input className={formInputClass()} defaultValue={alert.title} name="title" required />
            <select className={formInputClass()} defaultValue={alert.severity} name="severity" required>
              <option value="LOW">low</option>
              <option value="MEDIUM">medium</option>
              <option value="HIGH">high</option>
              <option value="CRITICAL">critical</option>
            </select>
            <select className={formInputClass()} defaultValue={alert.status} name="status" required>
              <option value="OPEN">open</option>
              <option value="ACKNOWLEDGED">acknowledged</option>
              <option value="RESOLVED">resolved</option>
              <option value="ESCALATED">escalated</option>
            </select>
            <select className={formInputClass()} defaultValue={alert.ownerId ?? ""} name="ownerId">
              <option value="">No owner</option>
              {options.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select className={formInputClass()} defaultValue={alert.serviceId ?? ""} name="serviceId">
              <option value="">No service</option>
              {options.services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
            <select className={formInputClass()} defaultValue={alert.orderId ?? ""} name="orderId">
              <option value="">No order</option>
              {options.orders.map((order) => <option key={order.id} value={order.id}>{order.ticketNumber}</option>)}
            </select>
          </div>
          <textarea className={formTextAreaClass()} defaultValue={alert.description} name="description" required />
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Save changes</button>
        </form>
      ) : <p className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">Read-only access.</p>}

      <Link className="text-sm underline" href="/kitchen/alerts">Back to alerts</Link>
    </div>
  );
}

