import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { canAccessRoute } from "@/lib/permissions";

export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session.user;
}

export async function requireRouteAccess(pathname: string) {
  const user = await requireUser();

  if (!canAccessRoute(user.role, pathname)) {
    redirect("/forbidden");
  }

  return user;
}

export function roleLabel(role: UserRole) {
  return role
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

