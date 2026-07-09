import { db } from "@/lib/db";
import ProductsClient from "@/components/public/products-client";

export default async function ProductsPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return <ProductsClient categories={categories} />;
}
