import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { getStockStatus, getStockStatusLabel } from "@/lib/stock";
import { formatNumber, formatDateTime } from "@/lib/format";
import DashboardChart from "@/components/admin/dashboard-chart";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, FolderTree, Boxes, AlertTriangle, PackageX, TrendingUp, Tags } from "lucide-react";
import CategoryDistributionChart from "@/components/admin/category-chart";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const [
    totalProducts,
    totalCategories,
    totalStock,
    lowStockProducts,
    outOfStockProducts,
    latestProducts,
    allProductsForLow,
    movements,
    categoryStats,
  ] = await Promise.all([
    db.product.count(),
    db.category.count(),
    db.product.aggregate({ _sum: { stock: true } }),
    db.product.findMany({
      where: { stock: { gt: 0, lte: 5 } },
      include: { images: { take: 1, orderBy: { position: "asc" } } },
      take: 5,
      orderBy: { stock: "asc" },
    }),
    db.product.findMany({
      where: { stock: { lte: 0 } },
      include: { images: { take: 1, orderBy: { position: "asc" } } },
      take: 5,
    }),
    db.product.findMany({
      include: { images: { take: 1, orderBy: { position: "asc" } }, category: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.product.findMany({
      where: { stock: { gt: 0, lte: 5 } },
      select: { id: true },
    }),
    db.stockMovement.findMany({
      take: 30,
      orderBy: { createdAt: "desc" },
      include: { product: { select: { name: true } } },
    }),
    db.category.findMany({
      include: { _count: { select: { products: true } } },
    }),
  ]);

  // Build 30-day chart data
  const days = 30;
  const chartData: { date: string; dateLabel: string; add: number; remove: number; net: number }[] = [];
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));

  const movementsInRange = movements.filter((m) => m.createdAt >= since);
  const byDay: Record<string, { add: number; remove: number; net: number }> = {};
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    byDay[key] = { add: 0, remove: 0, net: 0 };
  }
  for (const m of movementsInRange) {
    const key = m.createdAt.toISOString().slice(0, 10);
    if (byDay[key]) {
      if (m.type === "ADD") {
        byDay[key].add += m.quantity;
        byDay[key].net += m.quantity;
      } else {
        byDay[key].remove += m.quantity;
        byDay[key].net -= m.quantity;
      }
    }
  }
  for (const [date, vals] of Object.entries(byDay)) {
    chartData.push({
      date,
      dateLabel: new Date(date).toLocaleDateString("ar-EG", { month: "short", day: "numeric" }),
      ...vals,
    });
  }

  const stats = [
    {
      label: "إجمالي المنتجات",
      value: totalProducts,
      icon: Package,
      color: "bg-primary/15 text-primary",
    },
    {
      label: "إجمالي الأقسام",
      value: totalCategories,
      icon: FolderTree,
      color: "bg-accent/20 text-accent-foreground",
    },
    {
      label: "إجمالي المخزون",
      value: formatNumber(totalStock._sum.stock ?? 0),
      icon: Boxes,
      color: "bg-green-100 text-green-700",
    },
    {
      label: "منتجات منخفضة المخزون",
      value: allProductsForLow.length,
      icon: AlertTriangle,
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "منتجات غير متوفرة",
      value: outOfStockProducts.length,
      icon: PackageX,
      color: "bg-red-100 text-red-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ fontFamily: "var(--font-amiri), serif" }}>
          مرحباً، {session.user?.name} 👋
        </h1>
        <p className="text-muted-foreground">نظرة عامة على أداء المكتبة</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className={`h-12 w-12 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-amiri), serif" }}>
              <TrendingUp className="h-5 w-5" />
              حركة المخزون - آخر 30 يوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart data={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ fontFamily: "var(--font-amiri), serif" }}>توزيع المنتجات على الأقسام</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryDistributionChart
              data={categoryStats.map((c) => ({ name: c.name, count: c._count.products }))}
            />
          </CardContent>
        </Card>
      </div>

      {/* Low stock & out of stock */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-amiri), serif" }}>
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                مخزون منخفض
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/inventory">عرض الكل</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">لا توجد منتجات منخفضة المخزون</p>
            ) : (
              lowStockProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}/edit`}
                  className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                    {p.images[0]?.url ? (
                      <Image src={p.images[0].url} alt={p.name} width={40} height={40} className="object-cover h-full w-full" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">المتبقي: {p.stock} / الحد الأدنى: {p.minStock}</p>
                  </div>
                  <Badge className="bg-amber-500 hover:bg-amber-500 text-white">
                    {getStockStatusLabel("LOW_STOCK")}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-amiri), serif" }}>
                <PackageX className="h-5 w-5 text-red-500" />
                منتجات غير متوفرة
              </CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/inventory">عرض الكل</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {outOfStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">جميع المنتجات متوفرة 🎉</p>
            ) : (
              outOfStockProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/admin/products/${p.id}/edit`}
                  className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <div className="h-10 w-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                    {p.images[0]?.url ? (
                      <Image src={p.images[0].url} alt={p.name} width={40} height={40} className="object-cover h-full w-full" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">المخزون: {p.stock}</p>
                  </div>
                  <Badge variant="destructive">{getStockStatusLabel("OUT_OF_STOCK")}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Latest products & recent movements */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle style={{ fontFamily: "var(--font-amiri), serif" }}>أحدث المنتجات</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/products">عرض الكل</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {latestProducts.map((p) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}/edit`}
                className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                  {p.images[0]?.url ? (
                    <Image src={p.images[0].url} alt={p.name} width={40} height={40} className="object-cover h-full w-full" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category.name}</p>
                </div>
                <Badge variant={getStockStatus(p.stock, p.minStock) === "IN_STOCK" ? "default" : getStockStatus(p.stock, p.minStock) === "LOW_STOCK" ? "secondary" : "destructive"}>
                  {p.stock}
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle style={{ fontFamily: "var(--font-amiri), serif" }}>آخر حركات المخزون</CardTitle>
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/inventory/history">عرض الكل</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {movements.slice(0, 8).map((m) => (
              <div key={m.id} className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    m.type === "ADD" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {m.type === "ADD" ? "+" : "−"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.product.name}</p>
                  <p className="text-xs text-muted-foreground">{m.reason}</p>
                </div>
                <div className="text-left shrink-0">
                  <p className={`text-sm font-bold ${m.type === "ADD" ? "text-green-700" : "text-red-700"}`}>
                    {m.type === "ADD" ? "+" : "−"}{m.quantity}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(m.createdAt)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: "var(--font-amiri), serif" }}>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/products/new">
                <Package className="h-4 w-4 ml-2" />
                إضافة منتج
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/inventory">
                <Boxes className="h-4 w-4 ml-2" />
                إدارة المخزون
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/offers">
                <Tags className="h-4 w-4 ml-2" />
                إضافة عرض
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/categories">
                <FolderTree className="h-4 w-4 ml-2" />
                إدارة الأقسام
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
