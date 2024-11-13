import { ROLES } from "@/lib/constants/auth.const";
import prisma from "@/lib/prisma";
import { User } from "@/lib/types";
import { Prisma } from "@prisma/client";
import { getUser } from "./user.model";

export const createFleet = async (fleetData: Prisma.FleetCreateInput) => {
  try {
    let fleet = await prisma.fleet.findFirst({
      where: {
        name: fleetData.name,
        email: fleetData.email,
        company: fleetData.company,
      },
    });

    // console.log({ fleetData });

    if (fleet) {
      await prisma.fleet.update({
        where: { id: fleet.id },
        data: fleetData,
      });
      return fleet;
    } else {
      fleet = await prisma.fleet.create({
        data: {
          name: fleetData.name,
          email: fleetData.email,
          company: fleetData.company,
          fleetId: fleetData.fleetId,
          mobile: fleetData.mobile,
          walletBalance: fleetData.walletBalance,
          status: fleetData.status,
        },
      });
    }

    return fleet;
  } catch (e: any) {
    console.log({ fleetError: e });
    throw new Error(e);
  }
};

export const fetchFleets = async (user?: User) => {
  if (!user) return [];

  const roleId = user.roleId;

  const role = await prisma.role.findUnique({ where: { id: roleId } });

  if (!role) return [];

  if (role.name === ROLES.SUPER_MANAGER)
    return await prisma.fleet.findMany({
      include: { _count: { select: { vehicles: true } } },
    });

  if (role.name === ROLES.LOCATION_MANAGER) {
    const location = await prisma.location.findFirst({
      where: { adminId: parseInt(user.id) },
    });

    if (!location) return [];

    return await prisma.fleet.findMany({
      include: {
        _count: { select: { vehicles: true } },
      },
      where: { baseLocationId: location.id },
    });
  }

  if (role.name === ROLES.OPERATIONAL_MANAGER) {
    const userInfo = await getUser(user.id);

    if (!userInfo || !userInfo.managerId) return [];

    const location = await prisma.location.findFirst({
      where: { adminId: userInfo.managerId as number },
    });

    if (!location) return [];

    return await prisma.fleet.findMany({
      include: {
        _count: { select: { vehicles: true } },
      },
      where: { baseLocationId: location.id },
    });
  }
};

export const getFleetCount = async (user?: User) => {
  if (!user) return 0;
  console.log({ user });
  const roleId = user.roleId;
  console.log({ roleId });

  const role = await prisma.role.findUnique({ where: { id: roleId } });

  if (!role) return [];

  if (role.name === ROLES.SUPER_MANAGER) return await prisma.fleet.count();

  if (role.name === ROLES.LOCATION_MANAGER) {
    const location = await prisma.location.findFirst({
      where: { adminId: parseInt(user.id) },
    });

    if (!location) return 0;

    return await prisma.fleet.count({
      where: { baseLocationId: location.id },
    });
  }

  if (role.name === ROLES.OPERATIONAL_MANAGER) {
    const userInfo = await getUser(user.id);

    if (!userInfo || !userInfo.managerId) return 0;

    const location = await prisma.location.findFirst({
      where: { adminId: userInfo.managerId as number },
    });

    if (!location) return 0;

    return await prisma.fleet.count({
      where: { baseLocationId: location.id },
    });
  }
};

export const updateFleet = async (
  where: Prisma.FleetWhereUniqueInput,
  data: Prisma.FleetUpdateInput
) => {
  return await prisma.fleet.update({ where, data });
};
export const updateFleetPriority = async (id: number, priority: boolean) => {
  const fleet = await prisma.fleet.update({
    where: { id },
    data: { priority },
  });

  if (!fleet) throw new Error("Fleet does not exist");

  return fleet;
};
