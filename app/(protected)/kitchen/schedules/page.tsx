import { UserRole } from "@prisma/client";

import { createScheduleAction } from "@/features/operations/actions";
import { canManageSchedules, canViewScope } from "@/features/operations/permissions";
import { getFormOptions, listSchedules } from "@/features/operations/queries";
import {
  FilterForm,
  InlineStat,
  ListCard,
  ModuleHeader,
  emptyState,
  formGridClass,
  formInputClass,
  statusBadge,
} from "@/components/operations/ui";
import { roleLabel, requireUser } from "@/lib/authz";

const scope = "kitchen" as const;
type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function KitchenSchedulesPage({ searchParams }: Props) {
  const user = await requireUser();
  if (!canViewScope(user.role as UserRole, scope)) return null;

  const params = await searchParams;
  const [schedules, options] = await Promise.all([
    listSchedules(scope, params.q, params.status),
    getFormOptions(scope),
  ]);
  const canManage = canManageSchedules(user.role as UserRole, scope);

  return (
    <div className="space-y-4">
      <ModuleHeader title="Kitchen Schedules" description="Shift planning, assignments, and staffing visibility for kitchen roles." />
      <div className="grid gap-3 sm:grid-cols-3">
        <InlineStat label="Entries" value={String(schedules.length)} />
        <InlineStat label="Today" value={String(schedules.filter((s) => s.shiftStart.toDateString() === new Date().toDateString()).length)} />
        <InlineStat label="Distinct users" value={String(new Set(schedules.map((s) => s.userId)).size)} />
      </div>

      <FilterForm action="/kitchen/schedules" query={params.q} status={params.status} statusOptions={["HEAD_CHEF", "SOUS_CHEF"]} />

      {canManage ? (
        <form action={createScheduleAction.bind(null, scope)} className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">Create Schedule Entry</h2>
          <div className={formGridClass()}>
            <select className={formInputClass()} name="userId" required>
              <option value="">Select user</option>
              {options.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select className={formInputClass()} name="roleAtShift" required>
              <option value="HEAD_CHEF">head chef</option>
              <option value="SOUS_CHEF">sous chef</option>
            </select>
            <input className={formInputClass()} name="shiftStart" required type="datetime-local" />
            <input className={formInputClass()} name="shiftEnd" required type="datetime-local" />
            <select className={formInputClass()} name="serviceId">
              <option value="">No linked service</option>
              {options.services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
            <input className={formInputClass()} name="notes" placeholder="Notes" />
          </div>
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Create schedule</button>
        </form>
      ) : null}

      <div className="grid gap-3">
        {schedules.length === 0 ? emptyState("No schedules found for the selected filters.") : null}
        {schedules.map((schedule) => (
          <ListCard
            key={schedule.id}
            title={`${schedule.user.name} · ${roleLabel(schedule.roleAtShift)}`}
            subtitle={`${schedule.shiftStart.toLocaleString("en-US")} - ${schedule.shiftEnd.toLocaleString("en-US")}`}
            href={`/kitchen/schedules/${schedule.id}`}
            badges={statusBadge(schedule.roleAtShift)}
            meta={`${schedule.service?.name ?? "No linked service"}${schedule.notes ? ` · ${schedule.notes}` : ""}`}
          />
        ))}
      </div>
    </div>
  );
}


