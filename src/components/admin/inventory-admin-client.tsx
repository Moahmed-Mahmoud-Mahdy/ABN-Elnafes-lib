"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Search, Plus, Minus, Package, AlertTriangle, TrendingUp, TrendingDown, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { getStockStatus, getStockStatusLabel } from "@/lib/stock";
import { formatNumber } from "@/lib/format";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  category: { name: string };
  images: { url: string }[];
};

const ADD_REASONS = [
  "توريد جديد",
  "مرتجع من العميل",
  "تسوية جرد",
  "هدية من المورد",
  "تصحيح خطأ",
];

const REMOVE_REASONS = [
  "بيع داخل الفرع",
  "منتج تالف",
  "استخدام داخلي",
  "هدية للعميل",
  "مرتجع للمورد",
  "تسوية جرد",
  "تصحيح خطأ",
];

export default function InventoryAdminClient({
  products,
  userName,
}: {
  products: Product[];
  userName: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modal, setModal] = useState<{ type: "ADD" | "REMOVE"; product: Product } | null>(null);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !p.name.includes(search)) return false;
      if (statusFilter !== "all") {
        const status = getStockStatus(p.stock, p.minStock);
        if (statusFilter !== status) return false;
      }
      return true;
    });
  }, [products, search, statusFilter]);

  const openModal = (type: "ADD" | "REMOVE", product: Product) => {
    setModal({ type, product });
    setQuantity("");
    setReason("");
    setNotes("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modal) return;
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      toast.error("أدخل كمية صحيحة");
      return;
    }
    if (!reason) {
      toast.error("اختر السبب");
      return;
    }
    setSaving(true);
    const finalReason = notes ? `${reason} - ${notes}` : reason;
    const res = await fetch("/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: modal.product.id,
        type: modal.type,
        quantity: qty,
        reason: finalReason,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(modal.type === "ADD" ? "تمت إضافة الكمية بنجاح" : "تم خصم الكمية بنجاح");
      setModal(null);
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.error || "حدث خطأ");
    }
  };

  const stats = {
    total: products.length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length,
    outOfStock: products.filter((p) => p.stock <= 0).length,
    totalStock: products.reduce((sum, p) => sum + p.stock, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>
            إدارة المخزون
          </h1>
          <p className="text-muted-foreground">أضف أو خصم كميات من المخزون - كل عملية تُسجّل في السجل</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/inventory/history">
            <History className="h-4 w-4 ml-2" />
            سجل المخزون
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">إجمالي المنتجات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-green-100 text-green-700 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{formatNumber(stats.totalStock)}</p>
              <p className="text-xs text-muted-foreground">إجمالي الكميات</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.lowStock}</p>
              <p className="text-xs text-muted-foreground">مخزون منخفض</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-11 w-11 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold">{stats.outOfStock}</p>
              <p className="text-xs text-muted-foreground">غير متوفر</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث عن منتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="IN_STOCK">متوفر</SelectItem>
            <SelectItem value="LOW_STOCK">منخفض</SelectItem>
            <SelectItem value="OUT_OF_STOCK">غير متوفر</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border rounded-lg bg-card">
          <Package className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-40" />
          <p className="text-muted-foreground">لا توجد منتجات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const status = getStockStatus(p.stock, p.minStock);
            return (
              <div
                key={p.id}
                className="border rounded-lg bg-card p-3 flex items-center gap-3 hover:shadow-sm transition-shadow"
              >
                <div className="h-14 w-14 rounded-lg bg-secondary overflow-hidden shrink-0">
                  {p.images[0]?.url ? (
                    <Image src={p.images[0].url} alt={p.name} width={56} height={56} className="object-cover h-full w-full" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <Package className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category.name}</p>
                </div>

                <div className="text-center shrink-0">
                  <p className={`text-lg font-bold ${
                    status === "IN_STOCK" ? "text-green-700" : status === "LOW_STOCK" ? "text-amber-600" : "text-red-600"
                  }`}>
                    {p.stock}
                  </p>
                  <p className="text-xs text-muted-foreground">/ {p.minStock}</p>
                </div>

                <Badge
                  variant={status === "IN_STOCK" ? "default" : status === "LOW_STOCK" ? "secondary" : "destructive"}
                  className={`shrink-0 ${
                    status === "IN_STOCK"
                      ? "bg-green-700 hover:bg-green-700 text-white"
                      : status === "LOW_STOCK"
                      ? "bg-amber-500 hover:bg-amber-500 text-white"
                      : ""
                  }`}
                >
                  {getStockStatusLabel(status)}
                </Badge>

                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openModal("ADD", p)}
                    className="text-green-700 border-green-200 hover:bg-green-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openModal("REMOVE", p)}
                    disabled={p.stock <= 0}
                    className="text-red-700 border-red-200 hover:bg-red-50"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Remove dialog */}
      <Dialog open={!!modal} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-amiri), serif" }}>
              {modal?.type === "ADD" ? "إضافة مخزون" : "خصم مخزون"}
            </DialogTitle>
            <DialogDescription>
              {modal?.product.name} - المخزون الحالي: {modal?.product.stock}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qty">الكمية *</Label>
              <Input
                id="qty"
                type="number"
                min="1"
                required
                autoFocus
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="أدخل الكمية"
              />
              {modal?.type === "REMOVE" && modal.product.stock > 0 && (
                <p className="text-xs text-muted-foreground">
                  المتاح للخصم: {modal.product.stock}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">السبب *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر السبب" />
                </SelectTrigger>
                <SelectContent>
                  {(modal?.type === "ADD" ? ADD_REASONS : REMOVE_REASONS).map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات اختيارية..."
              />
            </div>

            <div className="bg-secondary/50 p-3 rounded-lg text-sm text-muted-foreground">
              <p>سيتم تنفيذ العملية بواسطة: <span className="font-medium text-foreground">{userName}</span></p>
              <p>سيتم تسجيل هذه العملية في سجل المخزون.</p>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModal(null)}>إلغاء</Button>
              <Button
                type="submit"
                disabled={saving}
                variant={modal?.type === "ADD" ? "default" : "destructive"}
              >
                {saving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                {modal?.type === "ADD" ? (
                  <><Plus className="h-4 w-4 ml-1" /> إضافة</>
                ) : (
                  <><Minus className="h-4 w-4 ml-1" /> خصم</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
