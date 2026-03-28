import { z } from 'zod';

// Schema validation cho Book
export const BookSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề quá dài'),
  author: z.string().min(1, 'Tác giả không được để trống').max(100, 'Tên tác giả quá dài'),
  isbn: z.string()
    .min(10, 'ISBN phải có ít nhất 10 ký tự')
    .max(20, 'ISBN không được quá 20 ký tự')
    .refine(value => {
      const stripped = value.replace(/-/g, '');
      return /^\d+$/.test(stripped) && (stripped.length === 10 || stripped.length === 13);
    }, {
      message: 'ISBN phải là 10 hoặc 13 chữ số, có thể bao gồm dấu gạch ngang (-)'
    }),
  category: z.string().optional(),
  publishedYear: z.number().int().min(1000).max(new Date().getFullYear()).optional(),
  totalQuantity: z.number().int().min(1).default(1),
  availableQuantity: z.number().int().min(0).default(1),
  regionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Region ID không hợp lệ'), // MongoDB ObjectId format
});

// Schema cho query params trong GET
export const BookQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  year: z.string().optional(),
  regionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Region ID không hợp lệ').optional(),
  page: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
  limit: z.string().regex(/^\d+$/).transform(val => parseInt(val)).optional(),
});

// Schema validation cho Login
export const LoginSchema = z.object({
  username: z.string().min(1, 'Tên đăng nhập không được để trống').max(50, 'Tên đăng nhập quá dài'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});