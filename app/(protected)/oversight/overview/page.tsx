import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

import { ManagementOverviewPanel } from "@/components/dashboard/management-overview";
import { requireUser } from "@/lib/authz";
import { getRoleDashboardData } from "@/lib/dashboard-data";

export default async function OversightOverviewPage() {
  const user = await requireUser();

  if (user.role !== UserRole.MANAGER && user.role !== UserRole.GENERAL_MANAGER) {
    redirect("/forbidden");
  }

  const data = await getRoleDashboardData(user.role, user.id);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">General Status Overview</h1>
        <p className="text-sm text-muted-foreground">
          Quick supervision panel for cross-operation monitoring and high-level decision support.
        </p>
      </div>
      <ManagementOverviewPanel role={user.role} data={data} />
    </div>
  );
}

