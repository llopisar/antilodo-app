import { AlertSeverity, AlertStatus, OrderStatus, ServiceStatus, ShiftNoteVisibility, TaskStatus, UserRole } from "@prisma/client";

import { db } from "@/lib/db";

export type DashboardMetric = {
  title: string;
  value: string;
  description: string;
};

export type DashboardAlert = {
  id: string;
  title: string;
  severity: AlertSeverity;
  status: AlertStatus;
  owner: string;
  createdAt: Date;
};

export type DashboardOrder = {
  id: string;
  ticketNumber: string;
  tableLabel: string;
  station: string;
  priority: number;
  status: OrderStatus;
  serviceName: string;
};

export type DashboardTask = {
  id: string;
  title: string;
  status: TaskStatus;
  assignee: string;
  dueAt: Date | null;
  serviceName: string | null;
};

export type DashboardService = {
  id: string;
  name: string;
  status: ServiceStatus;
  shift: string;
  serviceDate: Date;
  openOrders: number;
};

export type DashboardShiftNote = {
  id: string;
  title: string;
  content: string;
  visibility: ShiftNoteVisibility;
  author: string;
  createdAt: Date;
};

export type DashboardSchedule = {
  id: string;
  user: string;
  roleAtShift: UserRole;
  shiftStart: Date;
  shiftEnd: Date;
  serviceName: string | null;
};

export type DashboardActivity = {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  createdAt: Date;
};

export type StatusWidget = {
  label: string;
  value: string;
  status: "good" | "warning" | "critical" | "neutral";
};

export type OperationalSummary = {
  label: string;
  value: string;
};

export type RoleDashboardData = {
  metrics: DashboardMetric[];
  alerts: DashboardAlert[];
  orders: DashboardOrder[];
  tasks: DashboardTask[];
  services: DashboardService[];
  shiftNotes: DashboardShiftNote[];
  schedules: DashboardSchedule[];
  activities: DashboardActivity[];
  statusWidgets: StatusWidget[];
  operationalSummaries: OperationalSummary[];
};

const openTaskStatuses: TaskStatus[] = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.BLOCKED];
const openAlertStatuses: AlertStatus[] = [AlertStatus.OPEN, AlertStatus.ACKNOWLEDGED, AlertStatus.ESCALATED];
const activeOrderStatuses: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.IN_PROGRESS, OrderStatus.READY];
const activeServiceStatuses: ServiceStatus[] = [ServiceStatus.ACTIVE, ServiceStatus.PLANNED];

function formatPercent(numerator: number, denominator: number) {
  if (denominator <= 0) return "0%";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function criticalAlertCount(alerts: DashboardAlert[]) {
  return alerts.filter((alert) => alert.severity === AlertSeverity.CRITICAL).length;
}

export async function getRoleDashboardData(role: UserRole, userId: string): Promise<RoleDashboardData> {
  const now = new Date();

  const [alertsRaw, ordersRaw, tasksRaw, servicesRaw, notesRaw, schedulesRaw, activityRaw, userCount] =
    await Promise.all([
      db.alertIncident.findMany({
        where: {
          status: { in: openAlertStatuses },
          ...(role === UserRole.MANAGER || role === UserRole.GENERAL_MANAGER
            ? {}
            : role === UserRole.FLOOR_MANAGER
              ? {
                  reporter: { role: UserRole.FLOOR_MANAGER },
                }
              : {
                  OR: [{ reporter: { role: UserRole.HEAD_CHEF } }, { reporter: { role: UserRole.SOUS_CHEF } }],
                }),
        },
        include: { owner: true },
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: 8,
      }),
      db.order.findMany({
        where: {
          status: { in: activeOrderStatuses },
          ...(role === UserRole.FLOOR_MANAGER
            ? { service: { floorArea: { contains: "Hall" } } }
            : role === UserRole.MANAGER || role === UserRole.GENERAL_MANAGER
              ? {}
              : {}),
        },
        include: { service: true },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: role === UserRole.GENERAL_MANAGER ? 6 : 10,
      }),
      db.task.findMany({
        where: {
          status: { in: openTaskStatuses },
          ...(role === UserRole.SOUS_CHEF
            ? { assignedToId: userId }
            : role === UserRole.HEAD_CHEF
              ? {
                  OR: [
                    { assignedToId: userId },
                    { assignedTo: { role: UserRole.SOUS_CHEF } },
                    { assignedTo: { role: UserRole.HEAD_CHEF } },
                  ],
                }
              : role === UserRole.FLOOR_MANAGER
                ? {
                    OR: [{ assignedToId: userId }, { assignedTo: { role: UserRole.FLOOR_MANAGER } }],
                  }
                : {}),
        },
        include: { assignedTo: true, service: true },
        orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
        take: 10,
      }),
      db.service.findMany({
        where: { status: { in: activeServiceStatuses } },
        include: {
          orders: {
            where: { status: { in: activeOrderStatuses } },
            select: { id: true },
          },
        },
        orderBy: [{ serviceDate: "asc" }, { createdAt: "desc" }],
        take: 6,
      }),
      db.shiftNote.findMany({
        where: {
          ...(role === UserRole.MANAGER || role === UserRole.GENERAL_MANAGER
            ? { visibility: { in: [ShiftNoteVisibility.TEAM, ShiftNoteVisibility.MANAGEMENT] } }
            : { visibility: { in: [ShiftNoteVisibility.TEAM, ShiftNoteVisibility.MANAGEMENT] } }),
        },
        include: { author: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      db.schedule.findMany({
        where: {
          shiftEnd: { gte: now },
          ...(role === UserRole.HEAD_CHEF || role === UserRole.SOUS_CHEF
            ? { roleAtShift: { in: [UserRole.HEAD_CHEF, UserRole.SOUS_CHEF] } }
            : role === UserRole.FLOOR_MANAGER
              ? { roleAtShift: UserRole.FLOOR_MANAGER }
              : {}),
        },
        include: { user: true, service: true },
        orderBy: { shiftStart: "asc" },
        take: 8,
      }),
      db.activityLog.findMany({
        where:
          role === UserRole.MANAGER || role === UserRole.GENERAL_MANAGER
            ? {}
            : {
                OR: [{ actorId: userId }, { entityType: { in: ["Task", "Order", "AlertIncident", "ShiftNote"] } }],
              },
        include: { actor: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.user.count({ where: { isActive: true } }),
    ]);

  const alerts: DashboardAlert[] = alertsRaw.map((alert) => ({
    id: alert.id,
    title: alert.title,
    severity: alert.severity,
    status: alert.status,
    owner: alert.owner?.name ?? "Unassigned",
    createdAt: alert.createdAt,
  }));

  const orders: DashboardOrder[] = ordersRaw.map((order) => ({
    id: order.id,
    ticketNumber: order.ticketNumber,
    tableLabel: order.tableLabel,
    station: order.station,
    priority: order.priority,
    status: order.status,
    serviceName: order.service.name,
  }));

  const tasks: DashboardTask[] = tasksRaw.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    assignee: task.assignedTo.name,
    dueAt: task.dueAt,
    serviceName: task.service?.name ?? null,
  }));

  const services: DashboardService[] = servicesRaw.map((service) => ({
    id: service.id,
    name: service.name,
    status: service.status,
    shift: service.shift,
    serviceDate: service.serviceDate,
    openOrders: service.orders.length,
  }));

  const shiftNotes: DashboardShiftNote[] = notesRaw.map((note) => ({
    id: note.id,
    title: note.title,
    content: note.content,
    visibility: note.visibility,
    author: note.author.name,
    createdAt: note.createdAt,
  }));

  const schedules: DashboardSchedule[] = schedulesRaw.map((schedule) => ({
    id: schedule.id,
    user: schedule.user.name,
    roleAtShift: schedule.roleAtShift,
    shiftStart: schedule.shiftStart,
    shiftEnd: schedule.shiftEnd,
    serviceName: schedule.service?.name ?? null,
  }));

  const activities: DashboardActivity[] = activityRaw.map((activity) => ({
    id: activity.id,
    actor: activity.actor?.name ?? "System",
    action: activity.action,
    entityType: activity.entityType,
    createdAt: activity.createdAt,
  }));

  const openOrders = orders.filter((order) => order.status !== OrderStatus.COMPLETED).length;
  const openTasks = tasks.length;
  const openAlerts = alerts.length;
  const plannedOrActiveServices = services.length;

  const completionReadyOrders = orders.filter((order) => order.status === OrderStatus.READY).length;
  const blockedTasks = tasks.filter((task) => task.status === TaskStatus.BLOCKED).length;

  const metricsByRole: Record<UserRole, DashboardMetric[]> = {
    HEAD_CHEF: [
      { title: "Incoming Orders", value: String(openOrders), description: "Kitchen tickets in active states." },
      { title: "Active Kitchen Tasks", value: String(openTasks), description: "Tasks currently requiring kitchen action." },
      { title: "Service Status", value: `${plannedOrActiveServices} running`, description: "Planned and active service windows." },
      { title: "Critical Alerts", value: String(criticalAlertCount(alerts)), description: "Critical alerts requiring immediate response." },
    ],
    SOUS_CHEF: [
      { title: "Assigned Tasks", value: String(openTasks), description: "Open tasks assigned directly to you." },
      { title: "Orders in Progress", value: String(openOrders), description: "Current kitchen queue relevant to your shift." },
      { title: "Ready to Pass", value: String(completionReadyOrders), description: "Orders ready for service handoff." },
      { title: "Open Alerts", value: String(openAlerts), description: "Open alerts visible to kitchen operations." },
    ],
    FLOOR_MANAGER: [
      { title: "Coordination Items", value: String(openTasks), description: "Open floor coordination tasks." },
      { title: "Service Alerts", value: String(openAlerts), description: "Active front-of-house alert volume." },
      { title: "Upcoming Shifts", value: String(schedules.length), description: "Visible floor schedule entries ahead." },
      { title: "Service Windows", value: String(plannedOrActiveServices), description: "Planned and active service windows." },
    ],
    MANAGER: [
      { title: "Operational Load", value: String(openOrders + openTasks), description: "Open orders and tasks across operations." },
      { title: "Active Alerts", value: String(openAlerts), description: "Current open/acknowledged/escalated alerts." },
      { title: "Shift Coverage", value: formatPercent(schedules.length, 8), description: "Near-term schedule coverage indicator." },
      { title: "Recent Events", value: String(activities.length), description: "Latest tracked activity entries." },
    ],
    GENERAL_MANAGER: [
      { title: "Operational Health", value: formatPercent(openOrders + openTasks, 40), description: "Normalized load indicator across operations." },
      { title: "Executive Alerts", value: String(openAlerts), description: "Alerts currently requiring leadership awareness." },
      { title: "Active Users", value: String(userCount), description: "Users with active accounts in the platform." },
      { title: "Audit Events", value: String(activities.length), description: "Recent activity/audit events in timeline." },
    ],
  };

  const statusWidgets: StatusWidget[] = [
    {
      label: "Service Continuity",
      value: `${plannedOrActiveServices} windows active`,
      status: plannedOrActiveServices > 0 ? "good" : "warning",
    },
    {
      label: "Alert Pressure",
      value: `${openAlerts} unresolved`,
      status: openAlerts >= 4 ? "critical" : openAlerts > 0 ? "warning" : "good",
    },
    {
      label: "Task Flow",
      value: `${openTasks} open / ${blockedTasks} blocked`,
      status: blockedTasks > 0 ? "warning" : openTasks > 0 ? "neutral" : "good",
    },
  ];

  const operationalSummaries: OperationalSummary[] = [
    { label: "Open Orders", value: String(openOrders) },
    { label: "Open Tasks", value: String(openTasks) },
    { label: "Open Alerts", value: String(openAlerts) },
    { label: "Scheduled Shifts", value: String(schedules.length) },
    { label: "Recent Notes", value: String(shiftNotes.length) },
    { label: "Recent Activity", value: String(activities.length) },
  ];

  return {
    metrics: metricsByRole[role],
    alerts,
    orders,
    tasks,
    services,
    shiftNotes,
    schedules,
    activities,
    statusWidgets,
    operationalSummaries,
  };
}


