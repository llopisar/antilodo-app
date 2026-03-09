import { UserRole } from "@prisma/client";

import { MetricCard, SectionPanel } from "@/components/dashboard/metric-card";
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
import { RoleDashboardData } from "@/lib/dashboard-data";

export function ManagementOverviewPanel({ role, data }: { role: UserRole; data: RoleDashboardData }) {
  const activeOrders = data.orders.length;
  const serviceActive = data.services.filter((service) => service.status === "ACTIVE").length;
  const servicePlanned = data.services.filter((service) => service.status === "PLANNED").length;
  const openAlerts = data.alerts.length;
  const pendingTasks = data.tasks.length;
  const upcomingSchedules = data.schedules.length;
  const recentNotes = data.shiftNotes.length;
  const recentChanges = data.activities.length;

  const healthDescriptor =
    openAlerts >= 4 || pendingTasks >= 8
      ? "Attention needed"
      : openAlerts > 0 || pendingTasks > 0
        ? "Stable with watch items"
        : "Healthy";

  const healthValue =
    openAlerts >= 4 || pendingTasks >= 8
      ? "Warning"
      : openAlerts > 0 || pendingTasks > 0
        ? "Monitor"
        : "Good";

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active Orders Summary"
          value={String(activeOrders)}
          description="Orders in active processing stages across services."
        />
        <MetricCard
          title="Service Status Summary"
          value={`${serviceActive} active / ${servicePlanned} planned`}
          description="Current live and upcoming service windows."
        />
        <MetricCard
          title="Current Schedules Overview"
          value={String(upcomingSchedules)}
          description="Upcoming shifts currently visible in the planning window."
        />
        <MetricCard
          title="Open Alerts Count"
          value={String(openAlerts)}
          description="Open, acknowledged, and escalated incidents."
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Pending Tasks Count"
          value={String(pendingTasks)}
          description="Tasks that remain unresolved across teams."
        />
        <MetricCard
          title="Recent Shift Notes"
          value={String(recentNotes)}
          description="Most recent team and management shift notes."
        />
        <MetricCard
          title="Recent Operational Changes"
          value={String(recentChanges)}
          description="Latest logged operational actions and updates."
        />
        <MetricCard
          title="Operational Health"
          value={healthValue}
          description={healthDescriptor}
        />
      </section>

      <GeneralStatusWidgets widgets={data.statusWidgets} />

      <section className="grid gap-4 xl:grid-cols-2">
        <OperationalSummaryPanel summaries={data.operationalSummaries} />
        <SectionPanel
          title="Management Focus"
          description="High-level supervision snapshot tailored to your role."
        >
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Role: {role === "GENERAL_MANAGER" ? "General Manager" : "Manager"}</p>
            <p>Priority queue: {openAlerts} alerts and {pendingTasks} pending tasks.</p>
            <p>Schedule load: {upcomingSchedules} upcoming assignments.</p>
          </div>
        </SectionPanel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <OrderQueuePanel orders={data.orders} />
        <ServiceStatusPanel services={data.services} />
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <AlertsPanel alerts={data.alerts} />
        <TaskListPanel
          title="Pending Tasks"
          description="Tasks currently pending completion or follow-up."
          tasks={data.tasks}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <SchedulePreviewPanel schedules={data.schedules} />
        <ShiftNotesPanel notes={data.shiftNotes} />
        <RecentActivityPanel activities={data.activities} />
      </section>
    </div>
  );
}
