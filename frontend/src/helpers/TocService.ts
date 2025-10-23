import { getOk } from './CustomAxios';
import type { ApiTocMapResponse } from '../types/base';

export async function getTocMap() {
  return getOk<ApiTocMapResponse>('/notes/toc');
}
