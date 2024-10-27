import { ParkRule } from "@prisma/client";
import { errorHandler } from "../config/error-handler";
import https from "../config/http";
import { Strip } from "../types";
import { UpsertParkRuleProps } from "../types/post.types";
import { toastSuccess } from "../utils/toast";

export const getParkRule = async () => {
  const response = await https.get("/park/rule");

  return response?.data;
};

export const updateParkRule = async (props: UpsertParkRuleProps) => {
  const data: UpsertParkRuleProps = {};

  Object.keys(props).forEach((key) => {
    if (props[key as keyof UpsertParkRuleProps]) {
      data[key as keyof typeof data] = <any>(
        props[key as keyof UpsertParkRuleProps]
      );
    }
  });

  try {
    const response = await https.put("/park/rule", data);
    toastSuccess("Park rule updated successfully");
    return response?.data;
  } catch (error) {
    errorHandler(error);
  }
};
