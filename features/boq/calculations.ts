import type { Boq, BoqItem } from "@/features/boq/types";

export function calculateBoqItemTotal(item: Pick<BoqItem, "quantity" | "unitRate">) {
  return roundMoney(item.quantity * item.unitRate);
}

export function calculateBoqSubtotal(boq: Pick<Boq, "categories" | "ungroupedItems">) {
  const grouped = boq.categories.flatMap((category) => category.items);
  return roundMoney([...grouped, ...boq.ungroupedItems].reduce((sum, item) => sum + item.total, 0));
}

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getVatAmount(subtotal: number, vatRate: number) {
  return roundMoney(subtotal * vatRate);
}

export function getDocumentTotal(subtotal: number, vatRate: number, discountAmount = 0) {
  return roundMoney(subtotal - discountAmount + getVatAmount(subtotal - discountAmount, vatRate));
}
