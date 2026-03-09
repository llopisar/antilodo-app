import { hash } from "bcryptjs";
import {
  AlertSeverity,
  AlertStatus,
  OrderStatus,
  PrismaClient,
  ServiceStatus,
  ShiftNoteVisibility,
  TaskStatus,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "DemoPass123!";

async function main() {
  const passwordHash = await hash(DEMO_PASSWORD, 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "head.chef@antilodo.app" },
      update: { name: "Ava Moreno", role: UserRole.HEAD_CHEF, passwordHash, isActive: true },
      create: {
        name: "Ava Moreno",
        email: "head.chef@antilodo.app",
        role: UserRole.HEAD_CHEF,
        passwordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: "sous.chef@antilodo.app" },
      update: { name: "Noah Patel", role: UserRole.SOUS_CHEF, passwordHash, isActive: true },
      create: {
        name: "Noah Patel",
        email: "sous.chef@antilodo.app",
        role: UserRole.SOUS_CHEF,
        passwordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: "floor.manager@antilodo.app" },
      update: { name: "Liam Brooks", role: UserRole.FLOOR_MANAGER, passwordHash, isActive: true },
      create: {
        name: "Liam Brooks",
        email: "floor.manager@antilodo.app",
        role: UserRole.FLOOR_MANAGER,
        passwordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: "manager@antilodo.app" },
      update: { name: "Emma Collins", role: UserRole.MANAGER, passwordHash, isActive: true },
      create: {
        name: "Emma Collins",
        email: "manager@antilodo.app",
        role: UserRole.MANAGER,
        passwordHash,
      },
    }),
    prisma.user.upsert({
      where: { email: "gm@antilodo.app" },
      update: { name: "Olivia Reed", role: UserRole.GENERAL_MANAGER, passwordHash, isActive: true },
      create: {
        name: "Olivia Reed",
        email: "gm@antilodo.app",
        role: UserRole.GENERAL_MANAGER,
        passwordHash,
      },
    }),
  ]);

  const [headChef, sousChef, floorManager, manager, generalManager] = users;

  await prisma.activityLog.deleteMany();
  await prisma.alertIncident.deleteMany();
  await prisma.task.deleteMany();
  await prisma.shiftNote.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();

  const today = new Date();
  const morningStart = new Date(today);
  morningStart.setHours(8, 0, 0, 0);
  const morningEnd = new Date(today);
  morningEnd.setHours(16, 0, 0, 0);

  const eveningStart = new Date(today);
  eveningStart.setHours(16, 0, 0, 0);
  const eveningEnd = new Date(today);
  eveningEnd.setHours(23, 0, 0, 0);

  const lunchService = await prisma.service.create({
    data: {
      name: "Lunch Service",
      serviceDate: today,
      shift: "Lunch",
      status: ServiceStatus.ACTIVE,
      floorArea: "Main Hall",
      notes: "Business lunch peak expected at 13:00.",
    },
  });

  const dinnerService = await prisma.service.create({
    data: {
      name: "Dinner Service",
      serviceDate: today,
      shift: "Dinner",
      status: ServiceStatus.PLANNED,
      floorArea: "Main Hall + Terrace",
      notes: "VIP reservation at table T14.",
    },
  });

  await prisma.schedule.createMany({
    data: [
      { userId: headChef.id, roleAtShift: UserRole.HEAD_CHEF, shiftStart: morningStart, shiftEnd: eveningEnd, serviceId: lunchService.id },
      { userId: sousChef.id, roleAtShift: UserRole.SOUS_CHEF, shiftStart: morningStart, shiftEnd: eveningEnd, serviceId: lunchService.id },
      { userId: floorManager.id, roleAtShift: UserRole.FLOOR_MANAGER, shiftStart: morningStart, shiftEnd: eveningEnd, serviceId: lunchService.id },
      { userId: manager.id, roleAtShift: UserRole.MANAGER, shiftStart: morningStart, shiftEnd: eveningEnd, serviceId: dinnerService.id },
      { userId: generalManager.id, roleAtShift: UserRole.GENERAL_MANAGER, shiftStart: morningStart, shiftEnd: eveningEnd, serviceId: dinnerService.id },
      { userId: sousChef.id, roleAtShift: UserRole.SOUS_CHEF, shiftStart: eveningStart, shiftEnd: eveningEnd, serviceId: dinnerService.id },
    ],
  });

  const orders = await Promise.all([
    prisma.order.create({
      data: {
        ticketNumber: "L-1001",
        tableLabel: "T03",
        station: "Grill",
        priority: 2,
        status: OrderStatus.IN_PROGRESS,
        summary: "2x Ribeye medium, 1x Caesar salad",
        serviceId: lunchService.id,
      },
    }),
    prisma.order.create({
      data: {
        ticketNumber: "L-1002",
        tableLabel: "T08",
        station: "Pasta",
        priority: 1,
        status: OrderStatus.PENDING,
        summary: "3x Truffle tagliatelle",
        serviceId: lunchService.id,
      },
    }),
    prisma.order.create({
      data: {
        ticketNumber: "D-2001",
        tableLabel: "T14",
        station: "Expo",
        priority: 3,
        status: OrderStatus.PENDING,
        summary: "VIP tasting menu prep",
        serviceId: dinnerService.id,
      },
    }),
  ]);

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Validate mise en place",
        description: "Check all hot stations and prep levels before 12:00.",
        status: TaskStatus.IN_PROGRESS,
        dueAt: morningEnd,
        assignedById: headChef.id,
        assignedToId: sousChef.id,
        serviceId: lunchService.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Reassign section C servers",
        description: "Rebalance floor coverage for the lunch rush.",
        status: TaskStatus.TODO,
        dueAt: morningEnd,
        assignedById: floorManager.id,
        assignedToId: floorManager.id,
        serviceId: lunchService.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Review daily variance report",
        description: "Approve kitchen wastage and labor variance summaries.",
        status: TaskStatus.TODO,
        dueAt: eveningEnd,
        assignedById: generalManager.id,
        assignedToId: manager.id,
        serviceId: dinnerService.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Confirm VIP sequence timing",
        description: "Coordinate with floor team for table T14 timings.",
        status: TaskStatus.TODO,
        dueAt: eveningStart,
        assignedById: manager.id,
        assignedToId: headChef.id,
        serviceId: dinnerService.id,
        orderId: orders[2].id,
      },
    }),
  ]);

  await prisma.shiftNote.createMany({
    data: [
      {
        title: "Prep update",
        content: "Cold station delayed by 15 minutes due to supplier delivery.",
        visibility: ShiftNoteVisibility.TEAM,
        authorId: sousChef.id,
        serviceId: lunchService.id,
      },
      {
        title: "Guest feedback trend",
        content: "Terrace guests requested faster beverage turnaround.",
        visibility: ShiftNoteVisibility.MANAGEMENT,
        authorId: floorManager.id,
        serviceId: lunchService.id,
      },
      {
        title: "Dinner readiness",
        content: "VIP tasting ingredients verified and staged.",
        visibility: ShiftNoteVisibility.TEAM,
        authorId: headChef.id,
        serviceId: dinnerService.id,
      },
    ],
  });

  await prisma.alertIncident.createMany({
    data: [
      {
        title: "Cold chain warning",
        description: "Walk-in fridge B exceeded temperature threshold for 7 minutes.",
        severity: AlertSeverity.HIGH,
        status: AlertStatus.ACKNOWLEDGED,
        reporterId: headChef.id,
        ownerId: manager.id,
        serviceId: lunchService.id,
      },
      {
        title: "Floor congestion",
        description: "Aisle near terrace has repeated service bottlenecks.",
        severity: AlertSeverity.MEDIUM,
        status: AlertStatus.OPEN,
        reporterId: floorManager.id,
        ownerId: manager.id,
        serviceId: lunchService.id,
      },
      {
        title: "VIP timing risk",
        description: "Potential delay in course 3 for table T14.",
        severity: AlertSeverity.CRITICAL,
        status: AlertStatus.ESCALATED,
        reporterId: manager.id,
        ownerId: generalManager.id,
        serviceId: dinnerService.id,
        orderId: orders[2].id,
        taskId: tasks[3].id,
      },
    ],
  });

  await prisma.activityLog.createMany({
    data: [
      {
        actorId: headChef.id,
        action: "ORDER_STATUS_UPDATED",
        entityType: "Order",
        entityId: orders[0].id,
        after: { status: OrderStatus.IN_PROGRESS },
      },
      {
        actorId: sousChef.id,
        action: "SHIFT_NOTE_CREATED",
        entityType: "ShiftNote",
        entityId: "seed-note-1",
      },
      {
        actorId: floorManager.id,
        action: "TASK_CREATED",
        entityType: "Task",
        entityId: tasks[1].id,
      },
      {
        actorId: manager.id,
        action: "ALERT_ESCALATED",
        entityType: "AlertIncident",
        entityId: "seed-alert-3",
      },
      {
        actorId: generalManager.id,
        action: "REPORT_REVIEWED",
        entityType: "OperationalSnapshot",
        entityId: "daily-ops-summary",
      },
    ],
  });

  console.log("Seed complete. Demo users password:", DEMO_PASSWORD);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
