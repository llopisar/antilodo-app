import Link from "next/link";
import { ReactNode } from "react";
import { AlertSeverity, AlertStatus, OrderStatus, ServiceStatus, ShiftNoteVisibility, TaskStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function ModuleHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function FilterForm({
  action,
  query,
  status,
  statusOptions,
}: {
  action: string;
  query?: string;
  status?: string;
  statusOptions: string[];
}) {
  return (
    <form action={action} className="grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-[1fr_180px_auto]">
      <input
        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        defaultValue={query ?? ""}
        name="q"
        placeholder="Search"
      />
      <select
        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        defaultValue={status ?? ""}
        name="status"
      >
        <option value="">All statuses</option>
        {statusOptions.map((item) => (
          <option key={item} value={item}>
            {item.replaceAll("_", " ").toLowerCase()}
          </option>
        ))}
      </select>
      <button className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground" type="submit">
        Apply
      </button>
    </form>
  );
}

export function InlineStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

export function ListCard({
  title,
  subtitle,
  href,
  badges,
  meta,
}: {
  title: string;
  subtitle?: string;
  href: string;
  badges?: ReactNode;
  meta?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">
            <Link className="hover:underline" href={href}>
              {title}
            </Link>
          </CardTitle>
          {badges}
        </div>
        {subtitle ? <CardDescription>{subtitle}</CardDescription> : null}
      </CardHeader>
      {meta ? <CardContent className="pt-0 text-xs text-muted-foreground">{meta}</CardContent> : null}
    </Card>
  );
}

export function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

export function statusBadge(status: string) {
  return <Badge variant="outline">{status.replaceAll("_", " ").toLowerCase()}</Badge>;
}

export function orderStatusBadge(status: OrderStatus) {
  const variant = status === OrderStatus.CANCELLED ? "destructive" : status === OrderStatus.PENDING ? "secondary" : "default";
  return <Badge variant={variant}>{status.replaceAll("_", " ").toLowerCase()}</Badge>;
}

export function serviceStatusBadge(status: ServiceStatus) {
  const variant = status === ServiceStatus.CANCELLED ? "destructive" : status === ServiceStatus.PLANNED ? "secondary" : "default";
  return <Badge variant={variant}>{status.replaceAll("_", " ").toLowerCase()}</Badge>;
}

export function taskStatusBadge(status: TaskStatus) {
  const variant = status === TaskStatus.BLOCKED ? "destructive" : status === TaskStatus.TODO ? "secondary" : "default";
  return <Badge variant={variant}>{status.replaceAll("_", " ").toLowerCase()}</Badge>;
}

export function alertBadge(severity: AlertSeverity, status: AlertStatus) {
  const severityVariant = severity === AlertSeverity.CRITICAL || severity === AlertSeverity.HIGH ? "destructive" : severity === AlertSeverity.MEDIUM ? "secondary" : "outline";
  const statusVariant = status === AlertStatus.ESCALATED ? "destructive" : status === AlertStatus.OPEN ? "secondary" : "default";
  return (
    <div className="flex items-center gap-1">
      <Badge variant={severityVariant}>{severity.toLowerCase()}</Badge>
      <Badge variant={statusVariant}>{status.toLowerCase()}</Badge>
    </div>
  );
}

export function noteVisibilityBadge(visibility: ShiftNoteVisibility) {
  const variant = visibility === ShiftNoteVisibility.MANAGEMENT ? "default" : visibility === ShiftNoteVisibility.TEAM ? "secondary" : "outline";
  return <Badge variant={variant}>{visibility.toLowerCase()}</Badge>;
}

export function emptyState(text: string) {
  return <p className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">{text}</p>;
}

export function formInputClass() {
  return "h-9 rounded-md border border-input bg-background px-3 text-sm w-full";
}

export function formTextAreaClass() {
  return "min-h-[96px] rounded-md border border-input bg-background px-3 py-2 text-sm w-full";
}

export function formGridClass(columns = "sm:grid-cols-2") {
  return cn("grid gap-3", columns);
}

