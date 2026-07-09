import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import CategoriesAdminClient from "@/components/admin/categories-admin-client";

export default async function AdminCategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const categories = await db.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });

  return <CategoriesAdminClient categories={categories} />;
}
