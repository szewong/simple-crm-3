import { z } from "zod";

export const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  company_id: z.string().uuid().optional().or(z.literal("")),
  position: z.string().optional().or(z.literal("")),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  social_links: z
    .object({
      linkedin: z.string().optional(),
      twitter: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "archived"]).default("active"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
