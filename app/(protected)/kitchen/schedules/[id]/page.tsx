import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";

import { updateScheduleAction } from "@/features/operations/actions";
import { canManageSchedules, canViewScope } from "@/features/operations/permissions";
import { getFormOptions, getSchedule } from "@/features/operations/queries";
import { ModuleHeader, SectionCard, formGridClass, formInputClass, statusBadge } from "@/components/operations/ui";
import { roleLabel, requireUser } from "@/lib/authz";

const scope = "kitchen" as const;
type Props = { params: Promise<{ id: string }> };

export default async function KitchenScheduleDetailPage({ params }: Props) {
  const user = await requireUser();
  if (!canViewScope(user.role as UserRole, scope)) return null;
  const { id } = await params;
  const [schedule, options] = await Promise.all([getSchedule(id), getFormOptions(scope)]);
  if (!schedule) notFound();

  const canManage = canManageSchedules(user.role as UserRole, scope);

  return (
    <div className="space-y-4">
      <ModuleHeader title={`Schedule · ${schedule.user.name}`} description="Shift assignment details and update controls." />
      <p className="text-sm text-muted-foreground">{roleLabel(schedule.roleAtShift)} · {statusBadge(schedule.roleAtShift)}</p>

      <SectionCard title="Schedule Details">
        <p className="text-sm">Start: {schedule.shiftStart.toLocaleString("en-US")}</p>
        <p className="text-sm">End: {schedule.shiftEnd.toLocaleString("en-US")}</p>
        <p className="text-sm">Service: {schedule.service?.name ?? "No linked service"}</p>
        <p className="text-sm">Notes: {schedule.notes ?? "No notes"}</p>
      </SectionCard>

      {canManage ? (
        <form action={updateScheduleAction.bind(null, scope)} className="space-y-3 rounded-lg border bg-card p-4">
          <input name="id" type="hidden" value={schedule.id} />
          <h2 className="text-sm font-semibold">Edit Schedule</h2>
          <div className={formGridClass()}>
            <select className={formInputClass()} defaultValue={schedule.userId} name="userId" required>
              {options.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select className={formInputClass()} defaultValue={schedule.roleAtShift} name="roleAtShift" required>
              <option value="HEAD_CHEF">head chef</option>
              <option value="SOUS_CHEF">sous chef</option>
            </select>
            <input className={formInputClass()} defaultValue={new Date(schedule.shiftStart.getTime() - (schedule.shiftStart.getTimezoneOffset() * 60000)).toISOString().slice(0,16)} name="shiftStart" required type="datetime-local" />
            <input className={formInputClass()} defaultValue={new Date(schedule.shiftEnd.getTime() - (schedule.shiftEnd.getTimezoneOffset() * 60000)).toISOString().slice(0,16)} name="shiftEnd" required type="datetime-local" />
            <select className={formInputClass()} defaultValue={schedule.serviceId ?? ""} name="serviceId">
              <option value="">No linked service</option>
              {options.services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
            <input className={formInputClass()} defaultValue={schedule.notes ?? ""} name="notes" />
          </div>
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Save changes</button>
        </form>
      ) : <p className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">Read-only access.</p>}

      <Link className="text-sm underline" href="/kitchen/schedules">Back to schedules</Link>
    </div>
  );
}

