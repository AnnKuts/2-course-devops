import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: 'title is required' })
    .trim()
    .min(1, 'title must not be empty')
    .max(255, 'title must not exceed 255 characters'),
});

export const taskIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'id must be a positive integer')
    .transform(Number)
    .refine((n) => n > 0, 'id must be greater than 0'),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type TaskIdInput = z.infer<typeof taskIdSchema>;
