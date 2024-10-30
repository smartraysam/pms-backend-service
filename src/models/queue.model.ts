import prisma from "@/lib/prisma";
import { Queue, QueueLocation } from "@prisma/client";
import { createParkActivity } from "./park-activities.model";
import { createLocationNotification } from "./notification.model";

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


export const processQueueAction = async () => {
  // Fetch fleets with vehicles, and include baseLocationId of vehicles
  console.log("processQueueAction: Running queue logic...");
  const fleets = await prisma.fleet.findMany({
    include: {
      vehicles: {
        select: {
          id: true,
          baseLocationId: true,
          walletBalance: true,
        },
      },
    },
  });

  for (const fleet of fleets) {
    // Process each vehicle under the fleet
    for (const vehicle of fleet.vehicles) {
      const baseLocationId = vehicle.baseLocationId;

      if (!baseLocationId) {
        continue; // Skip if vehicle has no baseLocationId
      }

      const locationWithParkRule = await prisma.location.findUnique({
        where: { id: baseLocationId },
        include: {
          parkRule: true,
        },
      });

      const parkRule = locationWithParkRule?.parkRule;

      if (!parkRule) {
        continue; // Skip if no ParkRule found
      }

      const minWalletBalance = parkRule.minWalletBalance ?? 0;
      const minPickupCharge = parkRule.minPickupCharge ?? 0;
      const maxQueueCalls = parkRule.maxCompanyQueueCall ?? 0;
      const minLoadingBayDrivers = parkRule.minCompanyDriverCount ?? 0;

      // console.log("got to charge...");

      // Only proceed with vehicles that have a sufficient wallet balance
      if (vehicle.walletBalance < minWalletBalance + minPickupCharge) {
        continue;
      }

      // Total number of vehicles in the Loading Bay Queue (TLB)
      const totalLoadingBayVehicles = await prisma.queue.count({
        where: {
          queueLocation: QueueLocation.Loading,
          vehicle: {
            fleetId: fleet.id,
          },
        },
      });

      // Find vehicles in the Parking Bay and move them to RowCall
      const vehiclesInParkingBay = await prisma.queue.findMany({
        where: {
          queueLocation: QueueLocation.Parking,
          vehicle: {
            fleetId: fleet.id,
            walletBalance: {
              gte: minWalletBalance + minPickupCharge,
            },
          },
        },
        orderBy: {
          entryTime: "asc", // FIFO: First-In-First-Out
        },
        take: maxQueueCalls - totalLoadingBayVehicles,
      });

      for (const vehicleQueue of vehiclesInParkingBay) {
        const vehicleId = vehicleQueue.vehicleId;

        await prisma.queue.update({
          where: { id: vehicleQueue.id },
          data: {
            callTime: new Date(),
            queueLocation: QueueLocation.RowCall,
          },
        });

        //check if user is not in Rowcall queue
        await createLocationNotification(baseLocationId, {
          message: "You will soon be called to the loading bay",
          vehicles: [vehicleId],
        });
        console.log("You will soon be called to the loading bay");

        // Create park activity for the vehicle
        await createParkActivity({
          vehicleId,
          queueLocation: QueueLocation.RowCall,
          debitStatus: false,
          status: "ENTRY",
          debitedAmount: 0,
          debitType: "None",
        });
      }

      // If total loading bay vehicles per fleet is less than or equal to minimum loading bay drivers
      if (totalLoadingBayVehicles <= minLoadingBayDrivers) {
        // Step 1: Retrieve the vehicles in RowCall Queue for this fleet
        const vehiclesInRowCall = await prisma.queue.findMany({
          where: {
            queueLocation: QueueLocation.RowCall,
            vehicle: {
              fleetId: fleet.id,
            },
          },
        });

        // Step 2: Update rowCallStatus to true for these vehicles
        await prisma.queue.updateMany({
          where: {
            id: {
              in: vehiclesInRowCall.map((vehicleQueue) => vehicleQueue.id),
            },
          },
          data: {
            rowCallStatus: true,
          },
        });

        // Step 3: Iterate through the retrieved vehicles to send notifications and update the queue status
        for (const vehicleQueue of vehiclesInRowCall) {
          const vehicleId = vehicleQueue.vehicleId;

          const existingActivity = await prisma.parkActivity.findFirst({
            where: {
              vehicleId: vehicleId,
              queueLocation: QueueLocation.RowCall,
              debitStatus: false,
              status: "EXIT",
            },
          });

          if (!existingActivity) {
            await createLocationNotification(baseLocationId, {
              message: "Kindly move to the loading bay",
              vehicles: [vehicleId],
            });
            console.log("Kindly move to the loading bay");
          }

          // Update the queue status
          await createParkActivity({
            vehicleId: vehicleId,
            queueLocation: QueueLocation.RowCall,
            debitStatus: false,
            status: "EXIT",
            debitedAmount: 0,
            debitType: "None",
          });
        }
      }
    }
  }
  console.log("Queue actions completed successfully.");
  return true;
};
