/**
 * Shared error types and utilities
 */

export const ErrorCode = {
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  INTERNAL: "INTERNAL",
  STRIPE_ERROR: "STRIPE_ERROR",
  PINTEREST_ERROR: "PINTEREST_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMIT: "RATE_LIMIT",
} as const;

export type ErrorCodeType = typeof ErrorCode[keyof typeof ErrorCode];

export class AppError extends Error {
  public readonly code: ErrorCodeType;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: ErrorCodeType, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.details = details;
    this.statusCode = STATUS_MAP[code] ?? 500;
  }
}

const STATUS_MAP: Record<ErrorCodeType, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL: 500,
  STRIPE_ERROR: 502,
  PINTEREST_ERROR: 502,
  VALIDATION_ERROR: 422,
  RATE_LIMIT: 429,
};

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

export interface ErrorResponse {
  success: false;
  error: { code: ErrorCodeType; message: string; details?: unknown };
}

export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export function createErrorResponse(err: AppError): ErrorResponse {
  return {
    success: false,
    error: { code: err.code, message: err.message, details: err.details },
  };
}
