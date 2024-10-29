import prisma from "@/lib/prisma";
import { CreateNotificationProps } from "@/lib/types/post.types";

export const createNotification = async (
  userId: number,
  props: CreateNotificationProps,
) => {
  return await prisma.notification.create({
    data: {
      message: props.message,
      vehicles: {
        connect: props.vehicles.map((id) => ({ id })),
      },
      sender: {
        connect: { id: userId },
      },
    },
  });
};
export const createLocationNotification = async (
  locationId: number,
  props: CreateNotificationProps,
) => {
  return await prisma.notification.create({
    data: {
      message: props.message,
      vehicles: {
        connect: props.vehicles.map((id) => ({ id })),
      },
      location: {
        connect: {
          id: locationId,
        },
      },
    },
  });
};

export const getNotifications = async (userId: number) => {
  return await prisma.notification.findMany({
    where: {
      senderId: userId,
    },
    include: {
      vehicles: {
        select: {
          vehicleNumber: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      updated_at: "desc",
    },
  });
};

export const resendNotification = async (notificationId: number) => {
  const notification = await prisma.notification.findUnique({
    where: {
      id: notificationId,
    },
    include: {
      vehicles: true,
    },
  });

  if (!notification) throw new Error("Notification does not exist");

  return await prisma.notification.create({
    data: {
      senderId: notification.senderId,
      message: notification.message,
      vehicles: {
        connect: notification.vehicles.map(({ id }) => ({ id })),
      },
    },
  });
};

export const updateNotification = async (
  notificationId: number,
  message: string,
) => {
  return await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      message,
    },
  });
};

export const deleteNotification = async (notificationId: number) => {
  const notification = await prisma.notification.delete({
    where: {
      id: notificationId,
    },
  });

  if (!notification) throw new Error("Notification not found");

  return notification;
};

export const getIncomingNotifications = async (userId: number) => {
  const notifications = await prisma.incomingNotification.findMany({
    where: {
      userId,
    },
    orderBy: {
      created_at: "desc",
    },
    include: {
      user: true,
    },
  });

  const totalUnread = await prisma.incomingNotification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return { notifications, totalUnread };
};

export const markAllIncomingNotificationsAsRead = async (userId: number) => {
  await prisma.incomingNotification.updateMany({
    where: {
      userId,
    },
    data: {
      isRead: true,
    },
  });
};

export const markIncomingNotificationAsRead = async (
  notificationId: number,
) => {
  const notification = await prisma.incomingNotification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
    },
  });

  if (!notification) throw new Error("notification not found");

  return notification;
};
