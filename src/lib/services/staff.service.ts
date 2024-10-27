import { Vehicle } from "@prisma/client";
import https from "../config/http";
import { errorHandler } from "../config/error-handler";
import { toastSuccess } from "../utils/toast";
import { NewStaff } from "../types/post.types";

export const getAllStaffs = async () => {
  try {
    const { data: staffs } = await https.get<Vehicle[]>("/staff");

    return staffs;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const getAllStaffsCount = async () => {
  try {
    const { data: count } = await https.get<number>("/staff/count");

    return count;
  } catch (e: any) {
    throw new Error(e);
  }
};

export const createStaff = async (data: NewStaff) => {
  try {
    await https.post("/staff", data);

    toastSuccess("Staff created successfully");
  } catch (error) {
    errorHandler(error);
  }
};

export const deleteStaff = async (id: number) => {
  try {
    await https.delete(`/staff/${id}`);

    toastSuccess("Staff deleted successfully");
  } catch (error) {
    errorHandler(error);
  }
};

export const updateStaff = async ({
  data,
  id,
}: {
  id: number;
  data: NewStaff;
}) => {
  try {
    await https.put(`/staff/${id}`, data);

    toastSuccess("Staff updated successfully");
  } catch (error) {
    errorHandler(error);
  }
};

export const getStaff = async (id: number) => {
  try {
    const { data: staff } = await https.get<Vehicle>(`/staff/${id}`);

    return staff;
  } catch (e: any) {
    throw new Error(e);
  }
};
