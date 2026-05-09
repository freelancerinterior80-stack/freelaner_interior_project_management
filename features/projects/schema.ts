import { z } from "zod";

export const projectFormSchema = z.object({
  name: z.string().min(2, "Project name is required."),
  clientName: z.string().min(2, "Client name is required."),
  clientPhone: z.string().optional(),
  siteLocation: z.string().optional(),
  type: z.enum([
    "construction",
    "interior_design",
    "fit_out",
    "furniture",
    "renovation",
    "contracting",
    "other"
  ]),
  status: z.enum(["lead", "active", "on_hold", "completed", "cancelled"]),
  budget: z.number().min(0, "Budget cannot be negative."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  notes: z.string().optional()
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
