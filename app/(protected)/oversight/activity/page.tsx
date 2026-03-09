import { Prisma } from "@prisma/client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { requireManagementUser } from "@/lib/authz";

const entityOptions = ["Order", "Schedule", "Task", "ShiftNote", "AlertIncident"] as const;

function parseDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function fmtDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

type Props = {
  searchParams: Promise<{
    entityType?: string;
    userId?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function ActivityPage({ searchParams }: Props) {
  await requireManagementUser();
  const params = await searchParams;

  const fromDate = parseDate(params.from);
  const toDate = parseDate(params.to);

  const where: Prisma.ActivityLogWhereInput = {
    ...(params.entityType ? { entityType: params.entityType } : {}),
    ...(params.userId ? { actorId: params.userId } : {}),
    ...(fromDate || toDate
      ? {
          createdAt: {
            ...(fromDate ? { gte: fromDate } : {}),
            ...(toDate ? { lte: toDate } : {}),
          },
        }
      : {}),
  };

  const [rows, users] = await Promise.all([
    db.activityLog.findMany({
      where,
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      take: 300,
    }),
    db.user.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Activity History</h1>
        <p className="text-sm text-muted-foreground">
          Audit trail of sensitive operational actions with actor, action type, timestamp, and entity context.
        </p>
      </div>

      <form action="/oversight/activity" className="grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-5">
        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" defaultValue={params.entityType ?? ""} name="entityType">
          <option value="">All entities</option>
          {entityOptions.map((entity) => (
            <option key={entity} value={entity}>{entity}</option>
          ))}
        </select>

        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" defaultValue={params.userId ?? ""} name="userId">
          <option value="">All users</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>

        <input className="h-9 rounded-md border border-input bg-background px-3 text-sm" defaultValue={params.from ?? ""} name="from" type="date" />
        <input className="h-9 rounded-md border border-input bg-background px-3 text-sm" defaultValue={params.to ?? ""} name="to" type="date" />
        <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">Apply</button>
      </form>

      <div className="grid gap-3 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Events</CardDescription><CardTitle className="text-2xl">{rows.length}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Order/Schedule/Task</CardDescription><CardTitle className="text-2xl">{rows.filter((r) => ["Order", "Schedule", "Task"].includes(r.entityType)).length}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Shift Notes</CardDescription><CardTitle className="text-2xl">{rows.filter((r) => r.entityType === "ShiftNote").length}</CardTitle></CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Alerts</CardDescription><CardTitle className="text-2xl">{rows.filter((r) => r.entityType === "AlertIncident").length}</CardTitle></CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit Entries</CardTitle>
          <CardDescription>Latest sensitive changes across core operational modules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity entries match the selected filters.</p>
          ) : null}

          {rows.map((row) => (
            <div key={row.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{row.action.replaceAll("_", " ")}</p>
                <div className="flex items-center gap-1">
                  <Badge variant="outline">{row.entityType}</Badge>
                  <Badge variant="secondary">{fmtDate(row.createdAt)}</Badge>
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Actor: {row.actor?.name ?? "System"}</p>
              <p className="text-xs text-muted-foreground">Entity ID: {row.entityId}</p>
              {row.before || row.after ? (
                <details className="mt-2 text-xs text-muted-foreground">
                  <summary className="cursor-pointer">View change payload</summary>
                  <div className="mt-2 grid gap-2 lg:grid-cols-2">
                    <pre className="overflow-auto rounded-md bg-muted/40 p-2">{JSON.stringify(row.before, null, 2)}</pre>
                    <pre className="overflow-auto rounded-md bg-muted/40 p-2">{JSON.stringify(row.after, null, 2)}</pre>
                  </div>
                </details>
              ) : null}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
