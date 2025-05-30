import ky, { HTTPError } from "ky";
import { DEFAULT_CONFIG } from "./config";
import { ApiError, APIErrorResponse, ApiConfig } from "./types";

const createKyInstance = (config: ApiConfig = DEFAULT_CONFIG) => {
  return ky.create({
    prefixUrl: config.baseURL,
    timeout: config.timeout,
    headers: config.headers,
    hooks: {
      beforeError: [
        async (error: HTTPError) => {
          const { response } = error;

          try {
            const body = (await response.json()) as APIErrorResponse;

            if (body.error?.[0]) {
              throw new ApiError(body.error[0].message, response.status);
            }

            throw new ApiError("An unexpected error occurred", response.status);
          } catch (parseError) {
            if (parseError instanceof ApiError) {
              throw parseError;
            }
            throw new ApiError(response.statusText, response.status);
          }
        },
      ],
    },
  });
};

export default createKyInstance;