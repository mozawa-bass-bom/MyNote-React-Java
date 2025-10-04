// helpers/UserNavService.ts
import type { Category, Note } from "../types/base";
import customAxios from "./CustomAxios";

interface UserDataResponse {
  categories: Category[];
  notes: Note[];
}

export const getNavById = async (userId: number): Promise<UserDataResponse> => {
  const { data } = await customAxios.post<UserDataResponse>("/nav", { userId });
  return data;
};
