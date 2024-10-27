import { AuditLog } from "@prisma/client";
import https from "../config/http";
import { CreateAuditLog } from "../types/post.types";

export const createAuditLog = async (data: CreateAuditLog) => {
  try {
    const { data: res } = await https.post("/audit-log", data);

    return res;
  } catch (error) {
    throw new Error("Error creating audit log");
  }
};

export const getAuditLogs = async ({
  from,
  to,
}: {
  from?: string;
  to?: string;
}) => {
  try {
    const { data } = await https.get<AuditLog[]>(
      `/audit-log?from=${from}&to=${to}`,
    );

    return data;
  } catch (error) {
    throw new Error("Error fetching audit logs");
  }
};
