import { errorHandler } from "../config/error-handler";
import https from "../config/http";
import { RegisterDeviceProps, UpdateDeviceProps } from "../types/post.types";
export const registerDevice = async (props: RegisterDeviceProps) => {
  try {
    const response = await https.post("/device", props);
    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const updateDevice = async ({
  id,
  props,
}: {
  id: string;
  props: UpdateDeviceProps;
}) => {
  try {
    const response = await https.put(`/device/${id}`, props);
    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const deleteDevice = async (id: number) => {
  try {
    const response = await https.delete(`/device/${id}`);
    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const getDevices = async () => {
  try {
    const response = await https.get("/device");

    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const getDevicesCount = async () => {
  try {
    const { data: count } = await https.get<number>(`/device/count`);

    return count;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getDevicesOverview = async () => {
  try {
    const response = await https.get("/device/overview");

    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};
