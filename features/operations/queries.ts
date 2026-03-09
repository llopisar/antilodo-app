import { Prisma, UserRole } from "@prisma/client";

import { db } from "@/lib/db";
import { ModuleScope } from "@/features/operations/permissions";

const kitchenRoles: UserRole[] = [UserRole.HEAD_CHEF, UserRole.SOUS_CHEF];

function containsQuery(q?: string) {
  return q && q.trim().length > 0 ? q.trim() : undefined;
}

export async function getFormOptions(scope: ModuleScope) {
  const users = await db.user.findMany({
    where:
      scope === "kitchen"
        ? { role: { in: kitchenRoles }, isActive: true }
        : { role: UserRole.FLOOR_MANAGER, isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true },
  });

  const [services, orders] = await Promise.all([
    db.service.findMany({ orderBy: [{ serviceDate: "desc" }, { name: "asc" }], select: { id: true, name: true } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 40, select: { id: true, ticketNumber: true } }),
  ]);

  return { users, services, orders };
}

export async function listOrders(scope: ModuleScope, q?: string, status?: string) {
  if (scope !== "kitchen") return [];
  const query = containsQuery(q);

  return db.order.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { ticketNumber: { contains: query, mode: Prisma.QueryMode.insensitive } },
              { tableLabel: { contains: query, mode: Prisma.QueryMode.insensitive } },
              { summary: { contains: query, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
      ...(status ? { status: status as never } : {}),
    },
    include: { service: true },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getOrder(id: string) {
  return db.order.findUnique({ where: { id }, include: { service: true, tasks: true, alerts: true } });
}

export async function listServices(q?: string, status?: string) {
  const query = containsQuery(q);
  return db.service.findMany({
    where: {
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: Prisma.QueryMode.insensitive } },
              { shift: { contains: query, mode: Prisma.QueryMode.insensitive } },
              { floorArea: { contains: query, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
      ...(status ? { status: status as never } : {}),
    },
    include: { orders: true, tasks: true, schedules: true },
    orderBy: [{ serviceDate: "desc" }],
  });
}

export async function getService(id: string) {
  return db.service.findUnique({
    where: { id },
    include: { orders: true, schedules: { include: { user: true } }, shiftNotes: true, tasks: true, alerts: true },
  });
}

export async function listSchedules(scope: ModuleScope, q?: string, role?: string) {
  const query = containsQuery(q);
  return db.schedule.findMany({
    where: {
      ...(scope === "kitchen" ? { roleAtShift: { in: kitchenRoles } } : { roleAtShift: UserRole.FLOOR_MANAGER }),
      ...(query
        ? {
            OR: [
              { user: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } },
              { notes: { contains: query, mode: Prisma.QueryMode.insensitive } },
              { service: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } },
            ],
          }
        : {}),
      ...(role ? { roleAtShift: role as never } : {}),
    },
    include: { user: true, service: true },
    orderBy: [{ shiftStart: "asc" }],
  });
}

export async function getSchedule(id: string) {
  return db.schedule.findUnique({ where: { id }, include: { user: true, service: true, shiftNotes: true } });
}

export async function listShiftNotes(scope: ModuleScope, q?: string, visibility?: string) {
  const query = containsQuery(q);
  return db.shiftNote.findMany({
    where: {
      ...(scope === "kitchen" ? { author: { role: { in: kitchenRoles } } } : { author: { role: UserRole.FLOOR_MANAGER } }),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
              { content: { contains: query, mode: Prisma.QueryMode.insensitive } },
              { author: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } },
            ],
          }
        : {}),
      ...(visibility ? { visibility: visibility as never } : {}),
    },
    include: { author: true, service: true, schedule: true },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getShiftNote(id: string) {
  return db.shiftNote.findUnique({ where: { id }, include: { author: true, service: true, schedule: true } });
}

export async function listTasks(scope: ModuleScope, q?: string, status?: string) {
  const query = containsQuery(q);
  return db.task.findMany({
    where: {
      ...(scope === "kitchen"
        ? { assignedTo: { role: { in: kitchenRoles } } }
        : { assignedTo: { role: UserRole.FLOOR_MANAGER } }),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
              { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
              { assignedTo: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } },
            ],
          }
        : {}),
      ...(status ? { status: status as never } : {}),
    },
    include: { assignedTo: true, assignedBy: true, service: true, order: true, alertIncident: true },
    orderBy: [{ dueAt: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTask(id: string) {
  return db.task.findUnique({
    where: { id },
    include: { assignedTo: true, assignedBy: true, service: true, order: true, alertIncident: true },
  });
}

export async function listAlerts(scope: ModuleScope, q?: string, status?: string) {
  const query = containsQuery(q);
  return db.alertIncident.findMany({
    where: {
      ...(scope === "kitchen"
        ? { reporter: { role: { in: kitchenRoles } } }
        : { reporter: { role: UserRole.FLOOR_MANAGER } }),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: Prisma.QueryMode.insensitive } },
              { description: { contains: query, mode: Prisma.QueryMode.insensitive } },
              { reporter: { name: { contains: query, mode: Prisma.QueryMode.insensitive } } },
            ],
          }
        : {}),
      ...(status ? { status: status as never } : {}),
    },
    include: { reporter: true, owner: true, service: true, order: true, linkedTask: true },
    orderBy: [{ createdAt: "desc" }],
  });
}

export async function getAlert(id: string) {
  return db.alertIncident.findUnique({
    where: { id },
    include: { reporter: true, owner: true, service: true, order: true, linkedTask: true },
  });
}

