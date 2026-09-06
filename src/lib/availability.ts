import { prisma } from "./db";

// Statuses that block a car for a date range.
const BLOCKING_STATUSES = ["pending", "confirmed"];

export interface AvailabilityWindow {
  pickupAt: Date;
  returnAt: Date;
}

/**
 * True if the car has any blocking reservation overlapping [pickupAt, returnAt).
 * Overlap rule: existing.pickup < newReturn AND existing.return > newPickup.
 */
export async function carIsBooked(
  carId: string,
  w: AvailabilityWindow
): Promise<boolean> {
  const count = await prisma.reservation.count({
    where: {
      carId,
      status: { in: BLOCKING_STATUSES },
      pickupAt: { lt: w.returnAt },
      returnAt: { gt: w.pickupAt },
    },
  });
  return count > 0;
}

/**
 * Return ids of all cars booked for the window (single query for the whole fleet).
 */
export async function bookedCarIds(w: AvailabilityWindow): Promise<string[]> {
  const rows = await prisma.reservation.findMany({
    where: {
      status: { in: BLOCKING_STATUSES },
      pickupAt: { lt: w.returnAt },
      returnAt: { gt: w.pickupAt },
    },
    select: { carId: true },
    distinct: ["carId"],
  });
  return rows.map((r) => r.carId);
}

/** Available cars for a window (or all available cars when no window given). */
export async function availableCars(w?: AvailabilityWindow) {
  if (!w) {
    return prisma.car.findMany({
      where: { status: "available" },
      orderBy: { pricePerDay: "asc" },
    });
  }
  const booked = await bookedCarIds(w);
  return prisma.car.findMany({
    where: { status: "available", id: { notIn: booked } },
    orderBy: { pricePerDay: "asc" },
  });
}
