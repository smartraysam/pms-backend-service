import prisma from "@/lib/prisma";
import { getUserLocation } from "./location.model";
import { ParkRule, Prisma } from "@prisma/client";
import { Strip } from "@/lib/types";

export const getParkRule = async (userId: string) => {
  const location = await getUserLocation(userId);

  if (!location) return null;

  const parkRule = await prisma.parkRule.findUnique({
    where: {
      locationId: location?.id,
    },
  });

  return parkRule;
};

export const updateParkRule = async (
  userId: string,
  update: Partial<ParkRule>,
) => {
  const location = await getUserLocation(userId);

  const parkRule = await prisma.parkRule.upsert({
    where: {
      locationId: location?.id,
    },
    update,
    create: {
      ...update,
      locationId: location?.id!,
    },
  });

  return parkRule;
};

// export const createParkRule = async (body: Strip<ParkRule>) => {
//   const parkRule = await prisma.parkRule.create({
//     data: { ...body },
//   });

//   return parkRule;
// };
