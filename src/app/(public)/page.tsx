import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import ProductCard from "@/components/public/product-card";
import {
  BookOpen,
  Pencil,
  Briefcase,
  PenTool,
  Notebook,
  Ruler,
  Palette,
  Backpack,
  Puzzle,
  Gift,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  HeartHandshake,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ICON_MAP: Record<string, React.ElementType> = {
  BookOpen,
  Pencil,
  Briefcase,
  PenTool,
  Notebook,
  Ruler,
  Palette,
  Backpack,
  Puzzle,
  Gift,
};

export default async function HomePage() {
  const [featuredProducts, latestProducts, categories, offers, settings] = await Promise.all([
    db.product.findMany({
      where: { featured: true, active: true },
      include: { images: { orderBy: { position: "asc" } }, category: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    db.product.findMany({
      where: { active: true },
      include: { images: { orderBy: { position: "asc" } }, category: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    db.category.findMany({
      include: { _count: { select: { products: { where: { active: true } } } } },
      orderBy: { name: "asc" },
    }),
    db.offer.findMany({
      where: {
        active: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
    }),
    getSettings(),
  ]);

  const whyChoose = [
    { icon: TrendingUp, title: settings.whyChoose1Title, text: settings.whyChoose1Text },
    { icon: ShieldCheck, title: settings.whyChoose2Title, text: settings.whyChoose2Text },
    { icon: Sparkles, title: settings.whyChoose3Title, text: settings.whyChoose3Text },
    { icon: HeartHandshake, title: settings.whyChoose4Title, text: settings.whyChoose4Text },
  ];

  return (
    <div>
      {/* Hero Section - Centered */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-background to-secondary pattern-bg">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Badge className="bg-accent text-accent-foreground hover:bg-accent text-sm py-1.5 px-4">
              كاتالوج منتجات مكتبة ابن النفيس
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-foreground text-balance" style={{ fontFamily: "var(--font-amiri), serif" }}>
              {settings.heroTitle}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {settings.heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <Button asChild size="lg" className="text-base h-12 px-8">
                <Link href="/products">
                  تصفح المنتجات
                  <ArrowLeft className="h-5 w-5 mr-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base h-12 px-8">
                <Link href="/offers">العروض الحالية</Link>
              </Button>
            </div>

            {/* Stats - centered */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 pt-8">
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{categories.length}</p>
                <p className="text-sm text-muted-foreground mt-1">قسم متنوع</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">+{latestProducts.length * 4}</p>
                <p className="text-sm text-muted-foreground mt-1">منتج متوفر</p>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{offers.length}</p>
                <p className="text-sm text-muted-foreground mt-1">عرض حالي</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-amiri), serif" }}>
              تسوّق حسب القسم
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              تصفح أقسامنا المتنوعة واعثر على ما تحتاجه بسهولة
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map((cat) => {
              const Icon = ICON_MAP[cat.icon || ""] || BookOpen;
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group bg-card border border-border/60 rounded-xl p-5 text-center hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="h-14 w-14 mx-auto rounded-full bg-secondary group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center mb-3 transition-colors">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{cat._count.products} منتج</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-amiri), serif" }}>
                  منتجات مميزة
                </h2>
                <p className="text-muted-foreground">تشكيلة مختارة من أفضل منتجاتنا</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/products">عرض الكل</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Offers Banner */}
      {offers.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <Badge className="bg-accent text-accent-foreground hover:bg-accent mb-3">عروض حصرية</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-amiri), serif" }}>
                العروض الحالية
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                عروض محدودة لفترة قصيرة - لا تفوت الفرصة
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="relative rounded-2xl overflow-hidden shadow-lg group bg-card border border-border/60"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {offer.image && (
                      <Image
                        src={offer.image}
                        alt={offer.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
                      {offer.discount && (
                        <Badge className="bg-accent text-accent-foreground hover:bg-accent mb-2">
                          {offer.discount}
                        </Badge>
                      )}
                      <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-amiri), serif" }}>
                        {offer.title}
                      </h3>
                      <p className="text-sm opacity-90 line-clamp-2">{offer.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button asChild size="lg" variant="outline">
                <Link href="/offers">عرض جميع العروض</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Latest Products */}
      {latestProducts.length > 0 && (
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-amiri), serif" }}>
                  أحدث المنتجات
                </h2>
                <p className="text-muted-foreground">وصل حديثاً إلى مكتبتنا</p>
              </div>
              <Button asChild variant="outline">
                <Link href="/products">عرض الكل</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {latestProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ fontFamily: "var(--font-amiri), serif" }}>
              لماذا تختار {settings.libraryName}؟
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              نحرص على تقديم أفضل تجربة لعملائنا
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChoose.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="bg-card border border-border/60 rounded-xl p-6 text-center hover:shadow-md transition-shadow"
                >
                  <div className="h-16 w-16 mx-auto rounded-full bg-accent/20 text-accent-foreground flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-amiri), serif" }}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>
                {settings.aboutTitle}
              </h2>
              <p className="opacity-90 leading-relaxed text-lg">{settings.aboutText}</p>
              <Button asChild size="lg" variant="secondary">
                <Link href="/about">اقرأ المزيد عنا</Link>
              </Button>
            </div>
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900"
                alt="عن المكتبة"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-accent/15">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-amiri), serif" }}>
            محتاج مساعدة في اختيار منتج؟
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            فريقنا جاهز لمساعدتك. تواصل معنا عبر الهاتف أو واتساب
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="h-12 px-6">
              <a href={`tel:${settings.phone}`}>
                <Phone className="h-5 w-5 ml-2" />
                اتصل بنا
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 bg-green-600 hover:bg-green-700 text-white hover:text-white border-green-600">
              <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5 ml-2" />
                واتساب
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
