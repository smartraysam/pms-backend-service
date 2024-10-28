import { AxiosError } from "axios";

export const errorHandler = (error: unknown) => {
  let errorMessage = "Oops! an error occurred";

  if (error instanceof AxiosError) {
    errorMessage = error?.response?.data?.error || errorMessage;
  }
  throw new Error(errorMessage);
};
