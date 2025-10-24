// helpers/RefreshNavService.ts
import type { Nav } from '../types/loginUser';
import customAxios from './CustomAxios';

export const getNavById = async (userId: number): Promise<Nav> => {
  const { data } = await customAxios.post<Nav>('notes/upload/nav', { userId });
  return data;
};
