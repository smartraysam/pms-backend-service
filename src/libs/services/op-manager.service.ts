import { toastError, toastSuccess } from "../utils/toast";
import { User } from "@prisma/client";
import { NewOperationalManagerData } from "../types/post.types";
import https from "../config/http";
import { errorHandler } from "../config/error-handler";

export const getAllOperationalManagers = async () => {
  try {
    const { data } = await https.get<User[]>("/users/operational-managers");

    return data;
  } catch {
    toastError("Failed to fetch operational managers");
    new Error("Failed to fetch operational managers");
  }
};

export const createOperationalManager = async (data: {
  data: NewOperationalManagerData;
  adminId: string;
}) => {
  try {
    await https.post("/users/operational-managers", data);

    toastSuccess("Operational manager created successfully");
  } catch (error) {
    errorHandler(error);
  }
};

export const updateOperationalManager = async (
  data: Partial<NewOperationalManagerData>,
  userId: number,
) => {
  try {
    await https.put(`/users/operational-managers/${userId}`, data);

    toastSuccess("Operational manager updated successfully");
  } catch (error) {
    errorHandler(error);
  }
};

export const deleteOperationalManager = async (userId: number) => {
  try {
    await https.delete(`/users/operational-managers/${userId}`);

    toastSuccess("Operational manager deleted successfully");
  } catch (error) {
    errorHandler(error);
  }
};
