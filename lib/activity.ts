import { Prisma } from "@prisma/client";

import { db } from "@/lib/db";

export type AuditEntityType = "Order" | "Schedule" | "Task" | "ShiftNote" | "AlertIncident";

export type AuditActionType =
  | "ORDER_CREATED"
  | "ORDER_UPDATED"
  | "SCHEDULE_CREATED"
  | "SCHEDULE_UPDATED"
  | "TASK_CREATED"
  | "TASK_UPDATED"
  | "SHIFT_NOTE_CREATED"
  | "SHIFT_NOTE_UPDATED"
  | "ALERT_CREATED"
  | "ALERT_UPDATED";

export type AuditEventInput = {
  actorId: string;
  action: AuditActionType;
  entityType: AuditEntityType;
  entityId: string;
  before?: Prisma.InputJsonValue | null;
  after?: Prisma.InputJsonValue | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function recordAuditEvent(event: AuditEventInput) {
  await db.activityLog.create({
    data: {
      actorId: event.actorId,
      action: event.action,
      entityType: event.entityType,
      entityId: event.entityId,
      before: event.before ?? undefined,
      after: event.after ?? undefined,
      ipAddress: event.ipAddress ?? undefined,
      userAgent: event.userAgent ?? undefined,
    },
  });
}
