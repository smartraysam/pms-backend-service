import prisma from "@/lib/prisma";
import { ParkActivity, Prisma } from "@prisma/client";

export const createParkActivity = async (
  data: Omit<ParkActivity, "id" | "created_at" | "updated_at" | "vehicle">,
) => {
  // Check if the park activity already exists
  const existingActivity = await prisma.parkActivity.findFirst({
    where: {
      vehicleId: data.vehicleId,
      queueLocation: "Parking",
      debitStatus: false,
      status: "ENTRY",
    },
  });

  // If it exists, return it or handle accordingly
  if (existingActivity) {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    if (existingActivity.created_at > fiveMinutesAgo) {
      throw new Error("An exit activity was recorded less than 5 minutes ago.");
    }
  }
  // Create new park activity if it doesn't exist
  const parkActivity = await prisma.parkActivity.create({
    data: {
      ...data,
    },
  });

  return parkActivity;
};

export const getAllParkActivities = async () => {
  const parkActivities = await prisma.parkActivity.findMany({
    orderBy: {
      created_at: "desc",
    },
    include: {
      vehicle: true,
    },
  });

  return parkActivities;
};

export const getParkActivityById = async (id: number) => {
  const parkActivity = await prisma.parkActivity.findFirst({
    where: {
      id,
    },
  });

  return parkActivity;
};

export const getParkActivitiesCount = async () => {
  const count = await prisma.parkActivity.count();
  return count;
};

export const getParkedVehiclesByMonth = async (year: number) => {
  const parkedVehicles = await prisma.parkActivity.findMany({
    where: {
      queueLocation: "Parking",
      created_at: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`),
      },
    },
    select: {
      id: true,
      created_at: true,
    },
  });

  return parkedVehicles.map((vehicle) => ({
    month: new Date(vehicle.created_at).getMonth() + 1,
  }));
};

export const getTotalRidePerYear = async (year: string) => {
  const completeRides = await prisma.parkActivity.aggregate({
    _count: {
      id: true,
    },
    where: {
      queueLocation: "Exit",
      created_at: {
        gte: new Date(`${year}-01-01T00:00:00.000Z`),
        lte: new Date(`${year}-12-31T23:59:59.999Z`),
      },
    },
  });
  return completeRides._count.id;
};

export const getVehiclesInParkCount = async () => {
  const count = await prisma.parkActivity.count({
    where: {
      queueLocation: "Parking",
    },
  });

  return count;
};
