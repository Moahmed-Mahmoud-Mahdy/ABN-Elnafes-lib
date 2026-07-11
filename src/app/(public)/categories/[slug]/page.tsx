import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import ProductCard from "@/components/public/product-card";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const category = await db.category.findUnique({
    where: { slug },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });

  if (!category) notFound();

  const products = await db.product.findMany({
    where: { category: { slug }, active: true },
    include: {
      images: { orderBy: { position: "asc" } },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronLeft className="h-4 w-4" />
        <Link href="/categories" className="hover:text-primary transition-colors">الأقسام</Link>
        <ChevronLeft className="h-4 w-4" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-8 bg-card border border-border/60 rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-amiri), serif" }}>
          {category.name}
        </h1>
        {category.description && (
          <p className="text-muted-foreground">{category.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-2">{category._count.products} منتج متاح</p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">لا توجد منتجات في هذا القسم حالياً</p>
          <Link
            href="/products"
            className="inline-block mt-4 text-primary hover:underline"
          >
            تصفح جميع المنتجات
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
