import { UserRole } from "@prisma/client";

export type ModuleScope = "kitchen" | "floor";

const KITCHEN_ROLES: UserRole[] = [UserRole.HEAD_CHEF, UserRole.SOUS_CHEF];
const FLOOR_ROLES: UserRole[] = [UserRole.FLOOR_MANAGER];
const SUPERVISOR_ROLES: UserRole[] = [UserRole.MANAGER, UserRole.GENERAL_MANAGER];

export function isSupervisor(role: UserRole) {
  return SUPERVISOR_ROLES.includes(role);
}

export function canManageScope(role: UserRole, scope: ModuleScope) {
  if (scope === "kitchen") return KITCHEN_ROLES.includes(role);
  return FLOOR_ROLES.includes(role);
}

export function canViewScope(role: UserRole, scope: ModuleScope) {
  return canManageScope(role, scope) || isSupervisor(role);
}

export function canManageOrders(role: UserRole, scope: ModuleScope) {
  return scope === "kitchen" ? canManageScope(role, scope) : false;
}

export function canManageServices(role: UserRole, scope: ModuleScope) {
  return canManageScope(role, scope);
}

export function canManageSchedules(role: UserRole, scope: ModuleScope) {
  return canManageScope(role, scope);
}

export function canManageShiftNotes(role: UserRole, scope: ModuleScope) {
  return canManageScope(role, scope);
}

export function canManageTasks(role: UserRole, scope: ModuleScope) {
  return canManageScope(role, scope);
}

export function canManageAlerts(role: UserRole, scope: ModuleScope) {
  return canManageScope(role, scope) || isSupervisor(role);
}

export function assertPermission(condition: boolean, message = "You are not allowed to perform this action.") {
  if (!condition) {
    throw new Error(message);
  }
}

