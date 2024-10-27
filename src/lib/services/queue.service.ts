import https from "../config/http";
import { toastError, toastSuccess } from "../utils/toast";
import { Queue, QueueLocation } from "@prisma/client";

export const getQueueCount = async (): Promise<number> => {
  try {
    const { data } = await https.get<number>("queues/count");
    return data;
  } catch (error) {
    toastError("Failed to fetch queue count", { id: "error" });
    throw new Error("Failed to fetch queue count");
  }
};

export const getAllQueues = async (): Promise<Queue[]> => {
  try {
    const { data } = await https.get<Queue[]>("/queue");
    return data;
  } catch (error) {
    toastError("Failed to fetch queues", { id: "error" });
    throw new Error("Failed to fetch queues");
  }
};

export const getQueuesByLocation = async (location: QueueLocation) => {
  try {
    const response = await https.get<Queue[]>(`/queue/${location}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching queues by location:", error);
    throw new Error("Failed to fetch queues by location");
  }
};

export const getQueuesCountByLocation = async (location: QueueLocation) => {
  try {
    const response = await https.get<number>(`/queue/${location}/count`);
    return response.data;
  } catch (error) {
    console.error("Error fetching queues by location:", error);
    throw new Error("Failed to fetch queues by location");
  }
};

export const createQueue = async (data: {
  vehicleId: number;
  entryTime: Date;
  queueLocation?: QueueLocation;
  exitStatus?: boolean;
  debitStatus?: boolean;
  rowCallStatus?: boolean;
  payStatus?: boolean;
}) => {
  try {
    const { data: res } = await https.post("/queue", data);
    toastSuccess("Queue created successfully");
    return res;
  } catch (error) {
    toastError("Failed to create new queue", { id: "error" });
    throw new Error("Failed to create new queue");
  }
};

export const updateQueue = async (
  vehicleId: number,
  data: {
    exitTime?: Date | null;
    callTime?: Date | null;
    queueLocation?: QueueLocation;
    exitStatus?: boolean;
    debitStatus?: boolean;
    rowCallStatus?: boolean;
    payStatus?: boolean;
  },
) => {
  try {
    const { data: res } = await https.put(
      `/queue?vehicleId=${vehicleId}`,
      data,
    );
    toastSuccess("Queue updated successfully");
    return res;
  } catch (error) {
    toastError("Failed to update queue", { id: "error" });
    throw new Error("Failed to update queue");
  }
};

export const deleteQueue = async (vehicleId: number) => {
  try {
    const { data: res } = await https.delete(`/queue?vehicleId=${vehicleId}`);
    toastSuccess("Queue deleted successfully");
    return res;
  } catch (error) {
    toastError("Failed to delete queue", { id: "error" });
    throw new Error("Failed to delete queue");
  }
};

export const getQueueOverview = async () => {
  try {
    const res = await https.get(`/queue/overview`);

    return res?.data;
  } catch (error) {
    toastError("Failed to fetch overview", { id: "error" });
  }
};
