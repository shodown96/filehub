import type { AxiosInstance, AxiosResponse, RawAxiosRequestHeaders } from "axios";
import axios from "axios";
import { APIResponse } from "../types";

interface ClientOptions {
  baseURL?: string;
  multipart?: boolean;
  extraHeaders?: RawAxiosRequestHeaders;
}

function createClient({ baseURL = "", multipart = false, extraHeaders = {} }: ClientOptions = {}): AxiosInstance {
  const instance: AxiosInstance = axios.create({
    baseURL,
    timeout: 30000,
    headers: {
      "Content-Type": multipart ? "multipart/form-data" : "application/json",
      ...extraHeaders,
    },
  });

  // Attach interceptors
  instance.interceptors.response.use(
    (response) => response as AxiosResponse<APIResponse>,
    (error) => {
      if (error.code === "ERR_NETWORK") {
        error["response"] = {
          data: {
            title: "Network error",
            message: "Please try again later, thank you.",
          },
        };
      }
      return Promise.reject(error);
    }
  );

  return instance;
}

// Default client export
export const client = createClient();
