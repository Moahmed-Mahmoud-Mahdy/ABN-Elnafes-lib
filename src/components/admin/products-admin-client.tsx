"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Package, Plus, Search, Pencil, Trash2, Star, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatPrice } from "@/lib/format";
import { getStockStatus, getStockStatusLabel } from "@/lib/stock";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  stock: number;
  minStock: number;
  featured: boolean;
  showInOffers: boolean;
  active: boolean;
  category: { id: string; name: string };
  images: { url: string }[];
};

type Category = { id: string; name: string };

export default function ProductsAdminClient({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.category.id !== categoryFilter) return false;
      if (search && !p.name.includes(search)) return false;
      return true;
    });
  }, [products, search, categoryFilter]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/products/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      toast.success("تم حذف المنتج بنجاح");
      setDeleteId(null);
      router.refresh();
    } else {
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>
            إدارة المنتجات
          </h1>
          <p className="text-muted-foreground">{products.length} منتج</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4 ml-2" />
            إضافة منتج
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث باسم المنتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="كل الأقسام" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأقسام</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table - desktop */}
      <div className="hidden md:block border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">الصورة</TableHead>
              <TableHead>المنتج</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>السعر</TableHead>
              <TableHead>المخزون</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead className="text-center">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-40" />
                  لا توجد منتجات
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => {
                const status = getStockStatus(p.stock, p.minStock);
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg bg-secondary overflow-hidden">
                        {p.images[0]?.url ? (
                          <Image src={p.images[0].url} alt={p.name} width={48} height={48} className="object-cover h-full w-full" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            <Package className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{p.name}</span>
                        {p.featured && <Star className="h-3.5 w-3.5 text-accent fill-accent" />}
                        {!p.active && <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline">{p.category.name}</Badge></TableCell>
                    <TableCell className="font-medium">{formatPrice(p.price)}</TableCell>
                    <TableCell>
                      <span className={p.stock <= p.minStock ? "text-amber-600 font-bold" : ""}>{p.stock}</span>
                      <span className="text-xs text-muted-foreground"> / {p.minStock}</span>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button asChild variant="ghost" size="icon">
                          <Link href={`/admin/products/${p.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(p.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Cards - mobile */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-40" />
            لا توجد منتجات
          </div>
        ) : (
          filtered.map((p) => {
            const status = getStockStatus(p.stock, p.minStock);
            return (
              <div key={p.id} className="border rounded-lg bg-card p-3 flex gap-3">
                <div className="h-16 w-16 rounded-lg bg-secondary overflow-hidden shrink-0">
                  {p.images[0]?.url ? (
                    <Image src={p.images[0].url} alt={p.name} width={64} height={64} className="object-cover h-full w-full" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-medium truncate">{p.name}</p>
                    {p.featured && <Star className="h-3.5 w-3.5 text-accent fill-accent shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.category.name}</p>
                  <p className="text-sm font-medium mt-1">{formatPrice(p.price)}</p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline">مخزون: {p.stock}</Badge>
                    <div className="flex gap-1">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                        <Link href={`/admin/products/${p.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => setDeleteId(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء، وسيتم حذف جميع الصور وحركات المخزون المرتبطة به.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
