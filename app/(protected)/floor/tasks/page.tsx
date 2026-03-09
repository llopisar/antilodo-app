import Link from "next/link";
import { UserRole } from "@prisma/client";

import { createTaskAction } from "@/features/operations/actions";
import { canManageTasks, canViewScope } from "@/features/operations/permissions";
import { getFormOptions, listTasks } from "@/features/operations/queries";
import {
  FilterForm,
  InlineStat,
  ListCard,
  ModuleHeader,
  emptyState,
  formGridClass,
  formInputClass,
  formTextAreaClass,
  taskStatusBadge,
} from "@/components/operations/ui";
import { requireUser } from "@/lib/authz";

const scope = "floor" as const;
type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function FloorTasksPage({ searchParams }: Props) {
  const user = await requireUser();
  if (!canViewScope(user.role as UserRole, scope)) return null;

  const params = await searchParams;
  const [tasks, options] = await Promise.all([
    listTasks(scope, params.q, params.status),
    getFormOptions(scope),
  ]);
  const canManage = canManageTasks(user.role as UserRole, scope);

  return (
    <div className="space-y-4">
      <ModuleHeader title="Floor Tasks" description="Service coordination tasks, assignments, and status tracking." />
      <div className="grid gap-3 sm:grid-cols-4">
        <InlineStat label="Total" value={String(tasks.length)} />
        <InlineStat label="Todo" value={String(tasks.filter((t) => t.status === "TODO").length)} />
        <InlineStat label="In progress" value={String(tasks.filter((t) => t.status === "IN_PROGRESS").length)} />
        <InlineStat label="Blocked" value={String(tasks.filter((t) => t.status === "BLOCKED").length)} />
      </div>

      <FilterForm action="/floor/tasks" query={params.q} status={params.status} statusOptions={["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]} />

      {canManage ? (
        <form action={createTaskAction.bind(null, scope)} className="space-y-3 rounded-lg border bg-card p-4">
          <h2 className="text-sm font-semibold">Create Task</h2>
          <div className={formGridClass()}>
            <input className={formInputClass()} name="title" placeholder="Title" required />
            <select className={formInputClass()} name="assignedToId" required>
              <option value="">Assign to user</option>
              {options.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select className={formInputClass()} name="status" required>
              <option value="TODO">todo</option>
              <option value="IN_PROGRESS">in progress</option>
              <option value="DONE">done</option>
              <option value="BLOCKED">blocked</option>
            </select>
            <input className={formInputClass()} name="dueAt" type="datetime-local" />
            <select className={formInputClass()} name="serviceId">
              <option value="">No service</option>
              {options.services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>
            <select className={formInputClass()} name="orderId">
              <option value="">No order</option>
              {options.orders.map((order) => <option key={order.id} value={order.id}>{order.ticketNumber}</option>)}
            </select>
          </div>
          <textarea className={formTextAreaClass()} name="description" placeholder="Task description" required />
          <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Create task</button>
        </form>
      ) : null}

      <div className="grid gap-3">
        {tasks.length === 0 ? emptyState("No tasks found for the selected filters.") : null}
        {tasks.map((task) => (
          <ListCard
            key={task.id}
            title={task.title}
            subtitle={task.description}
            href={`/floor/tasks/${task.id}`}
            badges={taskStatusBadge(task.status)}
            meta={`Assignee: ${task.assignedTo.name} · Due: ${task.dueAt ? task.dueAt.toLocaleString("en-US") : "None"}`}
          />
        ))}
      </div>
    </div>
  );
}

