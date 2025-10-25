import { z } from "zod";

export const credentialSchema = z.object({
  email: z.string().email({ message: "Valid email is required" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" })
});

export const registerSchema = credentialSchema.extend({
  name: z.string().min(2, { message: "Name must be at least 2 characters" })
});

export const userCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "MANAGER", "USER"])
});

export const userUpdateSchema = userCreateSchema.partial({
  password: true
});

export const profileUpdateSchema = z
  .object({
    name: z.string().min(2).optional(),
    password: z.string().min(8).optional(),
    image: z.string().url().optional()
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided"
  });

export const contentSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  content: z.string().min(10),
  excerpt: z.string().optional(),
  image: z
    .union([z.string().url(), z.string().startsWith("/"), z.string().startsWith("data:")])
    .optional(),
  published: z.boolean().optional(),
  publishDate: z.coerce.date().nullable().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional()
});

export const settingsSchema = z.object({
  key: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.record(z.any())])
});

export const notificationSchema = z.object({
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.string()
});

export const contactFormSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(3),
  message: z.string().min(10)
});
