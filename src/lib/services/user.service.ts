import https from "../config/http";

export const getUsersCount = async () => {
  try {
    const { data: count } = await https.get<number>(`/users/count`);

    return count;
  } catch (e: any) {
    throw new Error(e);
  }
};
