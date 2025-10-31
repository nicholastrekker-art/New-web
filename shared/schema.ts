import { z } from "zod";

export const tabSchema = z.object({
  id: z.string(),
  url: z.string(),
  title: z.string(),
  isLoading: z.boolean(),
  favicon: z.string().optional(),
});

export type Tab = z.infer<typeof tabSchema>;
