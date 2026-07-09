"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2, Plus, Pencil, Trash2, Upload, Tag, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDate } from "@/lib/format";

type Offer = {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  discount: string | null;
  startDate: string;
  endDate: string;
  active: boolean;
};

const EMPTY = {
  title: "",
  description: "",
  image: "",
  discount: "",
  startDate: "",
  endDate: "",
  active: true,
};

function toDateInput(iso: string) {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function OffersAdminClient({ offers }: { offers: Offer[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Offer | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openNew = () => {
    setEditing(null);
    const today = new Date().toISOString().slice(0, 10);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setForm({ ...EMPTY, startDate: today, endDate: nextWeek.toISOString().slice(0, 10) });
    setOpen(true);
  };

  const openEdit = (o: Offer) => {
    setEditing(o);
    setForm({
      title: o.title,
      description: o.description ?? "",
      image: o.image ?? "",
      discount: o.discount ?? "",
      startDate: toDateInput(o.startDate),
      endDate: toDateInput(o.endDate),
      active: o.active,
    });
    setOpen(true);
  };

  const onUpload = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach((f) => formData.append("files", f));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (result.urls?.length) {
        setForm((f) => ({ ...f, image: result.urls[0] }));
        toast.success("تم رفع الصورة");
      }
    } catch {
      toast.error("فشل رفع الصورة");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.startDate || !form.endDate) {
      toast.error("الحقول المطلوبة ناقصة");
      return;
    }
    setSaving(true);
    const url = editing ? `/api/offers/${editing.id}` : "/api/offers";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description || null,
        image: form.image || null,
        discount: form.discount || null,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        active: form.active,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editing ? "تم تحديث العرض" : "تم إضافة العرض");
      setOpen(false);
      router.refresh();
    } else {
      toast.error("حدث خطأ");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/offers/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      toast.success("تم حذف العرض");
      setDeleteId(null);
      router.refresh();
    } else {
      toast.error("حدث خطأ");
    }
  };

  const now = new Date();
  const getStatus = (o: Offer) => {
    if (!o.active) return { label: "متوقف", variant: "secondary" as const };
    const start = new Date(o.startDate);
    const end = new Date(o.endDate);
    if (now < start) return { label: "قادم", variant: "outline" as const };
    if (now > end) return { label: "منتهي", variant: "destructive" as const };
    return { label: "ساري", variant: "default" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>
            إدارة العروض
          </h1>
          <p className="text-muted-foreground">{offers.length} عرض</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة عرض
        </Button>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-card">
          <Tag className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">لا توجد عروض بعد</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offers.map((o) => {
            const status = getStatus(o);
            return (
              <Card key={o.id} className="overflow-hidden hover:shadow-md transition-shadow">
                {o.image && (
                  <div className="relative aspect-[16/9] bg-secondary">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={o.image} alt={o.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>{o.title}</h3>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                  {o.discount && (
                    <Badge className="bg-accent text-accent-foreground hover:bg-accent">{o.discount}</Badge>
                  )}
                  {o.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{o.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(o.startDate)} - {formatDate(o.endDate)}</span>
                  </div>
                  <div className="flex gap-2 pt-2 border-t">
                    <Button variant="outline" size="sm" onClick={() => openEdit(o)} className="flex-1">
                      <Pencil className="h-3.5 w-3.5 ml-1" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteId(o.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-amiri), serif" }}>
              {editing ? "تعديل العرض" : "إضافة عرض جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">العنوان *</Label>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="مثال: خصم العودة للمدارس"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">نص الخصم</Label>
              <Input
                id="discount"
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                placeholder="مثال: خصم 25%"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>الصورة</Label>
              {form.image ? (
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.image} alt="عرض" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, image: "" }))}
                    className="absolute top-2 left-2 h-7 w-7 rounded-full bg-destructive text-white flex items-center justify-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-24 border-dashed"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Upload className="h-5 w-5 ml-2" />
                      رفع صورة
                    </>
                  )}
                </Button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && onUpload(e.target.files)}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">تاريخ البداية *</Label>
                <Input
                  id="startDate"
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">تاريخ النهاية *</Label>
                <Input
                  id="endDate"
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="active">العرض مفعّل</Label>
              <Switch
                id="active"
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>إلغاء</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                حفظ
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>هل أنت متأكد من حذف هذا العرض؟</AlertDialogDescription>
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
