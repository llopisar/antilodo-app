import { redirect } from "next/navigation";

import { dashboardPathForRole } from "@/lib/dashboard";
import { requireUser } from "@/lib/authz";

export default async function DashboardPage() {
  const user = await requireUser();
  redirect(dashboardPathForRole(user.role));
}
