import prisma from "@/lib/prisma";
import { RegisterLocation } from "@/lib/types/post.types";
import { ROLES } from "@/lib/constants/auth.const";
import bcrypt from "bcrypt";
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
  const {
    locationAddress,
    locationName,
    managerEmail,
    managerName,
    phoneNumber,
  } = data;

  // create location manager

  const role = await prisma.role.findFirst({
    where: { name: ROLES.LOCATION_MANAGER },
  });

  if (!role) throw new Error("Role not found");

  const passwordSalt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(phoneNumber, passwordSalt);

  const user = await prisma.user.create({
    data: {
      email: managerEmail,
      name: managerName,
      password: hashedPassword,
      phone_number: phoneNumber,
      roleId: role.id,
    },
  });

  const locationExists = await prisma.location.findFirst({
    where: { address: locationAddress, adminId: user.id, name: locationName },
  });

  if (locationExists) throw new Error("Location already exists");

  // create location
  await prisma.location.create({
    data: {
      address: locationAddress,
      name: locationName,
      adminId: user.id,
    },
  });
};

export const updateLocation = async (
  data: RegisterLocation,
  locationId: number,
) => {
  const location = await prisma.location.findUniqueOrThrow({
    where: { id: locationId },
  });

  const {
    locationAddress,
    locationName,
    managerEmail,
    managerName,
    phoneNumber,
  } = data;

  const userUpdate = {
    email: managerEmail,
    name: managerName,
    phone_number: phoneNumber,
  };

  const locationUpdate = {
    name: locationName,
    address: locationAddress,
  };

  const locationExists = await prisma.location.findFirst({
    where: {
      adminId: location.adminId,
      name: locationName,
      NOT: { id: locationId },
    },
  });

  if (locationExists)
    throw new Error("Another location with this name already exists");

  const userExists = await prisma.user.findFirst({
    where: {
      OR: [
        {
          phone_number: phoneNumber,
        },
        {
          email: managerEmail,
        },
      ],
      NOT: {
        id: location.adminId,
      },
    },
  });

  if (userExists)
    throw new Error(
      "Oops! another user with this email/phone number already exists",
    );

  await prisma.location.update({
    where: { id: locationId },
    data: locationUpdate,
  });

  await prisma.user.update({
    where: { id: location.adminId },
    data: userUpdate,
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
  locationProps: UpdateLocationProps,
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
