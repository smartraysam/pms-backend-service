import prisma from "@/lib/prisma";
import { NewStaff } from "@/lib/types/post.types";

export const getAllStaffs = async () => {
  const vehicles = await prisma.vehicle.findMany({
    where: {
      fleetId: 0,
    },
  });

  return vehicles;
};

export const getAllStaffsCount = async () => {
  const count = await prisma.vehicle.count({
    where: {
      fleetId: 0,
    },
  });

  return count;
};

export const createStaff = async (data: NewStaff, userId: number) => {
  const location = await prisma.location.findFirst({
    where: {
      adminId: userId,
    },
  });

  if (!location) {
    throw new Error("Oops! you do not have a location to assign this staff to");
  }

  const vehicle = await prisma.vehicle.findFirst({
    where: {
      vehicleNumber: data.vehicleNumber,
    },
  });

  if (vehicle) {
    throw new Error("Vehicle with the same vehicle number already exists");
  }

  return await prisma.vehicle.create({
    data: {
      ...data,
      providerId: Math.floor(1000000 + Math.random() * 9000000),
      status: "approved",
      serviceTypeId: 0,
      serviceModel: data.serviceModel,
      walletBalance: 0,
      fleetId: 0,
      baseLocationId: location?.id,
      isStaffVehicle: true,
    },
  });
};

export const deleteStaff = async (id: number) => {
  return await prisma.vehicle.delete({
    where: {
      id,
    },
  });
};

export const updateStaff = async (staffID: number, data: any) => {
  const { id, created_at, updated_at, fleetId, tagId, fullName, ...rest } =
    data;

  const [firstName, lastName] = fullName.split(" ");

  // console.log({ rest });

  return await prisma.vehicle.update({
    where: {
      id: staffID,
    },
    data: { firstName, lastName, ...rest },
  });
};

export const getStaffById = async (id: number) => {
  return await prisma.vehicle.findFirst({
    where: {
      id,
    },
  });
};
