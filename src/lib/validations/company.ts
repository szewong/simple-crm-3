import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  domain: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  size: z
    .enum(["1-10", "11-50", "51-200", "201-500", "500+"])
    .optional()
    .or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
