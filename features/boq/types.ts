import type { Project } from "@/features/projects/types";

export type BoqUnit = "m2" | "ls" | "mtr" | "ps" | "units";

export type BoqItem = {
  id: string;
  categoryId: string | null;
  description: string;
  quantity: number;
  unit: BoqUnit;
  unitRate: number;
  total: number;
  notes?: string | null;
  sortOrder: number;
};

export type BoqCategory = {
  id: string;
  name: string;
  sortOrder: number;
  items: BoqItem[];
};

export type Boq = {
  id: string;
  name: string;
  projectId?: string | null;
  projectName?: string | null;
  clientName?: string | null;
  isTemplate: boolean;
  subtotal: number;
  notes?: string | null;
  categories: BoqCategory[];
  ungroupedItems: BoqItem[];
};

export type BoqSummary = Pick<
  Boq,
  "id" | "name" | "projectId" | "projectName" | "clientName" | "isTemplate" | "subtotal"
> & {
  itemCount: number;
};

export type ProjectOption = Pick<Project, "id" | "name" | "clientName">;
