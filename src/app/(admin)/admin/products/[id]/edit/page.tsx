import { redirect, notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import ProductForm from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });

  if (!product) notFound();

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  return (
    <ProductForm
      categories={categories}
      initial={{
        id: product.id,
        name: product.name,
        description: product.description ?? "",
        price: product.price?.toString() ?? "",
        categoryId: product.categoryId,
        stock: product.stock.toString(),
        minStock: product.minStock.toString(),
        featured: product.featured,
        showInOffers: product.showInOffers,
        active: product.active,
        images: product.images.map((img) => img.url),
      }}
    />
  );
}
