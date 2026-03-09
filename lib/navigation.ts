import { UserRole } from "@prisma/client";

export type NavItem = {
  label: string;
  href: string;
  roles: UserRole[];
};

const KITCHEN_ROLES: UserRole[] = [UserRole.HEAD_CHEF, UserRole.SOUS_CHEF];
const MANAGEMENT_ROLES: UserRole[] = [UserRole.MANAGER, UserRole.GENERAL_MANAGER];
const FLOOR_AND_MANAGEMENT: UserRole[] = [UserRole.FLOOR_MANAGER, ...MANAGEMENT_ROLES];
const KITCHEN_AND_MANAGEMENT: UserRole[] = [...KITCHEN_ROLES, ...MANAGEMENT_ROLES];

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: [
      UserRole.HEAD_CHEF,
      UserRole.SOUS_CHEF,
      UserRole.FLOOR_MANAGER,
      UserRole.MANAGER,
      UserRole.GENERAL_MANAGER,
    ],
  },
  { label: "Kitchen Orders", href: "/kitchen/orders", roles: KITCHEN_AND_MANAGEMENT },
  { label: "Kitchen Services", href: "/kitchen/services", roles: KITCHEN_AND_MANAGEMENT },
  { label: "Kitchen Schedules", href: "/kitchen/schedules", roles: KITCHEN_AND_MANAGEMENT },
  { label: "Kitchen Shift Notes", href: "/kitchen/shift-notes", roles: KITCHEN_AND_MANAGEMENT },
  { label: "Kitchen Tasks", href: "/kitchen/tasks", roles: KITCHEN_AND_MANAGEMENT },
  { label: "Kitchen Alerts", href: "/kitchen/alerts", roles: KITCHEN_AND_MANAGEMENT },
  {
    label: "Floor Services",
    href: "/floor/services",
    roles: FLOOR_AND_MANAGEMENT,
  },
  {
    label: "Floor Schedules",
    href: "/floor/schedules",
    roles: FLOOR_AND_MANAGEMENT,
  },
  {
    label: "Floor Shift Notes",
    href: "/floor/shift-notes",
    roles: FLOOR_AND_MANAGEMENT,
  },
  {
    label: "Floor Tasks",
    href: "/floor/tasks",
    roles: FLOOR_AND_MANAGEMENT,
  },
  {
    label: "Floor Alerts",
    href: "/floor/alerts",
    roles: FLOOR_AND_MANAGEMENT,
  },
  { label: "Overview", href: "/oversight/overview", roles: MANAGEMENT_ROLES },
  { label: "Reports", href: "/oversight/reports", roles: MANAGEMENT_ROLES },
  { label: "Activity", href: "/oversight/activity", roles: MANAGEMENT_ROLES },
  { label: "Incidents", href: "/oversight/incidents", roles: MANAGEMENT_ROLES },
  {
    label: "Profile",
    href: "/settings/profile",
    roles: [
      UserRole.HEAD_CHEF,
      UserRole.SOUS_CHEF,
      UserRole.FLOOR_MANAGER,
      UserRole.MANAGER,
      UserRole.GENERAL_MANAGER,
    ],
  },
  {
    label: "Users",
    href: "/settings/users",
    roles: MANAGEMENT_ROLES,
  },
  {
    label: "Roles",
    href: "/settings/roles",
    roles: [UserRole.GENERAL_MANAGER],
  },
];

export function navByRole(role: UserRole) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

