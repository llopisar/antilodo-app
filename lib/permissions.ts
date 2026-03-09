import { UserRole } from "@prisma/client";

import { dashboardPathForRole } from "@/lib/dashboard";

type RouteAccessRule = {
  startsWith: string;
  roles: UserRole[];
};

const ALL_ROLES: UserRole[] = [
  UserRole.HEAD_CHEF,
  UserRole.SOUS_CHEF,
  UserRole.FLOOR_MANAGER,
  UserRole.MANAGER,
  UserRole.GENERAL_MANAGER,
];

const MANAGEMENT_ROLES: UserRole[] = [UserRole.MANAGER, UserRole.GENERAL_MANAGER];
const KITCHEN_AND_MANAGEMENT: UserRole[] = [UserRole.HEAD_CHEF, UserRole.SOUS_CHEF, ...MANAGEMENT_ROLES];
const FLOOR_AND_MANAGEMENT: UserRole[] = [UserRole.FLOOR_MANAGER, ...MANAGEMENT_ROLES];

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  HEAD_CHEF: [
    "orders:read",
    "orders:write",
    "services:read",
    "services:write",
    "schedules:read",
    "schedules:write",
    "shift-notes:read",
    "shift-notes:write",
    "tasks:read",
    "tasks:write",
    "alerts:read",
    "alerts:write",
  ],
  SOUS_CHEF: [
    "orders:read",
    "orders:write",
    "services:read",
    "services:write",
    "schedules:read",
    "schedules:write",
    "shift-notes:read",
    "shift-notes:write",
    "tasks:read",
    "tasks:write",
    "alerts:read",
    "alerts:write",
  ],
  FLOOR_MANAGER: [
    "services:read",
    "services:write",
    "schedules:read",
    "schedules:write",
    "shift-notes:read",
    "shift-notes:write",
    "tasks:read",
    "tasks:write",
    "alerts:read",
    "alerts:write",
  ],
  MANAGER: [
    "orders:read",
    "services:read",
    "schedules:read",
    "shift-notes:read",
    "tasks:read",
    "alerts:read",
    "alerts:write",
    "overview:read",
    "reports:read",
    "activity:read",
    "incidents:read",
    "users:manage",
  ],
  GENERAL_MANAGER: [
    "orders:read",
    "services:read",
    "schedules:read",
    "shift-notes:read",
    "tasks:read",
    "alerts:read",
    "alerts:write",
    "overview:read",
    "reports:read",
    "activity:read",
    "incidents:read",
    "users:manage",
    "roles:manage",
  ],
};

export const routeAccessRules: RouteAccessRule[] = [
  { startsWith: "/dashboard", roles: ALL_ROLES },
  { startsWith: "/kitchen", roles: KITCHEN_AND_MANAGEMENT },
  { startsWith: "/floor", roles: FLOOR_AND_MANAGEMENT },
  { startsWith: "/oversight", roles: MANAGEMENT_ROLES },
  { startsWith: "/settings/profile", roles: ALL_ROLES },
  { startsWith: "/settings/users", roles: MANAGEMENT_ROLES },
  { startsWith: "/settings/roles", roles: [UserRole.GENERAL_MANAGER] },
];

export function canAccessRoute(role: UserRole, pathname: string) {
  if (pathname.startsWith("/dashboard/")) {
    return pathname === dashboardPathForRole(role);
  }

  const matched = routeAccessRules.find((rule) => pathname.startsWith(rule.startsWith));
  if (!matched) return false;
  return matched.roles.includes(role);
}

export function hasPermission(role: UserRole, permission: string) {
  return ROLE_PERMISSIONS[role].includes(permission);
}

