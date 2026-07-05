import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Global error handling middleware for Express
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error for internal tracking
  console.error('[Error Handler]:', err);

  // Handle validation errors from Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ (Validation Error)',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Handle other custom errors (e.g. invalid UUID format or database errors)
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Không tìm thấy tài nguyên yêu cầu (Record not found)',
    });
  }

  // Default internal server error
  const isDev = process.env.NODE_ENV === 'development';
  return res.status(500).json({
    success: false,
    message: 'Lỗi hệ thống nội bộ (Internal Server Error)',
    error: isDev ? err.message : undefined,
  });
};
