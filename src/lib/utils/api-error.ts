import { NextResponse } from "next/server";
import { ZodError } from "zod";

export interface ApiErrorBody {
  error: string;
  code: string;
  message: string;
  details?: unknown;
}

export function apiError(
  message: string,
  code: string,
  status: number,
  details?: unknown
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    {
      error: code,
      code,
      message,
      ...(details !== undefined && { details }),
    },
    { status }
  );
}

export const ApiErrors = {
  unauthorized: () =>
    apiError("Authentication required", "UNAUTHORIZED", 401),

  forbidden: () =>
    apiError("Access denied", "FORBIDDEN", 403),

  notFound: (resource = "Resource") =>
    apiError(`${resource} not found`, "NOT_FOUND", 404),

  badRequest: (message: string, details?: unknown) =>
    apiError(message, "BAD_REQUEST", 400, details),

  validationError: (error: ZodError) =>
    apiError(
      "Validation failed",
      "VALIDATION_ERROR",
      422,
      error.flatten().fieldErrors
    ),

  internal: (message = "Internal server error") =>
    apiError(message, "INTERNAL_ERROR", 500),

  conflict: (message: string) =>
    apiError(message, "CONFLICT", 409),
};

// Wrap async route handlers with error catching
export function withErrorHandler(
  handler: (req: Request, ctx?: unknown) => Promise<NextResponse>
) {
  return async (req: Request, ctx?: unknown): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      if (error instanceof ZodError) {
        return ApiErrors.validationError(error);
      }
      console.error("[API Error]", error);
      return ApiErrors.internal();
    }
  };
}
