import prisma from "@/lib/prisma";
import { Queue, QueueLocation } from "@prisma/client";

export const getAllQueues = async () => {
  try {
    const queues = await prisma.queue.findMany();
    return queues;
  } catch (error) {
    console.error("Error fetching queues:", error);
    throw new Error("Failed to fetch queues");
  }
};

export const getQueueById = async (vehicleId: number) => {
  try {
    const queue = await prisma.queue.findFirst({
      where: { vehicleId },
      include: { vehicle: true },
    });
    return queue;
  } catch (error) {
    console.error(`Error fetching queue for vehicleId ${vehicleId}:`, error);
    throw new Error("Failed to fetch queue by vehicleId");
  }
};

export const createQueue = async (data: Partial<Queue>) => {
  try {
    const queue = await prisma.queue.create({
      data: {
        vehicleId: data.vehicleId!,
        entryTime: data.entryTime!,
        exitTime: data.exitTime ?? null,
        callTime: data.callTime ?? null,
        queueLocation: data.queueLocation || "Parking",
        exitStatus: data.exitStatus ?? false,
        debitStatus: data.debitStatus ?? false,
        rowCallStatus: data.rowCallStatus ?? false,
        payStatus: data.payStatus ?? false,
      },
    });
    return queue;
  } catch (error) {
    console.error("Error creating queue:", error);
    throw new Error("Failed to create queue");
  }
};

export const updateQueue = async (
  vehicleId: number,
  data: {
    exitTime?: Date | null;
    entryTime?: Date | null;
    callTime?: Date | null;
    queueLocation?: "Parking" | "Loading" | "RowCall" | "Exit";
    exitStatus?: boolean;
    debitStatus?: boolean;
    rowCallStatus?: boolean;
    payStatus?: boolean;
  },
) => {
  try {
    const queue = await prisma.queue.findFirst({
      where: { vehicleId },
    });

    if (!queue) {
      throw new Error(`No queue found for vehicleId ${vehicleId}`);
    }

    const updatedQueue = await prisma.queue.update({
      where: { id: queue.id },
      data: {
        exitTime: data.exitTime ?? undefined,
        callTime: data.callTime ?? undefined,
        queueLocation: data.queueLocation ?? undefined,
        exitStatus: data.exitStatus ?? undefined,
        debitStatus: data.debitStatus ?? undefined,
        rowCallStatus: data.rowCallStatus ?? undefined,
        payStatus: data.payStatus ?? undefined,
        entryTime: data.entryTime ?? undefined,
      },
    });

    return updatedQueue;
  } catch (error) {
    console.error(`Error updating queue for vehicleId ${vehicleId}:`, error);
    throw new Error("Failed to update queue");
  }
};

export const deleteQueue = async (vehicleId: number) => {
  try {
    const queue = await prisma.queue.findFirst({
      where: { vehicleId },
    });

    if (!queue) {
      throw new Error(`No queue found for vehicleId ${vehicleId}`);
    }

    const deletedQueue = await prisma.queue.delete({
      where: { id: queue.id },
    });

    return deletedQueue;
  } catch (error) {
    console.error(`Error deleting queue for vehicleId ${vehicleId}:`, error);
    throw new Error("Failed to delete queue");
  }
};

export const getQueuesByLocation = async (location: QueueLocation) => {
  return await prisma.queue.findMany({
    where: {
      queueLocation: location,
    },
    include: {
      vehicle: {
        include: {
          fleet: true,
        },
      },
    },
  });
};

export const getCountByLocation = async (location: QueueLocation) => {
  try {
    const count = await prisma.queue.count({
      where: {
        queueLocation: location,
      },
    });

    return count;
  } catch (error) {
    console.error("Error getting count by location:", error);
    throw new Error("Failed to fetch count by location");
  }
};

export const getQueueOverview = async () => {
  try {
    const [parking, loading, rowCall] = await Promise.all([
      prisma.queue.count({
        where: {
          queueLocation: QueueLocation.Parking,
        },
      }),
      prisma.queue.count({
        where: {
          queueLocation: QueueLocation.Loading,
        },
      }),
      prisma.queue.count({
        where: {
          queueLocation: QueueLocation.RowCall,
        },
      }),
    ]);

    return {
      parking,
      loading,
      rowCall,
    };
  } catch (error) {
    throw new Error("Failed to fetch queue overview");
  }
};

export const allowSpecialVehicleAccess = async (
  vehicleId: number,
  QueueLocation: string,
) => {
  const vehicle = await prisma.vehicle.findUniqueOrThrow({
    where: { id: vehicleId },
    include: {
      fleet: true,
    },
  });

  const parkRule = await prisma.parkRule.findFirst({
    where: {
      locationId: vehicle.fleet.baseLocationId!,
    },
  });

  let allowSpecial = false;
  let fleetPriority = false;
  let isStaff = false;
  let enoughWalletBalance = true;
  const minCharge =
    (parkRule?.minWalletBalance ?? 0) + (parkRule?.minPickupCharge ?? 0);

  if (vehicle.fleet.priority) {
    fleetPriority = true;
    if (QueueLocation === "Loading") {
      if (vehicle.walletBalance < minCharge) enoughWalletBalance = false;
    }
  }
  if (vehicle.specialDuty) {
    allowSpecial = true;
    if (QueueLocation === "Loading") {
      if (vehicle.walletBalance < minCharge) enoughWalletBalance = false;
    }
  }
  if (vehicle.isStaffVehicle) (allowSpecial = true), (isStaff = true);

  return {
    isStaff,
    allowSpecial,
    fleetPriority,
    enoughWalletBalance,
  };
};
