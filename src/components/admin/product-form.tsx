"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, X, Upload, Star, Plus, Package, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = { id: string; name: string };

type ProductData = {
  id?: string;
  name: string;
  description: string;
  price: string;
  categoryId: string;
  stock: string;
  minStock: string;
  featured: boolean;
  showInOffers: boolean;
  active: boolean;
  images: string[];
};

const DEFAULT_DATA: ProductData = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  stock: "0",
  minStock: "5",
  featured: false,
  showInOffers: false,
  active: true,
  images: [],
};

export default function ProductForm({
  initial,
  categories,
}: {
  initial?: ProductData;
  categories: Category[];
}) {
  const router = useRouter();
  const [data, setData] = useState<ProductData>(initial ?? DEFAULT_DATA);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof ProductData, value: string | boolean | string[]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const onUpload = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (result.urls) {
        update("images", [...data.images, ...result.urls]);
        toast.success(`تم رفع ${result.urls.length} صورة`);
      }
    } catch {
      toast.error("فشل رفع الصور");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    update("images", data.images.filter((_, i) => i !== idx));
  };

  const addImageUrl = () => {
    const url = prompt("أدخل رابط الصورة:");
    if (url) update("images", [...data.images, url]);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name.trim()) {
      toast.error("اسم المنتج مطلوب");
      return;
    }
    if (!data.categoryId) {
      toast.error("القسم مطلوب");
      return;
    }

    setLoading(true);
    const url = initial?.id ? `/api/products/${initial.id}` : "/api/products";
    const method = initial?.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setLoading(false);

    if (res.ok) {
      toast.success(initial?.id ? "تم تحديث المنتج" : "تم إضافة المنتج");
      router.push("/admin/products");
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.error || "حدث خطأ");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>
          {initial?.id ? "تعديل المنتج" : "إضافة منتج جديد"}
        </h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            إلغاء
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
            حفظ
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: "var(--font-amiri), serif" }}>المعلومات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المنتج *</Label>
                <Input
                  id="name"
                  required
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="مثال: قلم حبر أزرق"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  rows={5}
                  value={data.description}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="وصف تفصيلي للمنتج..."
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">السعر (ج.م) - اختياري</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={data.price}
                    onChange={(e) => update("price", e.target.value)}
                    placeholder="اتركه فارغاً للسعر عند الاستفسار"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">القسم *</Label>
                  <Select value={data.categoryId} onValueChange={(v) => update("categoryId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر القسم" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: "var(--font-amiri), serif" }}>صور المنتج</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 ml-2" />
                  )}
                  رفع صور
                </Button>
                <Button type="button" variant="ghost" onClick={addImageUrl}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة برابط
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && onUpload(e.target.files)}
                />
              </div>

              {data.images.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {data.images.map((url, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`صورة ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 left-1 h-6 w-6 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      {i === 0 && (
                        <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                          رئيسية
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <Package className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">لا توجد صور - ارفع صوراً أو أضف روابط</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: "var(--font-amiri), serif" }}>المخزون</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stock">الكمية الحالية</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={data.stock}
                  onChange={(e) => update("stock", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  لإضافة كمية توريد جديد استخدم صفحة إدارة المخزون
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock">الحد الأدنى للمخزون</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={data.minStock}
                  onChange={(e) => update("minStock", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  سيظهر تنبيه عند انخفاض المخزون عن هذا الحد
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle style={{ fontFamily: "var(--font-amiri), serif" }}>الإعدادات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent" />
                  <Label htmlFor="featured">منتج مميز</Label>
                </div>
                <Switch
                  id="featured"
                  checked={data.featured}
                  onCheckedChange={(v) => update("featured", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showInOffers">ظاهر في العروض</Label>
                <Switch
                  id="showInOffers"
                  checked={data.showInOffers}
                  onCheckedChange={(v) => update("showInOffers", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {data.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <Label htmlFor="active">منشور</Label>
                </div>
                <Switch
                  id="active"
                  checked={data.active}
                  onCheckedChange={(v) => update("active", v)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
