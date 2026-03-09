import { notFound, redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

import { MetricCard } from "@/components/dashboard/metric-card";
import {
  AlertsPanel,
  GeneralStatusWidgets,
  OperationalSummaryPanel,
  OrderQueuePanel,
  RecentActivityPanel,
  SchedulePreviewPanel,
  ServiceStatusPanel,
  ShiftNotesPanel,
  TaskListPanel,
} from "@/components/dashboard/panels";
import { requireUser, roleLabel } from "@/lib/authz";
import { DASHBOARD_SLUG_TO_ROLE } from "@/lib/dashboard";
import { getRoleDashboardData } from "@/lib/dashboard-data";

type DashboardRolePageProps = {
  params: Promise<{ role: keyof typeof DASHBOARD_SLUG_TO_ROLE }>;
};

const roleFocus: Record<UserRole, string> = {
  HEAD_CHEF: "Kitchen operations center for orders, service execution, shifts, and critical alerts.",
  SOUS_CHEF: "Execution-focused kitchen view with assigned tasks and operational coordination details.",
  FLOOR_MANAGER: "Front-of-house coordination view for service flow, staffing, notes, and alerts.",
  MANAGER: "Operational oversight view for cross-team monitoring, summaries, and recent activity.",
  GENERAL_MANAGER: "Executive operations view with high-level status, audit insights, and activity visibility.",
};

export default async function DashboardRolePage({ params }: DashboardRolePageProps) {
  const user = await requireUser();
  const resolved = await params;
  const expectedRole = DASHBOARD_SLUG_TO_ROLE[resolved.role];

  if (!expectedRole) {
    notFound();
  }

  if (user.role !== expectedRole) {
    redirect("/forbidden");
  }

  const data = await getRoleDashboardData(user.role, user.id);

  const isKitchenRole = user.role === UserRole.HEAD_CHEF || user.role === UserRole.SOUS_CHEF;
  const isFloorManager = user.role === UserRole.FLOOR_MANAGER;
  const isManager = user.role === UserRole.MANAGER;
  const isGeneralManager = user.role === UserRole.GENERAL_MANAGER;

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">{roleLabel(user.role)} Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">{roleFocus[user.role]}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <MetricCard key={metric.title} title={metric.title} value={metric.value} description={metric.description} />
        ))}
      </section>

      <GeneralStatusWidgets widgets={data.statusWidgets} />

      <section className="grid gap-4 xl:grid-cols-2">
        {isKitchenRole ? <OrderQueuePanel orders={data.orders} /> : null}
        {isKitchenRole ? (
          <TaskListPanel
            title={user.role === UserRole.HEAD_CHEF ? "Active Kitchen Tasks" : "Assigned Kitchen Tasks"}
            description={
              user.role === UserRole.HEAD_CHEF
                ? "Kitchen tasks across the current team scope."
                : "Your assigned kitchen execution tasks."
            }
            tasks={data.tasks}
          />
        ) : null}

        {isFloorManager ? (
          <TaskListPanel
            title="Service Coordination Items"
            description="Open floor coordination tasks and service actions."
            tasks={data.tasks}
          />
        ) : null}

        {(isFloorManager || isKitchenRole) ? <ServiceStatusPanel services={data.services} /> : null}

        {(isManager || isGeneralManager) ? <OperationalSummaryPanel summaries={data.operationalSummaries} /> : null}
        {(isManager || isGeneralManager) ? <AlertsPanel alerts={data.alerts} /> : null}
        {(isManager || isGeneralManager) ? <RecentActivityPanel activities={data.activities} /> : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {(!isManager && !isGeneralManager) ? <AlertsPanel alerts={data.alerts} /> : null}
        <SchedulePreviewPanel schedules={data.schedules} />
        <ShiftNotesPanel notes={data.shiftNotes} />
      </section>

      {(isGeneralManager || isManager) ? (
        <section className="grid gap-4 xl:grid-cols-2">
          <ServiceStatusPanel services={data.services} />
          <TaskListPanel
            title={isGeneralManager ? "Operational Workload" : "Monitoring Queue"}
            description={
              isGeneralManager
                ? "Open tasks requiring organizational awareness and follow-up."
                : "Open tasks to monitor execution across teams."
            }
            tasks={data.tasks}
          />
        </section>
      ) : null}
    </div>
  );
}


