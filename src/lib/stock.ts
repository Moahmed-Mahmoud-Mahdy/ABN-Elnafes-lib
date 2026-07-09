import { db } from "@/lib/db";

export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export function getStockStatus(stock: number, minStock: number): StockStatus {
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= minStock) return "LOW_STOCK";
  return "IN_STOCK";
}

export function getStockStatusLabel(status: StockStatus): string {
  switch (status) {
    case "IN_STOCK":
      return "متوفر";
    case "LOW_STOCK":
      return "مخزون منخفض";
    case "OUT_OF_STOCK":
      return "غير متوفر";
  }
}

export async function addStock(
  productId: string,
  quantity: number,
  reason: string,
  userName: string
) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");

  const updated = await db.product.update({
    where: { id: productId },
    data: { stock: { increment: quantity } },
  });

  await db.stockMovement.create({
    data: {
      productId,
      type: "ADD",
      quantity,
      reason,
      userName,
    },
  });

  return updated;
}

export async function removeStock(
  productId: string,
  quantity: number,
  reason: string,
  userName: string
) {
  const product = await db.product.findUnique({ where: { id: productId } });
  if (!product) throw new Error("Product not found");
  if (product.stock < quantity) {
    throw new Error("الكمية المطلوبة أكبر من المخزون الحالي");
  }

  const updated = await db.product.update({
    where: { id: productId },
    data: { stock: { decrement: quantity } },
  });

  await db.stockMovement.create({
    data: {
      productId,
      type: "REMOVE",
      quantity,
      reason,
      userName,
    },
  });

  return updated;
}
