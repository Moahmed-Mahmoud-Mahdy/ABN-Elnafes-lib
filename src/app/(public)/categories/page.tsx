import Link from "next/link";
import { db } from "@/lib/db";
import {
  BookOpen, Pencil, Briefcase, PenTool, Notebook, Ruler,
  Palette, Backpack, Puzzle, Gift, ArrowLeft,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen, Pencil, Briefcase, PenTool, Notebook, Ruler,
  Palette, Backpack, Puzzle, Gift,
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    include: { _count: { select: { products: { where: { active: true } } } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-amiri), serif" }}>
          أقسام المكتبة
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          تصفح منتجاتنا حسب القسم - كل قسم يحتوي على تشكيلة متنوعة من المنتجات عالية الجودة
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.icon || ""] || BookOpen;
          return (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group bg-card border border-border/60 rounded-xl p-6 hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-xl bg-secondary group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center shrink-0 transition-colors">
                  <Icon className="h-8 w-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-bold mb-1 group-hover:text-primary transition-colors" style={{ fontFamily: "var(--font-amiri), serif" }}>
                    {cat.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-2">
                    {cat._count.products} منتج متاح
                  </p>
                  {cat.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{cat.description}</p>
                  )}
                </div>
                <ArrowLeft className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:-translate-x-1 transition-all shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
