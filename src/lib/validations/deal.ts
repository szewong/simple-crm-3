import { z } from "zod";

export const dealSchema = z.object({
  title: z.string().min(1, "Deal title is required"),
  value: z.coerce.number().min(0, "Value must be positive").optional(),
  stage_id: z.string().uuid("Stage is required"),
  contact_id: z.string().uuid().optional().or(z.literal("")),
  company_id: z.string().uuid().optional().or(z.literal("")),
  probability: z.coerce
    .number()
    .min(0, "Must be 0-100")
    .max(100, "Must be 0-100")
    .optional(),
  expected_close_date: z.string().optional().or(z.literal("")),
  close_reason: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
});

export type DealFormValues = z.infer<typeof dealSchema>;
