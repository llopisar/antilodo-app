import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

import { MetricCard, SectionPanel } from "@/components/dashboard/metric-card";
import { DASHBOARD_SLUG_TO_ROLE } from "@/lib/dashboard";
import { navByRole } from "@/lib/navigation";
import { requireUser, roleLabel } from "@/lib/authz";

const roleFocus: Record<UserRole, string> = {
  HEAD_CHEF: "Kitchen execution, service readiness, and station performance",
  SOUS_CHEF: "Station flow, task completion, and shift handoff quality",
  FLOOR_MANAGER: "Floor service quality, staffing coordination, and incident response",
  MANAGER: "Cross-team supervision, KPI monitoring, and operational approvals",
  GENERAL_MANAGER: "Executive oversight, trends, and strategic incident governance",
};

const roleKpis: Record<UserRole, Array<{ title: string; value: string; description: string }>> = {
  HEAD_CHEF: [
    { title: "Kitchen Queue", value: "18", description: "Orders currently active in preparation." },
    { title: "Ready to Pass", value: "6", description: "Tickets ready for final service pass." },
    { title: "Station Alerts", value: "1", description: "Operational alert requiring kitchen follow-up." },
  ],
  SOUS_CHEF: [
    { title: "Assigned Tickets", value: "9", description: "Orders directly assigned to your stations." },
    { title: "Shift Tasks", value: "7", description: "Operational tasks still pending completion." },
    { title: "Handoffs", value: "2", description: "Notes pending confirmation for next shift." },
  ],
  FLOOR_MANAGER: [
    { title: "Floor Coverage", value: "96%", description: "Current staffing coverage across service zones." },
    { title: "Open Service Issues", value: "2", description: "Incidents currently open on the floor." },
    { title: "Table Turn Pace", value: "58m", description: "Average current table turnover duration." },
  ],
  MANAGER: [
    { title: "Operational Health", value: "92%", description: "Current composite status across core modules." },
    { title: "Open Escalations", value: "3", description: "Items requiring manager-level attention." },
    { title: "Report Queue", value: "4", description: "Reports pending review and sign-off." },
  ],
  GENERAL_MANAGER: [
    { title: "Daily Readiness", value: "94%", description: "Current readiness across service periods." },
    { title: "Critical Incidents", value: "1", description: "Critical operational incidents still unresolved." },
    { title: "Weekly Trend", value: "+4.2%", description: "Week-over-week performance trend." },
  ],
};

const quickLinkClass =
  "inline-flex h-7 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted";

type DashboardRolePageProps = {
  params: Promise<{ role: keyof typeof DASHBOARD_SLUG_TO_ROLE }>;
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

  const quickLinks = navByRole(user.role).filter((item) => item.href !== "/dashboard").slice(0, 6);
  const metrics = roleKpis[user.role];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{roleLabel(user.role)} Dashboard</h1>
        <p className="text-sm text-muted-foreground">{roleFocus[user.role]}</p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            description={metric.description}
          />
        ))}
      </section>

      <SectionPanel title="Quick Access" description="Modules available for your current role.">
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((item) => (
            <Link key={item.href} href={item.href} className={quickLinkClass}>
              {item.label}
            </Link>
          ))}
        </div>
      </SectionPanel>
    </div>
  );
}
