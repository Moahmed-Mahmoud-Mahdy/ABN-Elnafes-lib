import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import InventoryAdminClient from "@/components/admin/inventory-admin-client";

export default async function AdminInventoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const products = await db.product.findMany({
    include: { category: true, images: { take: 1, orderBy: { position: "asc" } } },
    orderBy: { name: "asc" },
  });

  return <InventoryAdminClient products={products} userName={session.user?.name ?? "أدمن"} />;
}
