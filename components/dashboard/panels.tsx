import { AlertSeverity, AlertStatus, OrderStatus, ServiceStatus, ShiftNoteVisibility, TaskStatus } from "@prisma/client";

import {
  DashboardActivity,
  DashboardAlert,
  DashboardOrder,
  DashboardSchedule,
  DashboardService,
  DashboardShiftNote,
  DashboardTask,
  OperationalSummary,
  StatusWidget,
} from "@/lib/dashboard-data";
import { roleLabel } from "@/lib/authz";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function toneForAlertSeverity(severity: AlertSeverity): "default" | "secondary" | "destructive" | "outline" {
  if (severity === AlertSeverity.CRITICAL || severity === AlertSeverity.HIGH) return "destructive";
  if (severity === AlertSeverity.MEDIUM) return "secondary";
  return "outline";
}

function toneForTaskStatus(status: TaskStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === TaskStatus.BLOCKED) return "destructive";
  if (status === TaskStatus.IN_PROGRESS) return "default";
  if (status === TaskStatus.TODO) return "secondary";
  return "outline";
}

function toneForOrderStatus(status: OrderStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === OrderStatus.PENDING) return "secondary";
  if (status === OrderStatus.IN_PROGRESS || status === OrderStatus.READY) return "default";
  if (status === OrderStatus.CANCELLED) return "destructive";
  return "outline";
}

function toneForServiceStatus(status: ServiceStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === ServiceStatus.ACTIVE) return "default";
  if (status === ServiceStatus.PLANNED) return "secondary";
  if (status === ServiceStatus.CANCELLED) return "destructive";
  return "outline";
}

function toneForAlertStatus(status: AlertStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === AlertStatus.ESCALATED) return "destructive";
  if (status === AlertStatus.OPEN) return "secondary";
  if (status === AlertStatus.ACKNOWLEDGED) return "default";
  return "outline";
}

function toneForNoteVisibility(visibility: ShiftNoteVisibility): "default" | "secondary" | "destructive" | "outline" {
  if (visibility === ShiftNoteVisibility.MANAGEMENT) return "default";
  if (visibility === ShiftNoteVisibility.TEAM) return "secondary";
  return "outline";
}

function toneForWidgetStatus(status: StatusWidget["status"]): "default" | "secondary" | "destructive" | "outline" {
  if (status === "critical") return "destructive";
  if (status === "warning") return "secondary";
  if (status === "good") return "default";
  return "outline";
}

function enumToLabel(value: string) {
  return value.toLowerCase().replaceAll("_", " ");
}

export function GeneralStatusWidgets({ widgets }: { widgets: StatusWidget[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>General Status</CardTitle>
        <CardDescription>Live operational indicators across key workflows.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {widgets.map((widget) => (
          <div key={widget.label} className="rounded-lg border bg-muted/20 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">{widget.label}</p>
              <Badge variant={toneForWidgetStatus(widget.status)}>{widget.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{widget.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AlertsPanel({ alerts }: { alerts: DashboardAlert[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Alerts Panel</CardTitle>
        <CardDescription>Open incidents and escalation-sensitive items.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? <p className="text-sm text-muted-foreground">No open alerts.</p> : null}
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{alert.title}</p>
              <div className="flex items-center gap-1">
                <Badge variant={toneForAlertSeverity(alert.severity)}>{enumToLabel(alert.severity)}</Badge>
                <Badge variant={toneForAlertStatus(alert.status)}>{enumToLabel(alert.status)}</Badge>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Owner: {alert.owner} · {dateTimeFormatter.format(alert.createdAt)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function SchedulePreviewPanel({ schedules }: { schedules: DashboardSchedule[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Schedule Preview</CardTitle>
        <CardDescription>Upcoming shifts and role allocations.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {schedules.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming schedules.</p> : null}
        {schedules.map((schedule) => (
          <div key={schedule.id} className="rounded-lg border p-3 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{schedule.user}</p>
              <Badge variant="outline">{roleLabel(schedule.roleAtShift)}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {dateTimeFormatter.format(schedule.shiftStart)} - {dateTimeFormatter.format(schedule.shiftEnd)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{schedule.serviceName ?? "No linked service"}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ShiftNotesPanel({ notes }: { notes: DashboardShiftNote[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Notes Preview</CardTitle>
        <CardDescription>Latest notes available for your scope.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {notes.length === 0 ? <p className="text-sm text-muted-foreground">No recent notes.</p> : null}
        {notes.map((note) => (
          <div key={note.id} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{note.title}</p>
              <Badge variant={toneForNoteVisibility(note.visibility)}>{enumToLabel(note.visibility)}</Badge>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{note.content}</p>
            <p className="mt-2 text-xs text-muted-foreground">{note.author} · {dateTimeFormatter.format(note.createdAt)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function RecentActivityPanel({ activities }: { activities: DashboardActivity[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Recent system actions and operational changes.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? <p className="text-sm text-muted-foreground">No recent activity.</p> : null}
        {activities.map((activity) => (
          <div key={activity.id} className="rounded-lg border p-3 text-sm">
            <p className="font-medium">{activity.actor}</p>
            <p className="text-xs text-muted-foreground">{activity.action.replaceAll("_", " ")} · {activity.entityType}</p>
            <p className="mt-1 text-xs text-muted-foreground">{dateTimeFormatter.format(activity.createdAt)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function TaskListPanel({ title, description, tasks }: { title: string; description: string; tasks: DashboardTask[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? <p className="text-sm text-muted-foreground">No tasks in this view.</p> : null}
        {tasks.map((task) => (
          <div key={task.id} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{task.title}</p>
              <Badge variant={toneForTaskStatus(task.status)}>{enumToLabel(task.status)}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Assignee: {task.assignee}</p>
            <p className="mt-1 text-xs text-muted-foreground">{task.serviceName ?? "No linked service"}</p>
            <p className="mt-1 text-xs text-muted-foreground">Due: {task.dueAt ? dateTimeFormatter.format(task.dueAt) : "No due date"}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function OrderQueuePanel({ orders }: { orders: DashboardOrder[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Incoming Orders</CardTitle>
        <CardDescription>Current order queue requiring operational attention.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {orders.length === 0 ? <p className="text-sm text-muted-foreground">No active orders.</p> : null}
        {orders.map((order) => (
          <div key={order.id} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">#{order.ticketNumber} · {order.tableLabel}</p>
              <Badge variant={toneForOrderStatus(order.status)}>{enumToLabel(order.status)}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Station: {order.station} · Priority: {order.priority}</p>
            <p className="mt-1 text-xs text-muted-foreground">Service: {order.serviceName}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function ServiceStatusPanel({ services }: { services: DashboardService[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Status</CardTitle>
        <CardDescription>Current status of planned and active services.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {services.length === 0 ? <p className="text-sm text-muted-foreground">No services in this view.</p> : null}
        {services.map((service) => (
          <div key={service.id} className="rounded-lg border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{service.name}</p>
              <Badge variant={toneForServiceStatus(service.status)}>{enumToLabel(service.status)}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Shift: {service.shift} · Open orders: {service.openOrders}</p>
            <p className="mt-1 text-xs text-muted-foreground">{dateTimeFormatter.format(service.serviceDate)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function OperationalSummaryPanel({ summaries }: { summaries: OperationalSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational Summary</CardTitle>
        <CardDescription>Snapshot of key operational totals.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {summaries.map((summary) => (
          <div key={summary.label} className="rounded-lg border bg-muted/20 p-3">
            <p className="text-xs text-muted-foreground">{summary.label}</p>
            <p className="mt-1 text-xl font-semibold">{summary.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}



