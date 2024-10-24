import { errorHandler } from "../config/error-handler";
import https from "../config/http";
import { ChangePasswordProps, ResetPasswordProps } from "../types";
import { toastSuccess } from "../utils/toast";

export const forgotPassword = async (email: string) => {
  try {
    const response = await https.post("/auth/forgot-password/request", {
      email,
    });
    toastSuccess("Password reset link sent");
    return response.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const resetPassword = async (props: ResetPasswordProps) => {
  try {
    const response = await https.post("/auth/forgot-password/reset", props);

    toastSuccess("Password reset successful, login to access your dashboard");
    return response?.data;
  } catch (error) {
    errorHandler(error);
  }
};

export const changePassword = async (props: ChangePasswordProps) => {
  try {
    const response = await https.put("/auth/change-password", props);

    toastSuccess("Password changed successfully");
    return response?.data;
  } catch (error) {
    errorHandler(error);
  }
};
