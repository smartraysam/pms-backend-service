import { Vehicle, VehicleType } from "@prisma/client";
import https from "../config/http";
import { VehicleStatus } from "../enums";
import { errorHandler } from "../config/error-handler";
import { QueueOverview, VehicleDetails } from "../types";

export const getVehicles = async (search?: string) => {
  let url = "/vehicles?";

  if (search) {
    url += `search=${search}`;
  }

  try {
    const { data } = await https.get<Vehicle[]>(url);

    return data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getVehiclesCount = async (type: "linked" | "count") => {
  try {
    const { data: count } = await https.get<number>(`/vehicles?${type}=true`);

    return count;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getVehiclesByStatus = async (status: VehicleStatus) => {
  try {
    const { data: vehicles } = await https.get<Vehicle[]>(
      `/vehicles/status?status=${status}`,
    );

    return vehicles;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getVehiclesCountSpecial = async (status?: VehicleStatus) => {
  try {
    const { data: count } = await https.get<number>(
      `/vehicles/count?status=${status}`,
    );

    return count;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const updateVehicleStatus = async ({
  status,
  vehicleId,
}: {
  vehicleId: number;
  status: string;
}) => {
  try {
    const { data } = await https.patch<{ message: string }>(
      `/vehicles/${vehicleId}`,
      {
        status,
      },
    );

    return data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const updateVehicleType = async ({
  type,
  vehicleId,
}: {
  vehicleId: number;
  type: VehicleType;
}) => {
  try {
    const { data } = await https.patch<{ message: string }>(
      `/vehicles/${vehicleId}`,
      {
        type,
      },
    );

    return data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const updateVehicleSpecialDuty = async ({
  specialDuty,
  vehicleId,
}: {
  vehicleId: number;
  specialDuty: boolean;
}) => {
  try {
    const { data } = await https.patch<{ message: string }>(
      `/vehicles/${vehicleId}`,
      {
        specialDuty,
      },
    );

    return data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getQueueOverviewPerCompany = async () => {
  try {
    const response = await https.get<QueueOverview[]>("/vehicles/overview");

    return response?.data;
  } catch (error: any) {
    throw new Error(error);
  }
};
