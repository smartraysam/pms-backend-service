import { AxiosError } from "axios";
import { toastError } from "../utils/toast";

export const errorHandler = (error: unknown) => {
  let errorMessage = "Oops! an error occurred";

  if (error instanceof AxiosError) {
    errorMessage = error?.response?.data?.error || errorMessage;
  }
  throw new Error(errorMessage);
};
