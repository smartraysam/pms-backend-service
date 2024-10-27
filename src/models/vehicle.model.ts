import { ROLES } from "@/lib/constants/auth.const";
import { VehicleStatus } from "@/lib/enums";
import prisma from "@/lib/prisma";
import { GetVehiclesQuery, QueueOverview, User } from "@/lib/types";
import { Prisma, TagStatus, Vehicle, VehicleType } from "@prisma/client";
import { getUser } from "./user.model";

export const linkVehicleTag = async (vehicleId: number, tagId: number) => {
  const [vehicle, tag] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id: vehicleId },
    }),
    prisma.tag.findUnique({
      where: { id: tagId },
    }),
  ]);

  if (!vehicle) throw new Error("Vehicle does not exist");
  if (!tag) throw new Error("Tag not found");

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { tagId: tagId },
  });

  await prisma.tag.update({
    where: { id: tagId },
    data: { status: TagStatus.Assigned },
  });
};

export const unlinkVehicleTag = async (vehicleId: number, tagId: number) => {
  const [vehicle, tag] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id: vehicleId },
    }),
    prisma.tag.findUnique({
      where: { id: tagId },
    }),
  ]);

  if (!vehicle) throw new Error("Vehicle does not exist");
  if (!tag) throw new Error("Tag not found");

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { tagId: null },
  });

  await prisma.tag.update({
    where: { id: tagId },
    data: { status: TagStatus.Unassigned },
  });
};

export const createVehicle = async (vehicleData: Vehicle) => {
  try {
    let vehicle = await prisma.vehicle.findFirst({
      where: {
        providerId: vehicleData.providerId,
        vehicleNumber: vehicleData.vehicleNumber,
        firstName: vehicleData.firstName,
        lastName: vehicleData.lastName,
      },
    });

    // console.log({ vehicleExists: !!vehicle, id: vehicleData.providerId });

    const { id, fleetId, ...dataWithoutId } = vehicleData;

    if (vehicle) {
      vehicle = await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { ...dataWithoutId },
      });
    } else {
      // console.log({ fleetId });
      const fleet = await prisma.fleet.findFirst({ where: { fleetId } });

      if (!fleet) {
        throw new Error(`Fleet with fleet id ${fleetId} not found.`);
      }

      vehicle = await prisma.vehicle.create({
        data: {
          ...dataWithoutId,
          fleetId: fleet.id,
          // fleet:
        },
      });
    }

    return vehicle;
  } catch (e: any) {
    console.log({ vehicleError: e });
    throw new Error(e);
  }
};

export const getAllVehicles = async (
  user?: User,
  query: GetVehiclesQuery = {},
) => {
  const _query: Prisma.VehicleWhereInput = {};
  if (!user) return [];

  const search = query.search ?? "";

  if (search) {
    _query.OR = [
      {
        firstName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        lastName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        vehicleNumber: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const role = user?.role;

  if (role === ROLES.SUPER_MANAGER)
    return await prisma.vehicle.findMany({
      where: _query,
      include: {
        tag: true,
        fleet: true,
      },
      orderBy: [{ status: "asc" }, { tagId: "asc" }],
    });

  if (role === ROLES.LOCATION_MANAGER) {
    const location = await prisma.location.findFirst({
      where: { adminId: parseInt(user.id) },
    });

    if (!location) return [];

    return await prisma.vehicle.findMany({
      where: {
        ..._query,
        baseLocationId: location.id,
      },
      include: {
        tag: true,
        fleet: true,
      },
      orderBy: [{ status: "asc" }, { tagId: "asc" }],
    });
  }

  if (role === ROLES.OPERATIONAL_MANAGER) {
    const userInfo = await getUser(user.id);

    if (!userInfo || !userInfo.managerId) return [];

    const location = await prisma.location.findFirst({
      where: { adminId: userInfo.managerId as number },
    });

    if (!location) return [];

    return await prisma.vehicle.findMany({
      where: {
        ..._query,
        baseLocationId: location.id,
      },
      include: {
        tag: true,
        fleet: true,
      },
      orderBy: [{ status: "asc" }, { tagId: "asc" }],
    });
  }
};

export const getVehiclesCount = async (status?: VehicleStatus, user?: User) => {
  if (!user) return 0;

  const role = user.role;

  if (role === ROLES.SUPER_MANAGER)
    return await prisma.vehicle.count({
      where: {
        status,
      },
    });

  if (role === ROLES.LOCATION_MANAGER) {
    const location = await prisma.location.findFirst({
      where: { adminId: parseInt(user.id) },
    });

    if (!location) return 0;

    return await prisma.vehicle.count({
      where: {
        baseLocationId: location.id,
        status,
      },
    });
  }

  if (role === ROLES.OPERATIONAL_MANAGER) {
    const userInfo = await getUser(user.id);

    if (!userInfo || !userInfo.managerId) return 0;

    const location = await prisma.location.findFirst({
      where: { adminId: userInfo.managerId as number },
    });

    if (!location) return 0;

    return await prisma.vehicle.count({
      where: {
        baseLocationId: location.id,
        status,
      },
    });
  }
};

export const getVehiclesByStatus = async (status: VehicleStatus) => {
  return await prisma.vehicle.findMany({
    where: {
      status,
    },
  });
};

export const getVehiclesLinkedWithTagsCount = async () => {
  return await prisma.vehicle.count({
    where: {
      tagId: {
        not: null,
      },
    },
  });
};

export const updateVehicle = async ({
  status,
  vehicleId,
  type,
  specialDuty,
}: {
  vehicleId: number;
  status?: string;
  type?: VehicleType;
  specialDuty?: boolean;
}) => {
  return await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { status, type, specialDuty },
  });
};

export const getVehicle = async (vehicleId: number) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      id: vehicleId,
    },
    include: {
      tag: true,
      fleet: true,
    },
  });

  if (!vehicle) throw new Error("Vehicle not found");

  return vehicle;
};

export const getVehicleByTagId = async (TagId: number) => {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      tagId: TagId,
    },
    include: {
      tag: true,
      fleet: true,
    },
  });

  if (!vehicle) throw new Error("Vehicle not found");

  return vehicle;
};

export const getQueueOverviewPerCompany = async (locationId?: number) => {
  const companies: QueueOverview[] = await prisma.$queryRaw`
  SELECT 
    f."company" AS "companyName",
    SUM(CASE WHEN q."queueLocation" = 'Parking' THEN 1 ELSE 0 END) AS "inParkQueue",
    SUM(CASE WHEN q."queueLocation" = 'RowCall' THEN 1 ELSE 0 END) AS "inRollCallQueue",
    SUM(CASE WHEN q."queueLocation" = 'Loading' THEN 1 ELSE 0 END) AS "inLoadingQueue",
    SUM(CASE WHEN q."queueLocation" = 'Exit' THEN 1 ELSE 0 END) AS "totalCompleteTransit"
  FROM "Queue" q
  JOIN "Vehicle" v ON q."vehicleId" = v."id"
  JOIN "Fleet" f ON v."fleetId" = f."id"
  WHERE f."baseLocationId" = ${locationId}
  GROUP BY f."company";
`;

  const formattedCounts = companies.map((company) => ({
    companyName: company.companyName,
    inParkQueue: Number(company.inParkQueue),
    inRollCallQueue: Number(company.inRollCallQueue),
    inLoadingQueue: Number(company.inLoadingQueue),
    totalCompleteTransit: Number(company.totalCompleteTransit),
  }));

  return formattedCounts;
};
