import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { getStockStatus, getStockStatusLabel } from "@/lib/stock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/public/product-card";
import ProductGallery from "@/components/public/product-gallery";
import { Phone, MessageCircle, ChevronLeft, Package } from "lucide-react";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: rawId } = await params;
  const id = decodeURIComponent(rawId);
  const product = await db.product.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      active: true,
    },
    include: {
      category: true,
      images: { orderBy: { position: "asc" } },
    },
  });

  if (!product) {
    notFound();
  }

  const [similar, settings] = await Promise.all([
    db.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        active: true,
      },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        category: true,
      },
      take: 4,
    }),
    getSettings(),
  ]);

  const status = getStockStatus(product.stock, product.minStock);
  const whatsappUrl = `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `مرحباً، أريد الاستفسار عن: ${product.name}`
  )}`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronLeft className="h-4 w-4" />
        <Link href="/products" className="hover:text-primary transition-colors">المنتجات</Link>
        <ChevronLeft className="h-4 w-4" />
        <Link href={`/categories/${product.category.slug}`} className="hover:text-primary transition-colors">
          {product.category.name}
        </Link>
        <ChevronLeft className="h-4 w-4" />
        <span className="text-foreground truncate">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-12">
        {/* Gallery */}
        <ProductGallery images={product.images.map((img) => img.url)} name={product.name} />

        {/* Details */}
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{product.category.name}</Badge>
              {product.featured && (
                <Badge className="bg-accent text-accent-foreground hover:bg-accent">منتج مميز</Badge>
              )}
              <Badge
                variant={status === "IN_STOCK" ? "default" : status === "LOW_STOCK" ? "secondary" : "destructive"}
                className={
                  status === "IN_STOCK"
                    ? "bg-green-700 hover:bg-green-700 text-white"
                    : status === "LOW_STOCK"
                    ? "bg-amber-500 hover:bg-amber-500 text-white"
                    : ""
                }
              >
                {getStockStatusLabel(status)}
              </Badge>
            </div>

            <h1 className="text-3xl font-bold leading-tight" style={{ fontFamily: "var(--font-amiri), serif" }}>
              {product.name}
            </h1>

            <div className="text-3xl font-bold text-primary">{formatPrice(product.price)}</div>
          </div>

          <Separator />

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h2 className="font-bold text-lg">الوصف</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          <Separator />

          {/* Stock info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-secondary/40 rounded-lg p-3">
              <p className="text-muted-foreground mb-1">القسم</p>
              <Link href={`/categories/${product.category.slug}`} className="font-medium hover:text-primary">
                {product.category.name}
              </Link>
            </div>
            <div className="bg-secondary/40 rounded-lg p-3">
              <p className="text-muted-foreground mb-1">حالة التوفر</p>
              <p className="font-medium">{getStockStatusLabel(status)}</p>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground">
              هذا الموقع لعرض المنتجات فقط. للشراء، تواصل معنا أو زور فرعنا.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="h-12 flex-1">
                <a href={`tel:${settings.phone}`}>
                  <Phone className="h-5 w-5 ml-2" />
                  اتصل بالمكتبة
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 flex-1 bg-green-600 hover:bg-green-700 text-white hover:text-white border-green-600"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="h-5 w-5 ml-2" />
                  واتساب
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Similar products */}
      {similar.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "var(--font-amiri), serif" }}>
            منتجات مشابهة
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {similar.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
