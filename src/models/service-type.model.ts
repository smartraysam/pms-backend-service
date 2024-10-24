import prisma from "@/lib/prisma";
import { ServiceType } from "@prisma/client";

export const createServiceType = async (serviceTypeData: ServiceType) => {
  try {
    const serviceType = await prisma.serviceType.findFirst({
      where: { id: serviceTypeData.id },
    });

    if (serviceType) {
      return;
      // await prisma.serviceType.update({
      //   where: { id: serviceType.id },
      //   data: serviceTypeData,
      // });
    } else {
      await prisma.serviceType.create({
        data: serviceTypeData,
      });
    }

    return serviceType;
  } catch (e: any) {
    console.log({ serviceTypeError: e });
    throw new Error(e);
  }
};

export const fetchAllServiceType = async () => {
  try {
    const serviceType = await prisma.serviceType.findMany();

    return serviceType;
  } catch (e: any) {
    throw new Error(e);
  }
};
