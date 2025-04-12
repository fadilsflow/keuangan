import { logger } from "./logger";

export interface ErrorResponse {
  message: string;
  code?: string;
  status?: number;
}

export class AppError extends Error {
  public code: string;
  public status: number;

  constructor(message: string, code = "INTERNAL_ERROR", status = 500) {
    super(message);
    this.code = code;
    this.status = status;
    this.name = "AppError";
  }
}

export function handleError(error: unknown): ErrorResponse {
  // Already handled errors
  if (error instanceof AppError) {
    logger.warn(error.message, { code: error.code, status: error.status });
    return {
      message: error.message,
      code: error.code,
      status: error.status,
    };
  }

  // Prisma errors
  if (error instanceof Error && error.name === "PrismaClientKnownRequestError") {
    const response = handlePrismaError(error);
    logger.error("Database error occurred", error, response);
    return response;
  }

  // Generic errors
  const finalError = error instanceof Error ? error : new Error(String(error));
  logger.error("Unhandled error occurred", finalError);
  
  return {
    message: finalError.message,
    code: "INTERNAL_ERROR",
    status: 500,
  };
}

function handlePrismaError(error: Error & { code?: string }): ErrorResponse {
  switch (error.code) {
    case "P2002":
      return {
        message: "A record with this value already exists.",
        code: "DUPLICATE_ENTRY",
        status: 409,
      };
    case "P2025":
      return {
        message: "Record not found.",
        code: "NOT_FOUND",
        status: 404,
      };
    default:
      return {
        message: "Database error occurred.",
        code: "DATABASE_ERROR",
        status: 500,
      };
  }
} 