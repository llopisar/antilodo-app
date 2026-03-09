import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";

import { updateServiceAction } from "@/features/operations/actions";
import { canManageServices, canViewScope } from "@/features/operations/permissions";
import { getService } from "@/features/operations/queries";
import { ModuleHeader, SectionCard, formGridClass, formInputClass, formTextAreaClass, serviceStatusBadge } from "@/components/operations/ui";
import { requireUser } from "@/lib/authz";

const scope = "kitchen" as const;
type Props = { params: Promise<{ id: string }> };

export default async function KitchenServiceDetailPage({ params }: Props) {
  const user = await requireUser();
  if (!canViewScope(user.role as UserRole, scope)) return null;
  const { id } = await params;
  const service = await getService(id);
  if (!service) notFound();

  const canManage = canManageServices(user.role as UserRole, scope);

  return (
    <div className="space-y-4">
      <ModuleHeader title={service.name} description="Service detail, status updates, and related operations." />
      <p className="text-sm text-muted-foreground">{service.shift} · {service.floorArea} · {serviceStatusBadge(service.status)}</p>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Operational Snapshot">
          <p className="text-sm">Service date: {service.serviceDate.toLocaleString("en-US")}</p>
          <p className="text-sm">Orders: {service.orders.length}</p>
          <p className="text-sm">Tasks: {service.tasks.length}</p>
          <p className="text-sm">Schedules: {service.schedules.length}</p>
          <p className="text-xs text-muted-foreground">Updated: {service.updatedAt.toLocaleString("en-US")}</p>
        </SectionCard>
        <SectionCard title="Notes">
          <p className="text-sm">{service.notes ?? "No notes."}</p>
        </SectionCard>
      </div>

      {canManage ? (
        <form action={updateServiceAction.bind(null, scope)} className="space-y-3 rounded-lg border bg-card p-4">
          <input name="id" type="hidden" value={service.id} />
          <h2 className="text-sm font-semibold">Edit Service</h2>
          <div className={formGridClass()}>
            <input className={formInputClass()} defaultValue={service.name} name="name" required />
            <input className={formInputClass()} defaultValue={new Date(service.serviceDate.getTime() - (service.serviceDate.getTimezoneOffset() * 60000)).toISOString().slice(0,16)} name="serviceDate" required type="datetime-local" />
            <input className={formInputClass()} defaultValue={service.shift} name="shift" required />
            <input className={formInputClass()} defaultValue={service.floorArea} name="floorArea" required />
            <select className={formInputClass()} defaultValue={service.status} name="status" required>
              <option value="PLANNED">planned</option>
              <option value="ACTIVE">active</option>
              <option value="COMPLETED">completed</option>
              <option value="CANCELLED">cancelled</option>
            </select>
          </div>
          <textarea className={formTextAreaClass()} defaultValue={service.notes ?? ""} name="notes" />
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Save changes</button>
        </form>
      ) : <p className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">Read-only access.</p>}

      <Link className="text-sm underline" href="/kitchen/services">Back to services</Link>
    </div>
  );
}

