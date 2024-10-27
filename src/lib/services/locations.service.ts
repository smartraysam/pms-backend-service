import axios from "axios";
import { toastError, toastSuccess } from "../utils/toast";
import { RegisterLocation } from "../types/post.types";
import { Location } from "@prisma/client";
import { LocationDetails, LocationWithManager } from "../types";
import { errorHandler } from "../config/error-handler";
import https from "../config/http";
import { UpdateLocationProps } from "../types";

export const getLocationCount = async () => {
  try {
    const { data } = await axios.get<number>("/api/locations/count");
    return data;
  } catch {
    toastError("Failed to fetch location count", { id: "error" });
    throw new Error("Failed to fetch location count");
  }
};

export const getAllLocations = async (): Promise<LocationWithManager[]> => {
  try {
    const { data } = await axios.get<LocationWithManager[]>("/api/locations");

    return data;
  } catch {
    toastError("Failed to fetch locations", { id: "error" });
    throw new Error("Failed to fetch locations");
  }
};

export const registerLocation = async (data: RegisterLocation) => {
  try {
    const { data: res } = await axios.post("/api/locations/create", data);
    toastSuccess("Location created successfully");

    return res;
  } catch {
    toastError("Failed to register new location", { id: "error" });
    throw new Error("Failed to register new location");
  }
};

export const getUserLocation = async () => {
  try {
    const response = await https.get("/locations/user");

    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const updateLocation = async (props: UpdateLocationProps) => {
  try {
    const formData = new FormData();

    if (props.name) {
      formData.append("name", props.name);
    }
    if (props.logo) {
      formData.append("logo", props.logo);
    }

    const response = await https.put("/locations/user", formData);

    toastSuccess("Location Updated");
    return response?.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const adminUpdateLocation = async (
  props: RegisterLocation,
  locationId: number,
) => {
  try {
    const response = await https.put(`/locations/${locationId}`, props);

    toastSuccess("Location updated successfully");
    return response?.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const adminDeleteLocation = async (locationId: number) => {
  try {
    const response = await https.delete(`/locations/${locationId}`);

    toastSuccess("Location deleted successfully");
    return response?.data;
  } catch (error) {
    errorHandler(error);
  }
};
