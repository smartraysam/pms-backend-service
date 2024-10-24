import { TagStatus } from "@prisma/client";
import { errorHandler } from "../config/error-handler";
import https from "../config/http";
import { LinkVehicleTagProps } from "../types/post.types";
import { toastSuccess } from "../utils/toast";

export const getTags = async (status?: TagStatus) => {
  try {
    let url = "/tag?";
    if (status) {
      url += `status=${status}`;
    }

    const response = await https.get(url);
    return response?.data?.data;
  } catch (error) {
    return errorHandler(error);
  }
};

export const linkVehicleTag = async (props: LinkVehicleTagProps) => {
  try {
    const response = await https.post(`/vehicles/${props.vehicleId}/link-tag`, {
      tagId: props.tagId,
    });

    toastSuccess("Tag assigned to vehicle");

    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const unLinkVehicleTag = async (props: LinkVehicleTagProps) => {
  try {
    const response = await https.post(
      `/vehicles/${props.vehicleId}/unlink-tag`,
      {
        tagId: props.tagId,
      },
    );

    toastSuccess("Tag unassigned to vehicle");

    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const getVehicle = async (vehicleId: number) => {
  try {
    const response = await https.get(`/vehicles/${vehicleId}`);

    return response?.data;
  } catch (error) {
    errorHandler(error);
  }
};
