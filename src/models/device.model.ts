import prisma from "@/lib/prisma";
import { RegisterDeviceProps, UpdateDeviceProps } from "@/lib/types/post.types";
import { getUserLocation } from "./location.model";
import { ControlState, DeviceStatus, Prisma } from "@prisma/client";
import { differenceInMinutes, endOfYear, startOfYear, sub } from "date-fns";
import { calcPercentageChange } from "@/lib/utils";

export const registerDevice = async (
  data: RegisterDeviceProps,
  locationId: number,
) => {
  const device = await prisma.device.create({
    data: {
      ...data,
      locationId,
    },
    include: { location: true },
  });

  return device;
};

export const updateDevice = async (id: number, data: UpdateDeviceProps) => {
  const device = await prisma.device.update({
    where: { id },
    data: {
      name: data.name,
      status: data.status as DeviceStatus,
      installPoint: data.installPoint,
      deviceId: data.deviceId,
    },
  });

  return device;
};

export const getDevicesById = async (deviceId: string) => {
  const device = await prisma.device.findFirst({
    where: { deviceId },
  });

  return device;
};

export const updateDeviceById = async (
  deviceId: string,
  control?: ControlState,
) => {
  const existingDevice = await prisma.device.findFirst({
    where: { deviceId },
  });

  if (!existingDevice) {
    throw new Error(`Device with ID ${deviceId} not found.`);
  }

  const updatedDevice = await prisma.device.update({
    where: { id: existingDevice.id },
    data: {
      status: DeviceStatus.Active,
      ctlstate: control ?? existingDevice.ctlstate,
      updated_at: new Date().toISOString(),
    },
  });

  return updatedDevice;
};

export const deleteDevice = async (id: number) => {
  return await prisma.device.delete({ where: { id } });
};

export const getDevicesCount = async () => {
  return await prisma.device.count();
};

export const getDevices = async (userId: string) => {
  const _query: Prisma.DeviceWhereInput = {};

  const location = await getUserLocation(userId);

  if (location) {
    _query.locationId = location.id;
  }

  const devices = await prisma.device.findMany({
    where: _query,
    include: {
      location: true,
    },
    orderBy: {
      updated_at: "desc", // Sorting in descending order (latest first)
    },
  });

  return devices;
};

export const getDevicesOverview = async (userId: string) => {
  const _query: Prisma.DeviceWhereInput = {};

  const location = await getUserLocation(userId);

  if (location) {
    _query.locationId = location.id;
  }

  const [total, active, inactive, idle, currentYear, prevYear] =
    await Promise.all([
      prisma.device.count({ where: _query }),
      prisma.device.count({
        where: {
          ..._query,
          status: DeviceStatus.Active,
        },
      }),
      prisma.device.count({
        where: {
          ..._query,
          status: DeviceStatus.Inactive,
        },
      }),
      prisma.device.count({
        where: {
          ..._query,
          status: DeviceStatus.Idle,
        },
      }),
      prisma.device.count({
        where: {
          ..._query,
          created_at: {
            gte: startOfYear(new Date()),
            lte: endOfYear(new Date()),
          },
        },
      }),
      prisma.device.count({
        where: {
          ..._query,
          created_at: {
            gte: startOfYear(sub(new Date(), { years: 1 })),
            lte: endOfYear(sub(new Date(), { years: 1 })),
          },
        },
      }),
    ]);

  const percentageChange = calcPercentageChange(currentYear, prevYear);

  const data = {
    total,
    inactive,
    active,
    idle,
    percentageChange,
  };

  return data;
};

export const autoDeactivateDevices = async () => {
  const now = new Date();
  const devices = await prisma.device.findMany({
    where: {
      OR: [
        {
          status: DeviceStatus.Active,
        },
        {
          status: DeviceStatus.Idle,
        },
      ],
    },
    select: {
      id: true,
      status: true,
      updated_at: true,
    },
  });

  const idleDevices: number[] = [];

  devices.forEach((device) => {
    const isIdle = differenceInMinutes(now, device.updated_at) > 8;

    if (isIdle) idleDevices.push(device.id);
  });

  await prisma.device.updateMany({
    where: {
      OR: [...idleDevices.map((id) => ({ id }))],
    },
    data: {
      status: DeviceStatus.Inactive,
    },
  });
  console.log("Device status check done");
};
