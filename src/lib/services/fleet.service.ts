import { Fleet } from "@prisma/client";
import https from "../config/http";

export type FleetResponse = Fleet & { _count: { vehicles: number } };

export const getAllFleet = async () => {
  try {
    const { data } = await https.get<FleetResponse[]>("/fleet");

    return data;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getFleetCount = async () => {
  try {
    const { data: count } = await https.get<number>(`/fleet/count`);

    return count;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const updateFleetPriority = async ({
  priority,
  fleetId,
}: {
  fleetId: number;
  priority: boolean;
}) => {
  try {
    const { data } = await https.patch<{ message: string }>(
      `/fleet/${fleetId}`,
      {
        priority,
      },
    );

    return data;
  } catch (e: any) {
    throw new Error(e);
  }
};
