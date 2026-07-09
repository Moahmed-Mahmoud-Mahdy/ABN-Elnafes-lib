import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import ProductsAdminClient from "@/components/admin/products-admin-client";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const [products, categories] = await Promise.all([
    db.product.findMany({
      include: { category: true, images: { take: 1, orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return <ProductsAdminClient products={products} categories={categories} />;
}
