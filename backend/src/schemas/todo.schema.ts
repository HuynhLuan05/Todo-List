import { z } from 'zod';

// Schema for creating a new todo
export const createTodoSchema = z.object({
  title: z
    .string({
      required_error: 'Tiêu đề công việc là bắt buộc',
    })
    .trim()
    .min(1, 'Tiêu đề không được để trống')
    .max(100, 'Tiêu đề không được vượt quá 100 ký tự'),
  description: z
    .string()
    .trim()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .optional()
    .nullable(),
  dueDate: z
    .string()
    .datetime({ message: 'Định dạng ngày hết hạn không hợp lệ (phải là ISO 8601)' })
    .optional()
    .nullable()
    .or(z.date().optional().nullable()),
});

// Schema for updating an existing todo
export const updateTodoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Tiêu đề không được để trống')
    .max(100, 'Tiêu đề không được vượt quá 100 ký tự')
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Mô tả không được vượt quá 500 ký tự')
    .optional()
    .nullable(),
  status: z.enum(['pending', 'completed'], {
    errorMap: () => ({ message: 'Trạng thái chỉ có thể là pending hoặc completed' }),
  }).optional(),
  dueDate: z
    .string()
    .datetime({ message: 'Định dạng ngày hết hạn không hợp lệ (phải là ISO 8601)' })
    .optional()
    .nullable()
    .or(z.date().optional().nullable()),
});

// Schema for parsing query parameters (search, filter, pagination, sorting)
export const queryTodoSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['pending', 'completed']).optional(),
  sortBy: z.enum(['createdAt', 'title', 'dueDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => {
      const parsed = parseInt(val, 10);
      return isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => {
      const parsed = parseInt(val, 10);
      if (isNaN(parsed) || parsed < 1) return 10;
      return Math.min(parsed, 100); // cap at 100 to prevent oversized queries
    }),
});

export type CreateTodoInput = z.infer<typeof createTodoSchema>;
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>;
export type QueryTodoInput = z.infer<typeof queryTodoSchema>;
