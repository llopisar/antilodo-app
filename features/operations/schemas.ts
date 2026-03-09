import { z } from "zod";

export const orderCreateSchema = z.object({
  ticketNumber: z.string().min(2).max(30),
  tableLabel: z.string().min(1).max(30),
  station: z.string().min(2).max(50),
  priority: z.coerce.number().int().min(1).max(5),
  summary: z.string().min(3).max(500),
  serviceId: z.string().min(1),
});

export const orderUpdateSchema = orderCreateSchema.extend({
  id: z.string().min(1),
  status: z.enum(["PENDING", "IN_PROGRESS", "READY", "COMPLETED", "CANCELLED"]),
});

export const serviceCreateSchema = z.object({
  name: z.string().min(2).max(120),
  serviceDate: z.string().min(1),
  shift: z.string().min(2).max(30),
  floorArea: z.string().min(2).max(80),
  notes: z.string().max(800).optional().or(z.literal("")),
});

export const serviceUpdateSchema = serviceCreateSchema.extend({
  id: z.string().min(1),
  status: z.enum(["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]),
});

export const scheduleCreateSchema = z.object({
  userId: z.string().min(1),
  roleAtShift: z.enum(["HEAD_CHEF", "SOUS_CHEF", "FLOOR_MANAGER", "MANAGER", "GENERAL_MANAGER"]),
  shiftStart: z.string().min(1),
  shiftEnd: z.string().min(1),
  serviceId: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const scheduleUpdateSchema = scheduleCreateSchema.extend({
  id: z.string().min(1),
});

export const shiftNoteCreateSchema = z.object({
  title: z.string().min(2).max(120),
  content: z.string().min(3).max(2000),
  visibility: z.enum(["PRIVATE", "TEAM", "MANAGEMENT"]),
  serviceId: z.string().optional().or(z.literal("")),
});

export const shiftNoteUpdateSchema = shiftNoteCreateSchema.extend({
  id: z.string().min(1),
});

export const taskCreateSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(3).max(2000),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]),
  assignedToId: z.string().min(1),
  dueAt: z.string().optional().or(z.literal("")),
  serviceId: z.string().optional().or(z.literal("")),
  orderId: z.string().optional().or(z.literal("")),
});

export const taskUpdateSchema = taskCreateSchema.extend({
  id: z.string().min(1),
});

export const alertCreateSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(3).max(2000),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  status: z.enum(["OPEN", "ACKNOWLEDGED", "RESOLVED", "ESCALATED"]),
  ownerId: z.string().optional().or(z.literal("")),
  serviceId: z.string().optional().or(z.literal("")),
  orderId: z.string().optional().or(z.literal("")),
});

export const alertUpdateSchema = alertCreateSchema.extend({
  id: z.string().min(1),
});

