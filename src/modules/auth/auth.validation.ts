import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email format").max(255, "Email is too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").max(255, "Email is too long"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
