import prisma from "@/lib/prisma";
import { CreateAuditLog } from "@/lib/types/post.types";
import { getUser } from "./user.model";

export const createNewAuditLog = async (data: CreateAuditLog) => {
  const user = await getUser(data.performedBy);

  if (!user) {
    throw new Error("User not found");
  }

  const audit = await prisma.auditLog.create({
    data: {
      actionType: data.actionType,
      actionDetails: data.actionDetails,
      actionOn: data.actionOn,
      userId: user.id,
    },
  });
  return audit;
};
