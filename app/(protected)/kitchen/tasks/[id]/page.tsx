import Link from "next/link";
import { notFound } from "next/navigation";
import { UserRole } from "@prisma/client";

import { updateTaskAction } from "@/features/operations/actions";
import { canManageTasks, canViewScope } from "@/features/operations/permissions";
import { getFormOptions, getTask } from "@/features/operations/queries";
import { ModuleHeader, SectionCard, formGridClass, formInputClass, formTextAreaClass, taskStatusBadge } from "@/components/operations/ui";
import { requireUser } from "@/lib/authz";

const scope = "kitchen" as const;
type Props = { params: Promise<{ id: string }> };

export default async function KitchenTaskDetailPage({ params }: Props) {
  const user = await requireUser();
  if (!canViewScope(user.role as UserRole, scope)) return null;
  const { id } = await params;
  const [task, options] = await Promise.all([getTask(id), getFormOptions(scope)]);
  if (!task) notFound();

  const canManage = canManageTasks(user.role as UserRole, scope);

  return (
    <div className="space-y-4">
      <ModuleHeader title={task.title} description="Task assignment details, status updates, and linked records." />
      <p className="text-sm text-muted-foreground">{taskStatusBadge(task.status)} · Assigned to {task.assignedTo.name}</p>

      <SectionCard title="Task Details">
        <p className="text-sm whitespace-pre-wrap">{task.description}</p>
        <p className="text-sm">Assigned by: {task.assignedBy.name}</p>
        <p className="text-sm">Due: {task.dueAt ? task.dueAt.toLocaleString("en-US") : "No due date"}</p>
        <p className="text-sm">Service: {task.service?.name ?? "None"}</p>
        <p className="text-sm">Order: {task.order?.ticketNumber ?? "None"}</p>
      </SectionCard>

      {canManage ? (
        <form action={updateTaskAction.bind(null, scope)} className="space-y-3 rounded-lg border bg-card p-4">
          <input name="id" type="hidden" value={task.id} />
          <h2 className="text-sm font-semibold">Edit Task</h2>
          <div className={formGridClass()}>
            <input className={formInputClass()} defaultValue={task.title} name="title" required />
            <select className={formInputClass()} defaultValue={task.assignedToId} name="assignedToId" required>
              {options.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select className={formInputClass()} defaultValue={task.status} name="status" required>
              <option value="TODO">todo</option>
              <option value="IN_PROGRESS">in progress</option>
              <option value="DONE">done</option>
              <option value="BLOCKED">blocked</option>
            </select>
            <input className={formInputClass()} defaultValue={task.dueAt ? new Date(task.dueAt.getTime() - (task.dueAt.getTimezoneOffset() * 60000)).toISOString().slice(0,16) : ""} name="dueAt" type="datetime-local" />
            <select className={formInputClass()} defaultValue={task.serviceId ?? ""} name="serviceId">
              <option value="">No service</option>
              {options.services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
            <select className={formInputClass()} defaultValue={task.orderId ?? ""} name="orderId">
              <option value="">No order</option>
              {options.orders.map((order) => <option key={order.id} value={order.id}>{order.ticketNumber}</option>)}
            </select>
          </div>
          <textarea className={formTextAreaClass()} defaultValue={task.description} name="description" required />
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Save changes</button>
        </form>
      ) : <p className="rounded-lg border bg-card p-3 text-sm text-muted-foreground">Read-only access.</p>}

      <Link className="text-sm underline" href="/kitchen/tasks">Back to tasks</Link>
    </div>
  );
}

