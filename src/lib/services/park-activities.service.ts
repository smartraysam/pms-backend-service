import { ParkActivity } from "@prisma/client";
import { errorHandler } from "../config/error-handler";
import https from "../config/http";

export const createParkActivity = async (data: ParkActivity) => {};

export const getAllParkActivities = async ({
  from,
  to,
}: {
  from?: string;
  to?: string;
} = {}) => {
  try {
    const { data } = await https.get<ParkActivity[]>(
      `/park-activities?from=${from}&to=${to}`,
    );

    return data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const getVehiclesParkedEveryMonth = async (year: string) => {
  try {
    const { data } = await https.get<{
      parkedVehicles: { month: number; count: number }[];
    }>(`/park-activities/count/${year}/parked`);

    return data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const getTotalRidePerYear = async (year: string) => {
  try {
    const { data } = await https.get<number>(
      `/park-activities/count/${year}/complete-ride`,
    );

    return data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const getVehiclesInParkCount = async () => {
  try {
    const { data } = await https.get<number>("/park-activities/count/parked");

    return data;
  } catch (error) {
    return errorHandler(error);
  }
};
