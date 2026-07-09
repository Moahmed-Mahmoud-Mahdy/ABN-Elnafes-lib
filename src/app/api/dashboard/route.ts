import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { getStockStatus } from "@/lib/stock";

// GET /api/dashboard - admin stats
export async function GET(req: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") ?? "30");

  const [
    totalProducts,
    totalCategories,
    totalStock,
    lowStockProducts,
    outOfStockProducts,
    latestProducts,
    allProducts,
  ] = await Promise.all([
    db.product.count(),
    db.category.count(),
    db.product.aggregate({ _sum: { stock: true } }),
    db.product.findMany({
      where: { stock: { lte: 0 } },
      include: { images: { take: 1, orderBy: { position: "asc" } } },
      take: 10,
    }),
    db.product.findMany({
      where: { stock: { lte: 0 } },
      include: { images: { take: 1, orderBy: { position: "asc" } } },
      take: 10,
    }),
    db.product.findMany({
      include: { images: { take: 1, orderBy: { position: "asc" } }, category: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.product.findMany({ select: { id: true, name: true, stock: true, minStock: true } }),
  ]);

  // Get low stock items
  const lowStock = allProducts.filter(
    (p) => p.stock > 0 && p.stock <= p.minStock
  );

  // Stock movements in last N days for chart
  const since = new Date();
  since.setDate(since.getDate() - days);

  const movements = await db.stockMovement.findMany({
    where: { createdAt: { gte: since } },
    select: { type: true, quantity: true, createdAt: true },
  });

  // Group by day
  const chartData: Record<string, { date: string; add: number; remove: number; net: number }> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    chartData[key] = { date: key, add: 0, remove: 0, net: 0 };
  }

  for (const m of movements) {
    const key = m.createdAt.toISOString().slice(0, 10);
    if (chartData[key]) {
      if (m.type === "ADD") {
        chartData[key].add += m.quantity;
        chartData[key].net += m.quantity;
      } else {
        chartData[key].remove += m.quantity;
        chartData[key].net -= m.quantity;
      }
    }
  }

  // Category distribution
  const categoryStats = await db.category.findMany({
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json({
    stats: {
      totalProducts,
      totalCategories,
      totalStock: totalStock._sum.stock ?? 0,
      lowStockCount: lowStock.length,
      outOfStockCount: outOfStockProducts.length,
    },
    lowStockProducts: lowStock.slice(0, 10).map((p) => ({
      ...p,
      status: getStockStatus(p.stock, p.minStock),
    })),
    outOfStockProducts,
    latestProducts,
    chartData: Object.values(chartData).map((d) => ({
      ...d,
      dateLabel: new Date(d.date).toLocaleDateString("ar-EG", {
        month: "short",
        day: "numeric",
      }),
    })),
    categoryStats: categoryStats.map((c) => ({
      name: c.name,
      count: c._count.products,
    })),
  });
}
