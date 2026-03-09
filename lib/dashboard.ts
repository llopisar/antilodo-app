import { UserRole } from "@prisma/client";

export const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  HEAD_CHEF: "/dashboard/head-chef",
  SOUS_CHEF: "/dashboard/sous-chef",
  FLOOR_MANAGER: "/dashboard/floor-manager",
  MANAGER: "/dashboard/manager",
  GENERAL_MANAGER: "/dashboard/general-manager",
};

export const DASHBOARD_SLUG_TO_ROLE = {
  "head-chef": UserRole.HEAD_CHEF,
  "sous-chef": UserRole.SOUS_CHEF,
  "floor-manager": UserRole.FLOOR_MANAGER,
  manager: UserRole.MANAGER,
  "general-manager": UserRole.GENERAL_MANAGER,
} as const;

export type DashboardSlug = keyof typeof DASHBOARD_SLUG_TO_ROLE;

export function dashboardPathForRole(role: UserRole) {
  return ROLE_DASHBOARD_PATHS[role];
}

