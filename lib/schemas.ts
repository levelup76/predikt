import { z } from "zod";

// Helper for slug generation
export const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -

// Step 1: Basic Details
export const eventDetailsSchema = z.object({
  title: z.string().min(3, "A cím legyen legalább 3 karakter"),
  description: z.string().min(10, "A leírás túl rövid"),
  category: z.enum(["sport", "politics", "awards", "other"]),
  lock_at: z.string().refine((date) => new Date(date) > new Date(), {
    message: "A lezárásnak a jövőben kell lennie",
  }),
  source_url: z.string().url("Érvényes URL szükséges").optional().or(z.literal("")),
});

// Step 2: Design
export const eventDesignSchema = z.object({
  theme: z.enum(["modern", "elegant", "retro", "neon"]),
  // cover_image is handled separately via upload, we just store the path here if needed, 
  // but for the form we might just validate presence optionally
});

// Step 3: Markets
export const optionSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Opció nem lehet üres"),
});

export const marketSchema = z.object({
  id: z.string().optional(), // For editing existing
  question: z.string().min(5, "A kérdés túl rövid"),
  type: z.enum(["select", "boolean", "range", "score", "ranking"]), // Added 'score', 'ranking'
  options: z.array(optionSchema).min(1, "Legalább 1 mező kötelező"), // Changed min 2 to 1 (score might have 1 input like "Total goals")
});

export const eventMarketsSchema = z.object({
  markets: z.array(marketSchema).min(1, "Legalább 1 kérdés kötelező"),
});

// Combined for final submission if needed
export const createEventSchema = z.object({
  details: eventDetailsSchema,
  design: eventDesignSchema,
  markets: eventMarketsSchema, // In the wizard we might save incrementally, providing partial validation
});

export type EventDetailsForm = z.infer<typeof eventDetailsSchema>;
export type EventDesignForm = z.infer<typeof eventDesignSchema>;
export type MarketForm = z.infer<typeof marketSchema>;
export type EventMarketsForm = z.infer<typeof eventMarketsSchema>;
