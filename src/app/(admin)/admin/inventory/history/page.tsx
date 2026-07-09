import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import StockHistoryClient from "@/components/admin/stock-history-client";

export default async function StockHistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const movements = await db.stockMovement.findMany({
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const serialized = movements.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return <StockHistoryClient movements={serialized} />;
}
