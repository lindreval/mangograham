import { z } from "zod";

// Simple text sanitization without DOMPurify to avoid build issues
// Strips HTML tags and dangerous content for XSS prevention
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers
    .trim();
}

// Sanitize text but allow basic formatting (same as sanitizeText for now)
export function sanitizeRichText(text: string): string {
  // For now, use the same sanitization as sanitizeText
  // Can be enhanced later to preserve safe tags if needed
  return sanitizeText(text);
}

// Pagination validation with bounds
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Contributions API validation
export const contributionsQuerySchema = paginationSchema.extend({
  type: z.enum(["phrases", "definitions", "examples"]).default("phrases"),
  sortBy: z.enum(["recent", "upvotes", "oldest"]).default("recent"),
  userId: z.string().optional(),
});

// Feedback API validation
export const feedbackSchema = z.object({
  type: z.enum(["bug", "feature", "content", "other"]),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject too long"),
  message: z.string().min(10, "Message must be at least 10 characters").max(5000, "Message too long"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
});

// Profile update validation
export const profileUpdateSchema = z.object({
  name: z.string().max(100, "Name too long").optional().nullable(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
    .optional()
    .nullable(),
  bio: z.string().max(500, "Bio too long").optional().nullable(),
  location: z.string().max(100, "Location too long").optional().nullable(),
  languagesSpoken: z.array(z.string()).max(20, "Too many languages").optional(),
});

// Flag content validation
export const flagContentSchema = z.object({
  definitionId: z.number().int().positive().optional(),
  exampleId: z.number().int().positive().optional(),
  phraseId: z.number().int().positive().optional(),
  reason: z.string().max(500, "Reason too long").optional(),
}).refine(
  (data) => data.definitionId || data.exampleId || data.phraseId,
  { message: "At least one content ID is required" }
);

// Search query validation
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200, "Search query too long"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Phrases API validation
export const phrasesQuerySchema = paginationSchema.extend({
  languageId: z.coerce.number().int().positive().optional(),
});

// Helper function to validate search params
export function validateSearchParams<T extends z.ZodSchema>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return schema.parse(params);
}

// Helper to safely parse JSON body with Zod
export async function validateRequestBody<T extends z.ZodSchema>(
  request: Request,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; error: string }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => e.message).join(", ");
      return { success: false, error: errors };
    }
    return { success: true, data: result.data };
  } catch {
    return { success: false, error: "Invalid JSON body" };
  }
}
