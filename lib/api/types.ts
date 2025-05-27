export interface ValidationError {
  code: string;
  message: string;
  path?: string[];
}

export interface APIErrorResponse {
  success: boolean;
  error?: ValidationError[];
  data?: unknown;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  enableAuth?: boolean;
}

export class ApiError extends Error {
  public statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}