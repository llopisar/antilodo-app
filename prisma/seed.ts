import "dotenv/config";
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
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = "DemoPass123!";

function atHour(base: Date, dayOffset: number, hour: number, minute = 0) {
  const d = new Date(base);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

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

  const now = new Date();

  const breakfastService = await prisma.service.create({
    data: {
      name: "Breakfast Service",
      serviceDate: atHour(now, -1, 7, 0),
      shift: "Breakfast",
      status: ServiceStatus.COMPLETED,
      floorArea: "Main Hall",
      notes: "Completed with strong on-time prep and no major incidents.",
    },
  });

  const lunchService = await prisma.service.create({
    data: {
      name: "Lunch Service",
      serviceDate: atHour(now, 0, 12, 0),
      shift: "Lunch",
      status: ServiceStatus.ACTIVE,
      floorArea: "Main Hall",
      notes: "Business lunch peak expected from 12:30 to 14:00.",
    },
  });

  const dinnerService = await prisma.service.create({
    data: {
      name: "Dinner Service",
      serviceDate: atHour(now, 0, 19, 0),
      shift: "Dinner",
      status: ServiceStatus.PLANNED,
      floorArea: "Main Hall + Terrace",
      notes: "Large group booking and VIP table expected at 20:00.",
    },
  });

  const weekendPrepService = await prisma.service.create({
    data: {
      name: "Weekend Brunch Prep",
      serviceDate: atHour(now, 1, 10, 0),
      shift: "Brunch",
      status: ServiceStatus.PLANNED,
      floorArea: "Terrace",
      notes: "Prep-focused service to stage ingredients and staffing for weekend.",
    },
  });

  const schedules = await Promise.all([
    prisma.schedule.create({
      data: {
        userId: headChef.id,
        roleAtShift: UserRole.HEAD_CHEF,
        shiftStart: atHour(now, 0, 8, 0),
        shiftEnd: atHour(now, 0, 17, 0),
        serviceId: lunchService.id,
        notes: "Lead kitchen line and lunch pass.",
      },
    }),
    prisma.schedule.create({
      data: {
        userId: sousChef.id,
        roleAtShift: UserRole.SOUS_CHEF,
        shiftStart: atHour(now, 0, 8, 30),
        shiftEnd: atHour(now, 0, 16, 30),
        serviceId: lunchService.id,
        notes: "Coordinate hot section and prep replenishment.",
      },
    }),
    prisma.schedule.create({
      data: {
        userId: floorManager.id,
        roleAtShift: UserRole.FLOOR_MANAGER,
        shiftStart: atHour(now, 0, 10, 0),
        shiftEnd: atHour(now, 0, 18, 0),
        serviceId: lunchService.id,
        notes: "Manage floor coverage and table flow.",
      },
    }),
    prisma.schedule.create({
      data: {
        userId: manager.id,
        roleAtShift: UserRole.MANAGER,
        shiftStart: atHour(now, 0, 11, 0),
        shiftEnd: atHour(now, 0, 20, 0),
        serviceId: dinnerService.id,
        notes: "Monitor operational KPIs and escalations.",
      },
    }),
    prisma.schedule.create({
      data: {
        userId: generalManager.id,
        roleAtShift: UserRole.GENERAL_MANAGER,
        shiftStart: atHour(now, 0, 12, 0),
        shiftEnd: atHour(now, 0, 21, 0),
        serviceId: dinnerService.id,
        notes: "Executive oversight and incident governance.",
      },
    }),
    prisma.schedule.create({
      data: {
        userId: sousChef.id,
        roleAtShift: UserRole.SOUS_CHEF,
        shiftStart: atHour(now, 1, 8, 0),
        shiftEnd: atHour(now, 1, 14, 0),
        serviceId: weekendPrepService.id,
        notes: "Weekend mise en place and station validation.",
      },
    }),
    prisma.schedule.create({
      data: {
        userId: floorManager.id,
        roleAtShift: UserRole.FLOOR_MANAGER,
        shiftStart: atHour(now, 1, 9, 30),
        shiftEnd: atHour(now, 1, 15, 30),
        serviceId: weekendPrepService.id,
        notes: "Weekend reservation and flow setup.",
      },
    }),
  ]);

  const orders = await Promise.all([
    prisma.order.create({
      data: {
        ticketNumber: "B-0901",
        tableLabel: "T01",
        station: "Grill",
        priority: 1,
        status: OrderStatus.COMPLETED,
        summary: "2x omelette, 1x sourdough toast",
        serviceId: breakfastService.id,
      },
    }),
    prisma.order.create({
      data: {
        ticketNumber: "L-1101",
        tableLabel: "T03",
        station: "Grill",
        priority: 2,
        status: OrderStatus.IN_PROGRESS,
        summary: "2x ribeye medium, 1x Caesar salad",
        serviceId: lunchService.id,
      },
    }),
    prisma.order.create({
      data: {
        ticketNumber: "L-1102",
        tableLabel: "T07",
        station: "Pasta",
        priority: 1,
        status: OrderStatus.PENDING,
        summary: "3x truffle tagliatelle",
        serviceId: lunchService.id,
      },
    }),
    prisma.order.create({
      data: {
        ticketNumber: "L-1103",
        tableLabel: "T10",
        station: "Expo",
        priority: 3,
        status: OrderStatus.READY,
        summary: "Chef special lunch tasting",
        serviceId: lunchService.id,
      },
    }),
    prisma.order.create({
      data: {
        ticketNumber: "L-1104",
        tableLabel: "T12",
        station: "Salad",
        priority: 1,
        status: OrderStatus.IN_PROGRESS,
        summary: "4x quinoa bowl + add-ons",
        serviceId: lunchService.id,
      },
    }),
    prisma.order.create({
      data: {
        ticketNumber: "D-2101",
        tableLabel: "T14",
        station: "Expo",
        priority: 3,
        status: OrderStatus.PENDING,
        summary: "VIP tasting menu setup",
        serviceId: dinnerService.id,
      },
    }),
    prisma.order.create({
      data: {
        ticketNumber: "D-2102",
        tableLabel: "T16",
        station: "Grill",
        priority: 2,
        status: OrderStatus.PENDING,
        summary: "4x sirloin, 2x sea bass",
        serviceId: dinnerService.id,
      },
    }),
    prisma.order.create({
      data: {
        ticketNumber: "D-2103",
        tableLabel: "T18",
        station: "Dessert",
        priority: 1,
        status: OrderStatus.PENDING,
        summary: "Pre-stage dessert sequence",
        serviceId: dinnerService.id,
      },
    }),
    prisma.order.create({
      data: {
        ticketNumber: "W-3101",
        tableLabel: "T22",
        station: "Prep",
        priority: 1,
        status: OrderStatus.PENDING,
        summary: "Brunch batter and garnish prep order",
        serviceId: weekendPrepService.id,
      },
    }),
  ]);

  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        title: "Validate hot station mise en place",
        description: "Check proteins, sauces, and garnish levels before lunch peak.",
        status: TaskStatus.IN_PROGRESS,
        dueAt: atHour(now, 0, 11, 45),
        assignedById: headChef.id,
        assignedToId: sousChef.id,
        serviceId: lunchService.id,
        orderId: orders[1].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Rebalance floor coverage zone C",
        description: "Move one server from zone B to C during lunch spike.",
        status: TaskStatus.TODO,
        dueAt: atHour(now, 0, 12, 20),
        assignedById: floorManager.id,
        assignedToId: floorManager.id,
        serviceId: lunchService.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Review lunch variance report",
        description: "Validate labor and food variance anomalies before 16:00.",
        status: TaskStatus.TODO,
        dueAt: atHour(now, 0, 16, 0),
        assignedById: generalManager.id,
        assignedToId: manager.id,
        serviceId: lunchService.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Confirm VIP dinner sequence",
        description: "Coordinate kitchen and floor timing for table T14 courses.",
        status: TaskStatus.TODO,
        dueAt: atHour(now, 0, 18, 30),
        assignedById: manager.id,
        assignedToId: headChef.id,
        serviceId: dinnerService.id,
        orderId: orders[5].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Prep brunch pastry station",
        description: "Stage doughs and garnish containers for weekend brunch.",
        status: TaskStatus.BLOCKED,
        dueAt: atHour(now, 1, 9, 15),
        assignedById: headChef.id,
        assignedToId: sousChef.id,
        serviceId: weekendPrepService.id,
        orderId: orders[8].id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Calibrate walk-in temperature log",
        description: "Verify sensor calibration and sign compliance sheet.",
        status: TaskStatus.IN_PROGRESS,
        dueAt: atHour(now, 0, 14, 0),
        assignedById: manager.id,
        assignedToId: headChef.id,
        serviceId: lunchService.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "Update terrace reservation map",
        description: "Lock final terrace seating plan for dinner service.",
        status: TaskStatus.TODO,
        dueAt: atHour(now, 0, 17, 30),
        assignedById: manager.id,
        assignedToId: floorManager.id,
        serviceId: dinnerService.id,
      },
    }),
  ]);

  const shiftNotes = await Promise.all([
    prisma.shiftNote.create({
      data: {
        title: "Lunch prep bottleneck",
        content: "Cold section delayed by 10 minutes due to late produce delivery.",
        visibility: ShiftNoteVisibility.TEAM,
        authorId: sousChef.id,
        serviceId: lunchService.id,
        scheduleId: schedules[1].id,
      },
    }),
    prisma.shiftNote.create({
      data: {
        title: "Guest pacing request",
        content: "Corporate table at T12 requested faster appetizer turnaround.",
        visibility: ShiftNoteVisibility.MANAGEMENT,
        authorId: floorManager.id,
        serviceId: lunchService.id,
        scheduleId: schedules[2].id,
      },
    }),
    prisma.shiftNote.create({
      data: {
        title: "Dinner readiness checkpoint",
        content: "VIP ingredients verified, tasting sequence cards staged.",
        visibility: ShiftNoteVisibility.TEAM,
        authorId: headChef.id,
        serviceId: dinnerService.id,
        scheduleId: schedules[0].id,
      },
    }),
    prisma.shiftNote.create({
      data: {
        title: "Executive observation",
        content: "Lunch throughput improved vs prior week; monitor alert backlog.",
        visibility: ShiftNoteVisibility.MANAGEMENT,
        authorId: generalManager.id,
        serviceId: lunchService.id,
        scheduleId: schedules[4].id,
      },
    }),
    prisma.shiftNote.create({
      data: {
        title: "Weekend prep risk",
        content: "Pastry supplier delivery pushed by 35 minutes; alternate stock ready.",
        visibility: ShiftNoteVisibility.TEAM,
        authorId: sousChef.id,
        serviceId: weekendPrepService.id,
        scheduleId: schedules[5].id,
      },
    }),
  ]);

  const alerts = await Promise.all([
    prisma.alertIncident.create({
      data: {
        title: "Cold-chain threshold breach",
        description: "Walk-in fridge B exceeded threshold for 6 minutes.",
        severity: AlertSeverity.HIGH,
        status: AlertStatus.ACKNOWLEDGED,
        reporterId: headChef.id,
        ownerId: manager.id,
        serviceId: lunchService.id,
      },
    }),
    prisma.alertIncident.create({
      data: {
        title: "Floor congestion near terrace",
        description: "Aisle bottleneck impacting table turnover and service speed.",
        severity: AlertSeverity.MEDIUM,
        status: AlertStatus.OPEN,
        reporterId: floorManager.id,
        ownerId: manager.id,
        serviceId: lunchService.id,
      },
    }),
    prisma.alertIncident.create({
      data: {
        title: "VIP timing risk",
        description: "Potential delay in course three for VIP table T14.",
        severity: AlertSeverity.CRITICAL,
        status: AlertStatus.ESCALATED,
        reporterId: manager.id,
        ownerId: generalManager.id,
        serviceId: dinnerService.id,
        orderId: orders[5].id,
        taskId: tasks[3].id,
      },
    }),
    prisma.alertIncident.create({
      data: {
        title: "Brunch prep dependency blocked",
        description: "Pastry prep task blocked by late supplier handoff.",
        severity: AlertSeverity.MEDIUM,
        status: AlertStatus.ACKNOWLEDGED,
        reporterId: sousChef.id,
        ownerId: headChef.id,
        serviceId: weekendPrepService.id,
        orderId: orders[8].id,
        taskId: tasks[4].id,
      },
    }),
  ]);

  await prisma.activityLog.createMany({
    data: [
      {
        actorId: headChef.id,
        action: "ORDER_CREATED",
        entityType: "Order",
        entityId: orders[1].id,
        after: {
          ticketNumber: orders[1].ticketNumber,
          status: orders[1].status,
          serviceId: orders[1].serviceId,
        },
      },
      {
        actorId: sousChef.id,
        action: "SHIFT_NOTE_CREATED",
        entityType: "ShiftNote",
        entityId: shiftNotes[0].id,
        after: { title: shiftNotes[0].title, visibility: shiftNotes[0].visibility },
      },
      {
        actorId: floorManager.id,
        action: "TASK_CREATED",
        entityType: "Task",
        entityId: tasks[1].id,
        after: { title: tasks[1].title, status: tasks[1].status, serviceId: tasks[1].serviceId },
      },
      {
        actorId: manager.id,
        action: "ALERT_CREATED",
        entityType: "AlertIncident",
        entityId: alerts[2].id,
        after: { title: alerts[2].title, severity: alerts[2].severity, status: alerts[2].status },
      },
      {
        actorId: manager.id,
        action: "SCHEDULE_UPDATED",
        entityType: "Schedule",
        entityId: schedules[3].id,
        before: {
          shiftStart: atHour(now, 0, 10, 30).toISOString(),
          shiftEnd: atHour(now, 0, 19, 30).toISOString(),
        },
        after: {
          shiftStart: schedules[3].shiftStart.toISOString(),
          shiftEnd: schedules[3].shiftEnd.toISOString(),
        },
      },
      {
        actorId: generalManager.id,
        action: "ALERT_UPDATED",
        entityType: "AlertIncident",
        entityId: alerts[2].id,
        before: { status: AlertStatus.OPEN },
        after: { status: AlertStatus.ESCALATED, ownerId: generalManager.id },
      },
      {
        actorId: headChef.id,
        action: "TASK_UPDATED",
        entityType: "Task",
        entityId: tasks[0].id,
        before: { status: TaskStatus.TODO },
        after: { status: TaskStatus.IN_PROGRESS, assignedToId: sousChef.id },
      },
      {
        actorId: floorManager.id,
        action: "SHIFT_NOTE_UPDATED",
        entityType: "ShiftNote",
        entityId: shiftNotes[1].id,
        before: { visibility: ShiftNoteVisibility.TEAM },
        after: { visibility: ShiftNoteVisibility.MANAGEMENT },
      },
      {
        actorId: generalManager.id,
        action: "TASK_CREATED",
        entityType: "Task",
        entityId: tasks[2].id,
        after: { title: tasks[2].title, assignedToId: manager.id, status: tasks[2].status },
      },
      {
        actorId: manager.id,
        action: "ORDER_UPDATED",
        entityType: "Order",
        entityId: orders[3].id,
        before: { status: OrderStatus.IN_PROGRESS },
        after: { status: OrderStatus.READY },
      },
      {
        actorId: sousChef.id,
        action: "ALERT_CREATED",
        entityType: "AlertIncident",
        entityId: alerts[3].id,
        after: { severity: alerts[3].severity, status: alerts[3].status, taskId: alerts[3].taskId },
      },
      {
        actorId: generalManager.id,
        action: "SCHEDULE_CREATED",
        entityType: "Schedule",
        entityId: schedules[6].id,
        after: {
          roleAtShift: schedules[6].roleAtShift,
          serviceId: schedules[6].serviceId,
          shiftStart: schedules[6].shiftStart.toISOString(),
        },
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Demo password:", DEMO_PASSWORD);
  console.log("Demo users:");
  console.log("- head.chef@antilodo.app");
  console.log("- sous.chef@antilodo.app");
  console.log("- floor.manager@antilodo.app");
  console.log("- manager@antilodo.app");
  console.log("- gm@antilodo.app");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
