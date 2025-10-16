// src/helpers/CustomAxios.ts
import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import type { LoginUser } from '../types/loginUser';
import type { ApiResponse } from '../types/base';

/**
 * Axios instance
 */
const customAxios = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // @SessionAttribute を使うなら必須
});

/* ----------------------------
 *  Request interceptor
 * ---------------------------- */
customAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // localStorage からログイン情報を読み、Bearer を付与
    const stored = localStorage.getItem('loginUser');
    if (stored) {
      try {
        const loginUser: LoginUser = JSON.parse(stored);
        if (loginUser?.token) {
          config.headers['Authorization'] = `Bearer ${loginUser.token}`;
        }
      } catch (e) {
        console.error('Failed to parse loginUser from localStorage', e);
      }
    }
    return config;
  },
  (error: AxiosError | Error): Promise<AxiosError> => {
    return Promise.reject(error as AxiosError);
  }
);

/* ----------------------------
 *  Response interceptor（ApiResponse<T> を“はがす”）
 * ---------------------------- */
customAxios.interceptors.response.use(
  (response: AxiosResponse) => {
    // 204 / 空ボディはそのまま返す
    if (response.status === 204 || response.data == null) return response;

    // Blob/ArrayBuffer/stream は剥がさない
    const rt = response.config?.responseType;
    if (rt === 'blob' || rt === 'arraybuffer' || rt === 'stream') return response;

    // JSON 以外（SSE: text/event-stream など）は剥がさない
    const ct = String(response.headers?.['content-type'] ?? '').toLowerCase();
    if (!ct.includes('application/json')) return response;

    // ApiResponse<T> っぽい時だけ剥がす
    const body = response.data as Partial<ApiResponse<unknown>>;
    const looksLikeEnvelope = body && typeof body === 'object' && 'success' in body && 'data' in body;

    if (!looksLikeEnvelope) {
      // 既に生データ（ラッパー無し）はそのまま
      return response;
    }

    if (body.success) {
      // OK → 中身へ差し替え
      response.data = body.data;
      return response;
    } else {
      // NG →  reject
      const err = new Error((typeof body.message === 'string' && body.message) || 'API failed');
      return Promise.reject(err);
    }
  },
  (error: AxiosError) => {
    // 共通エラーハンドリング（任意で拡張）
    const status = error.response?.status;

    // セッション切れ等：401/419 でログアウト誘導（プロジェクト方針次第）
    if (status === 401 || status === 419) {
      localStorage.removeItem('loginUser');
      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);

export default customAxios;

// 中身だけ返す糖衣関数
export async function getOk<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await customAxios.get<T, AxiosResponse<T>>(url, config);
  return res.data;
}

export async function postOk<T, D = unknown>(url: string, payload?: D, config?: AxiosRequestConfig<D>): Promise<T> {
  const res = await customAxios.post<T, AxiosResponse<T>, D>(url, payload, config);
  return res.data;
}

export async function patchOk<T, D = unknown>(url: string, payload?: D, config?: AxiosRequestConfig<D>): Promise<T> {
  const res = await customAxios.patch<T, AxiosResponse<T>, D>(url, payload, config);
  return res.data;
}

export async function delOk<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await customAxios.delete<T, AxiosResponse<T>>(url, config);
  return res.data;
}

type ApiErrorBody = { message?: string; code?: string };

export function isCanceledError(e: unknown): boolean {
  // axios v1 系
  // どれかが当たればキャンセルと判定
  return !!(
    axios.isCancel?.(e) ||
    (typeof e === 'object' &&
      e !== null &&
      ('code' in e || 'name' in e) &&
      // @ts-expect-error: runtime narrow
      (e.code === 'ERR_CANCELED' || e.name === 'CanceledError'))
  );
}

export function toAxiosError(e: unknown): AxiosError<ApiErrorBody> | null {
  if (axios.isAxiosError?.(e)) return e as AxiosError<ApiErrorBody>;
  return null;
}
