import { ServiceType } from "@prisma/client";
import https from "../config/http";

export const getAllServiceType = async () => {
  try {
    const { data } = await https.get<ServiceType[]>("/service-type");

    return data;
  } catch (e: any) {
    throw new Error(e);
  }
};
