import axios from "axios";
import type { InternalAxiosRequestConfig, AxiosError } from "axios";

interface LoginUser {
  token: string;
}

const customAxios = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

customAxios.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const stored = localStorage.getItem("loginUser");
    if (stored) {
      try {
        const loginUser: LoginUser = JSON.parse(stored);
        if (loginUser.token) {
          config.headers["Authorization"] = `Bearer ${loginUser.token}`;
        }
      } catch (e) {
        console.error("Failed to parse loginUser from localStorage", e);
      }
    }
    return config;
  },
  (error: AxiosError | Error): Promise<AxiosError> => {
    return Promise.reject(error);
  }
);

export default customAxios;
