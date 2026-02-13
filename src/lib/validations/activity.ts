import { z } from "zod";

export const activitySchema = z.object({
  type: z.enum(["call", "email", "meeting", "task", "note"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().or(z.literal("")),
  contact_id: z.string().uuid().optional().or(z.literal("")),
  company_id: z.string().uuid().optional().or(z.literal("")),
  deal_id: z.string().uuid().optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
  is_completed: z.boolean(),
});

export type ActivityFormValues = z.infer<typeof activitySchema>;
