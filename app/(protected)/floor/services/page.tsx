import Link from "next/link";
import { UserRole } from "@prisma/client";

import { createServiceAction } from "@/features/operations/actions";
import { canManageServices, canViewScope } from "@/features/operations/permissions";
import { listServices } from "@/features/operations/queries";
import {
  FilterForm,
  InlineStat,
  ListCard,
  ModuleHeader,
  emptyState,
  formGridClass,
  formInputClass,
  formTextAreaClass,
  serviceStatusBadge,
} from "@/components/operations/ui";
import { requireUser } from "@/lib/authz";

const scope = "floor" as const;

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function FloorServicesPage({ searchParams }: Props) {
  const user = await requireUser();
  if (!canViewScope(user.role as UserRole, scope)) return null;

  const params = await searchParams;
  const services = await listServices(params.q, params.status);
  const canManage = canManageServices(user.role as UserRole, scope);

  return (
    <div className="space-y-4">
      <ModuleHeader title="Floor Services" description="Service coordination and service-level status tracking." />
      <div className="grid gap-3 sm:grid-cols-3">
        <InlineStat label="Total" value={String(services.length)} />
        <InlineStat label="Active" value={String(services.filter((s) => s.status === "ACTIVE").length)} />
        <InlineStat label="Completed" value={String(services.filter((s) => s.status === "COMPLETED").length)} />
      </div>

      <FilterForm action="/floor/services" query={params.q} status={params.status} statusOptions={["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]} />

      {canManage ? (
        <form action={createServiceAction.bind(null, scope)} className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">Create Service</h2>
          <div className={formGridClass()}>
            <input className={formInputClass()} name="name" placeholder="Service name" required />
            <input className={formInputClass()} name="serviceDate" required type="datetime-local" />
            <input className={formInputClass()} name="shift" placeholder="Shift" required />
            <input className={formInputClass()} name="floorArea" placeholder="Floor area" required />
          </div>
          <textarea className={formTextAreaClass()} name="notes" placeholder="Notes" />
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Create service</button>
        </form>
      ) : null}

      <div className="grid gap-3">
        {services.length === 0 ? emptyState("No services found for the selected filters.") : null}
        {services.map((service) => (
          <ListCard
            key={service.id}
            title={service.name}
            subtitle={`${service.shift} · ${service.floorArea}`}
            href={`/floor/services/${service.id}`}
            badges={serviceStatusBadge(service.status)}
            meta={`Orders: ${service.orders.length} · Tasks: ${service.tasks.length} · Schedules: ${service.schedules.length}`}
          />
        ))}
      </div>
    </div>
  );
}

