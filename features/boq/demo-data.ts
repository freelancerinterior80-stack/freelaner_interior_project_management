import { calculateBoqSubtotal } from "@/features/boq/calculations";
import type { Boq, BoqSummary } from "@/features/boq/types";

const demoBoqBase: Omit<Boq, "subtotal"> = {
  id: "demo-boq-villa",
  name: "Villa Fit-out BOQ",
  projectId: "demo-villa-fit-out",
  projectName: "Villa Fit-out",
  clientName: "Ahmed Al Saud",
  isTemplate: false,
  notes: "Prepared for ceiling, flooring, and paint works.",
  categories: [
    {
      id: "cat-ceiling",
      name: "Ceiling works",
      sortOrder: 1,
      items: [
        {
          id: "item-gypsum",
          categoryId: "cat-ceiling",
          description: "Gypsum board ceiling with framing",
          quantity: 120,
          unit: "m2",
          unitRate: 95,
          total: 11400,
          notes: "Includes standard access panels.",
          sortOrder: 1
        },
        {
          id: "item-paint-ceiling",
          categoryId: "cat-ceiling",
          description: "Ceiling paint finish",
          quantity: 120,
          unit: "m2",
          unitRate: 18,
          total: 2160,
          notes: null,
          sortOrder: 2
        }
      ]
    },
    {
      id: "cat-flooring",
      name: "Flooring",
      sortOrder: 2,
      items: [
        {
          id: "item-tiles",
          categoryId: "cat-flooring",
          description: "Porcelain floor tiles supply and install",
          quantity: 85,
          unit: "m2",
          unitRate: 145,
          total: 12325,
          notes: null,
          sortOrder: 1
        },
        {
          id: "item-skirting",
          categoryId: "cat-flooring",
          description: "Skirting installation",
          quantity: 90,
          unit: "mtr",
          unitRate: 28,
          total: 2520,
          notes: null,
          sortOrder: 2
        }
      ]
    }
  ],
  ungroupedItems: [
    {
      id: "item-mobilization",
      categoryId: null,
      description: "Mobilization and site preparation",
      quantity: 1,
      unit: "ls",
      unitRate: 3500,
      total: 3500,
      notes: null,
      sortOrder: 99
    }
  ]
};

export const demoBoqs: Boq[] = [
  {
    ...demoBoqBase,
    subtotal: calculateBoqSubtotal(demoBoqBase)
  },
  {
    id: "demo-boq-office-template",
    name: "Small Office Interior Template",
    projectId: null,
    projectName: null,
    clientName: null,
    isTemplate: true,
    notes: "Reusable starter BOQ for office interiors.",
    subtotal: 0,
    categories: [
      {
        id: "cat-template-design",
        name: "Design and supervision",
        sortOrder: 1,
        items: [
          {
            id: "item-template-design",
            categoryId: "cat-template-design",
            description: "Interior design concept and drawings",
            quantity: 1,
            unit: "ls",
            unitRate: 0,
            total: 0,
            notes: null,
            sortOrder: 1
          }
        ]
      }
    ],
    ungroupedItems: []
  }
];

export function getDemoBoqSummaries(): BoqSummary[] {
  return demoBoqs.map((boq) => ({
    id: boq.id,
    name: boq.name,
    projectId: boq.projectId,
    projectName: boq.projectName,
    clientName: boq.clientName,
    isTemplate: boq.isTemplate,
    subtotal: boq.subtotal,
    itemCount:
      boq.categories.reduce((sum, category) => sum + category.items.length, 0) +
      boq.ungroupedItems.length
  }));
}
