import { errorHandler } from "../config/error-handler";
import https from "../config/http";
import { CreateNotificationProps } from "../types/post.types";
import { toastSuccess } from "../utils/toast";

export const createNotification = async (props: CreateNotificationProps) => {
  try {
    const response = await https.post("/notification", props);

    toastSuccess("Notification sent successfully");

    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const getNotifications = async () => {
  try {
    const response = await https.get("/notification");

    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const resendNotification = async (notificationId: number) => {
  try {
    const response = await https.post(`/notification/${notificationId}/resend`);

    toastSuccess("Notification sent successfully");
    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const updateNotification = async (
  notificationId: number,
  message: string,
) => {
  try {
    const response = await https.put(`/notification/${notificationId}`, {
      message,
    });

    toastSuccess("Notification updated successfully");
    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const deleteNotification = async (notificationId: number) => {
  try {
    const response = await https.delete(`/notification/${notificationId}`);

    toastSuccess("Notification deleted successfully");
    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const getIncomingNotifications = async () => {
  try {
    const response = await https.get("/notification/incoming");

    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const markAllIncomingNotificationsAsRead = async () => {
  try {
    const response = await https.post(
      "/notification/incoming/mark-all-as-read",
    );

    toastSuccess("Notifications marked as read");

    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const markIncomingNotificationAsRead = async (id: number) => {
  try {
    const response = await https.post(
      `/notification/incoming/${id}/mark-as-read/`,
    );

    toastSuccess("Notification marked as read");

    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};
