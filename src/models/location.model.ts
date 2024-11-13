import prisma from "@/lib/prisma";
import { RegisterLocation } from "@/lib/types/post.types";
import { UpdateLocationProps } from "@/lib/types";
import { Prisma } from "@prisma/client";
import * as fs from "fs/promises";

export const getLocationCount = async () => {
  return await prisma.location.count();
};

export const getLocations = async () => {
  return await prisma.location.findMany({
    include: {
      admin: true,
    },
  });
};

export const createNewLocation = async (data: RegisterLocation) => {
  console.log({ data });  
  const { address, name, adminId, logo } = data;

  const locationExists = await prisma.location.findFirst({
    where: { address, adminId, name },
  });

  if (locationExists !==null) throw new Error("Location already exists");

  // create location
 const location = await prisma.location.create({
    data: {
      address,
      name,
      adminId,
      logo
    },
  });
  return location;  
};

export const updateLocation = async (
  data: RegisterLocation,
  locationId: number
) => {
  const location = await prisma.location.findUniqueOrThrow({
    where: { id: locationId },
  });

  const { address, name, logo } = data;

  const locationUpdate = {
    name,
    address,
    logo
  };

  const locationExists = await prisma.location.findFirst({
    where: {
      adminId: location.adminId,
      name: name,
      NOT: { id: locationId },
    },
  });

  if (locationExists)
    throw new Error("Another location with this name already exists");

  await prisma.location.update({
    where: { id: locationId },
    data: locationUpdate,
  });
};

export const deleteLocation = async (locationId: number) => {
  const location = await prisma.location.findUnique({
    where: { id: locationId },
  });

  if (!location) throw new Error("Location does not exist");

  await Promise.all([
    prisma.location.delete({
      where: {
        id: locationId,
      },
    }),
    prisma.user.delete({
      where: {
        id: location.adminId,
      },
    }),
  ]);
};

export const getUserLocation = async (userId: string) => {
  const location = await prisma.location.findFirst({
    where: { adminId: parseInt(userId) },
  });

  return location;
};

export const updateUserLocation = async (
  userId: string,
  locationProps: UpdateLocationProps
) => {
  const location = await prisma.location.findFirst({
    where: { adminId: parseInt(userId) },
  });

  if (!location) {
    throw new Error("Location not found");
  }

  let data: Prisma.LocationUpdateInput = {};

  if (locationProps.name) {
    data.name = locationProps.name as string;
  }

  if (locationProps.logo) {
    const file = locationProps.logo as File;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const location = `/uploads/${file.name}`;

    await fs.writeFile(`./public/${location}`, buffer);
    data.logo = location;
  }

  await prisma.location.update({ where: { id: location.id }, data });
};
