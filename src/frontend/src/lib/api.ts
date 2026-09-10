import axios from "axios";
import { useAuth } from "./api-context";

const api = axios.create({ baseURL: "/api" });

// Interceptor: add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { api };
export { useAuth } from "./api-context";
