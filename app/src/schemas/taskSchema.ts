import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string({ required_error: "title is required" })
    .trim()
    .min(1, "title must not be empty")
    .max(255, "title must not exceed 255 characters"),
});

export const taskIdSchema = z.object({
  id: z.coerce.number().int("id must be an integer").positive("id must be a positive integer"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type TaskIdInput = z.infer<typeof taskIdSchema>;
