import { UserRole } from "@prisma/client";

import { createAlertAction } from "@/features/operations/actions";
import { canManageAlerts, canViewScope } from "@/features/operations/permissions";
import { getFormOptions, listAlerts } from "@/features/operations/queries";
import {
  FilterForm,
  InlineStat,
  ListCard,
  ModuleHeader,
  alertBadge,
  emptyState,
  formGridClass,
  formInputClass,
  formTextAreaClass,
} from "@/components/operations/ui";
import { requireUser } from "@/lib/authz";

const scope = "floor" as const;
type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function FloorAlertsPage({ searchParams }: Props) {
  const user = await requireUser();
  if (!canViewScope(user.role as UserRole, scope)) return null;

  const params = await searchParams;
  const [alerts, options] = await Promise.all([
    listAlerts(scope, params.q, params.status),
    getFormOptions(scope),
  ]);
  const canManage = canManageAlerts(user.role as UserRole, scope);

  return (
    <div className="space-y-4">
      <ModuleHeader title="Floor Alerts" description="Service incident logging, severity tracking, and status progression." />
      <div className="grid gap-3 sm:grid-cols-4">
        <InlineStat label="Total" value={String(alerts.length)} />
        <InlineStat label="Open" value={String(alerts.filter((a) => a.status === "OPEN").length)} />
        <InlineStat label="Escalated" value={String(alerts.filter((a) => a.status === "ESCALATED").length)} />
        <InlineStat label="Critical" value={String(alerts.filter((a) => a.severity === "CRITICAL").length)} />
      </div>

      <FilterForm action="/floor/alerts" query={params.q} status={params.status} statusOptions={["OPEN", "ACKNOWLEDGED", "RESOLVED", "ESCALATED"]} />

      {canManage ? (
        <form action={createAlertAction.bind(null, scope)} className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">Create Alert</h2>
          <div className={formGridClass()}>
            <input className={formInputClass()} name="title" placeholder="Title" required />
            <select className={formInputClass()} name="severity" required>
              <option value="LOW">low</option>
              <option value="MEDIUM">medium</option>
              <option value="HIGH">high</option>
              <option value="CRITICAL">critical</option>
            </select>
            <select className={formInputClass()} name="status" required>
              <option value="OPEN">open</option>
              <option value="ACKNOWLEDGED">acknowledged</option>
              <option value="RESOLVED">resolved</option>
              <option value="ESCALATED">escalated</option>
            </select>
            <select className={formInputClass()} name="ownerId">
              <option value="">No owner</option>
              {options.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select className={formInputClass()} name="serviceId">
              <option value="">No service</option>
              {options.services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
            <select className={formInputClass()} name="orderId">
              <option value="">No order</option>
              {options.orders.map((order) => <option key={order.id} value={order.id}>{order.ticketNumber}</option>)}
            </select>
          </div>
          <textarea className={formTextAreaClass()} name="description" placeholder="Incident description" required />
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Create alert</button>
        </form>
      ) : null}

      <div className="grid gap-3">
        {alerts.length === 0 ? emptyState("No alerts found for the selected filters.") : null}
        {alerts.map((alert) => (
          <ListCard
            key={alert.id}
            title={alert.title}
            subtitle={alert.description}
            href={`/floor/alerts/${alert.id}`}
            badges={alertBadge(alert.severity, alert.status)}
            meta={`Reporter: ${alert.reporter.name} · Owner: ${alert.owner?.name ?? "Unassigned"} · ${alert.createdAt.toLocaleString("en-US")}`}
          />
        ))}
      </div>
    </div>
  );
}


