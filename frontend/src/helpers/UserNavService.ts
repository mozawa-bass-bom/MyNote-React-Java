// helpers/UserNavService.ts
import type { Category, NoteSummary } from '../types/base';
import customAxios from './CustomAxios';

interface UserDataResponse {
  categories: Category[];
  notes: NoteSummary[];
}

export const getNavById = async (userId: number): Promise<UserDataResponse> => {
  const { data } = await customAxios.post<UserDataResponse>('notes/upload/nav', { userId });
  return data;
};
