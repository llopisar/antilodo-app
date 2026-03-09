"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  alertCreateSchema,
  alertUpdateSchema,
  orderCreateSchema,
  orderUpdateSchema,
  scheduleCreateSchema,
  scheduleUpdateSchema,
  serviceCreateSchema,
  serviceUpdateSchema,
  shiftNoteCreateSchema,
  shiftNoteUpdateSchema,
  taskCreateSchema,
  taskUpdateSchema,
} from "@/features/operations/schemas";
import {
  assertPermission,
  canManageAlerts,
  canManageOrders,
  canManageSchedules,
  canManageServices,
  canManageShiftNotes,
  canManageTasks,
  ModuleScope,
} from "@/features/operations/permissions";

async function requireActor() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

function norm(value: string | null) {
  return value && value.trim().length > 0 ? value : undefined;
}

function toDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date value.");
  return d;
}

function pathFor(scope: ModuleScope, module: string) {
  return `/${scope}/${module}`;
}

export async function createOrderAction(scope: ModuleScope, formData: FormData) {
  const actor = await requireActor();
  assertPermission(canManageOrders(actor.role as UserRole, scope));

  const parsed = orderCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid order data.");

  await db.order.create({ data: parsed.data });
  revalidatePath(pathFor(scope, "orders"));
}

export async function updateOrderAction(scope: ModuleScope, formData: FormData) {
  const actor = await requireActor();
  assertPermission(canManageOrders(actor.role as UserRole, scope));

  const parsed = orderUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid order update.");

  const { id, ...payload } = parsed.data;
  await db.order.update({ where: { id }, data: payload });
  revalidatePath(pathFor(scope, "orders"));
  revalidatePath(pathFor(scope, `orders/${id}`));
}

export async function createServiceAction(scope: ModuleScope, formData: FormData) {
  const actor = await requireActor();
  assertPermission(canManageServices(actor.role as UserRole, scope));

  const parsed = serviceCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid service data.");

  await db.service.create({
    data: {
      ...parsed.data,
      serviceDate: toDate(parsed.data.serviceDate),
      notes: norm(parsed.data.notes ?? null),
    },
  });

  revalidatePath(pathFor(scope, "services"));
}

export async function updateServiceAction(scope: ModuleScope, formData: FormData) {
  const actor = await requireActor();
  assertPermission(canManageServices(actor.role as UserRole, scope));

  const parsed = serviceUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid service update.");

  const { id, serviceDate, notes, ...payload } = parsed.data;
  await db.service.update({
    where: { id },
    data: { ...payload, serviceDate: toDate(serviceDate), notes: norm(notes ?? null) },
  });

  revalidatePath(pathFor(scope, "services"));
  revalidatePath(pathFor(scope, `services/${id}`));
}

export async function createScheduleAction(scope: ModuleScope, formData: FormData) {
  const actor = await requireActor();
  assertPermission(canManageSchedules(actor.role as UserRole, scope));

  const parsed = scheduleCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid schedule data.");

  await db.schedule.create({
    data: {
      userId: parsed.data.userId,
      roleAtShift: parsed.data.roleAtShift,
      shiftStart: toDate(parsed.data.shiftStart),
      shiftEnd: toDate(parsed.data.shiftEnd),
      serviceId: norm(parsed.data.serviceId ?? null),
      notes: norm(parsed.data.notes ?? null),
    },
  });

  revalidatePath(pathFor(scope, "schedules"));
}

export async function updateScheduleAction(scope: ModuleScope, formData: FormData) {
  const actor = await requireActor();
  assertPermission(canManageSchedules(actor.role as UserRole, scope));

  const parsed = scheduleUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid schedule update.");

  const { id, ...payload } = parsed.data;
  await db.schedule.update({
    where: { id },
    data: {
      userId: payload.userId,
      roleAtShift: payload.roleAtShift,
      shiftStart: toDate(payload.shiftStart),
      shiftEnd: toDate(payload.shiftEnd),
      serviceId: norm(payload.serviceId ?? null),
      notes: norm(payload.notes ?? null),
    },
  });

  revalidatePath(pathFor(scope, "schedules"));
  revalidatePath(pathFor(scope, `schedules/${id}`));
}

export async function createShiftNoteAction(scope: ModuleScope, formData: FormData) {
  const actor = await requireActor();
  assertPermission(canManageShiftNotes(actor.role as UserRole, scope));

  const parsed = shiftNoteCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid note data.");

  await db.shiftNote.create({
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      visibility: parsed.data.visibility,
      serviceId: norm(parsed.data.serviceId ?? null),
      authorId: actor.id,
    },
  });

  revalidatePath(pathFor(scope, "shift-notes"));
}

export async function updateShiftNoteAction(scope: ModuleScope, formData: FormData) {
  const actor = await requireActor();
  assertPermission(canManageShiftNotes(actor.role as UserRole, scope));

  const parsed = shiftNoteUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid note update.");

  const { id, ...payload } = parsed.data;
  await db.shiftNote.update({
    where: { id },
    data: {
      title: payload.title,
      content: payload.content,
      visibility: payload.visibility,
      serviceId: norm(payload.serviceId ?? null),
    },
  });

  revalidatePath(pathFor(scope, "shift-notes"));
  revalidatePath(pathFor(scope, `shift-notes/${id}`));
}

export async function createTaskAction(scope: ModuleScope, formData: FormData) {
  const actor = await requireActor();
  assertPermission(canManageTasks(actor.role as UserRole, scope));

  const parsed = taskCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid task data.");

  await db.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      status: parsed.data.status,
      assignedToId: parsed.data.assignedToId,
      assignedById: actor.id,
      dueAt: norm(parsed.data.dueAt ?? null) ? toDate(parsed.data.dueAt as string) : undefined,
      serviceId: norm(parsed.data.serviceId ?? null),
      orderId: norm(parsed.data.orderId ?? null),
    },
  });

  revalidatePath(pathFor(scope, "tasks"));
}

export async function updateTaskAction(scope: ModuleScope, formData: FormData) {
  const actor = await requireActor();
  assertPermission(canManageTasks(actor.role as UserRole, scope));

  const parsed = taskUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid task update.");

  const { id, ...payload } = parsed.data;
  await db.task.update({
    where: { id },
    data: {
      title: payload.title,
      description: payload.description,
      status: payload.status,
      assignedToId: payload.assignedToId,
      dueAt: norm(payload.dueAt ?? null) ? toDate(payload.dueAt as string) : null,
      serviceId: norm(payload.serviceId ?? null),
      orderId: norm(payload.orderId ?? null),
    },
  });

  revalidatePath(pathFor(scope, "tasks"));
  revalidatePath(pathFor(scope, `tasks/${id}`));
}

export async function createAlertAction(scope: ModuleScope, formData: FormData) {
  const actor = await requireActor();
  assertPermission(canManageAlerts(actor.role as UserRole, scope));

  const parsed = alertCreateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid alert data.");

  await db.alertIncident.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      severity: parsed.data.severity,
      status: parsed.data.status,
      ownerId: norm(parsed.data.ownerId ?? null),
      serviceId: norm(parsed.data.serviceId ?? null),
      orderId: norm(parsed.data.orderId ?? null),
      reporterId: actor.id,
    },
  });

  revalidatePath(pathFor(scope, "alerts"));
}

export async function updateAlertAction(scope: ModuleScope, formData: FormData) {
  const actor = await requireActor();
  assertPermission(canManageAlerts(actor.role as UserRole, scope));

  const parsed = alertUpdateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid alert update.");

  const { id, ...payload } = parsed.data;
  await db.alertIncident.update({
    where: { id },
    data: {
      title: payload.title,
      description: payload.description,
      severity: payload.severity,
      status: payload.status,
      ownerId: norm(payload.ownerId ?? null),
      serviceId: norm(payload.serviceId ?? null),
      orderId: norm(payload.orderId ?? null),
      resolvedAt: payload.status === "RESOLVED" ? new Date() : null,
    },
  });

  revalidatePath(pathFor(scope, "alerts"));
  revalidatePath(pathFor(scope, `alerts/${id}`));
}

