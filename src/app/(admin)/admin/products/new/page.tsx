import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import ProductForm from "@/components/admin/product-form";

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const categories = await db.category.findMany({ orderBy: { name: "asc" } });

  if (categories.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground mb-4">يجب إضافة قسم أولاً قبل إضافة المنتجات</p>
        <a href="/admin/categories" className="text-primary hover:underline">إدارة الأقسام ←</a>
      </div>
    );
  }

  return <ProductForm categories={categories} />;
}
