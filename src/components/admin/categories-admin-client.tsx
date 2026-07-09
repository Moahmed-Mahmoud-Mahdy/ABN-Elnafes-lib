"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, Plus, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: { products: number };
};

const ICONS = [
  "BookOpen", "Pencil", "Briefcase", "PenTool", "Notebook",
  "Ruler", "Palette", "Backpack", "Puzzle", "Gift",
];

export default function CategoriesAdminClient({
  categories,
}: {
  categories: Category[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openNew = () => {
    setEditing(null);
    setName("");
    setDescription("");
    setOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description ?? "");
    setOpen(true);
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const url = editing ? `/api/categories/${editing.id}` : "/api/categories";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editing ? "تم تحديث القسم" : "تم إضافة القسم");
      setOpen(false);
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.error || "حدث خطأ");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const res = await fetch(`/api/categories/${deleteId}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      toast.success("تم حذف القسم");
      setDeleteId(null);
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.error || "حدث خطأ");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>
            إدارة الأقسام
          </h1>
          <p className="text-muted-foreground">{categories.length} قسم</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة قسم
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-20 border rounded-lg bg-card">
          <FolderTree className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">لا توجد أقسام بعد</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="border rounded-xl bg-card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-lg" style={{ fontFamily: "var(--font-amiri), serif" }}>{cat.name}</h3>
                <Badge variant="secondary">{cat._count.products} منتج</Badge>
              </div>
              {cat.description && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{cat.description}</p>
              )}
              <div className="flex gap-2 pt-3 border-t">
                <Button variant="outline" size="sm" onClick={() => openEdit(cat)} className="flex-1">
                  <Pencil className="h-3.5 w-3.5 ml-1" />
                  تعديل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteId(cat.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "var(--font-amiri), serif" }}>
              {editing ? "تعديل القسم" : "إضافة قسم جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">اسم القسم *</Label>
              <Input
                id="cat-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: الكتب"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">الوصف</Label>
              <Textarea
                id="cat-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="وصف مختصر للقسم..."
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
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا القسم؟ لا يمكن الحذف إذا كان القسم يحتوي على منتجات.
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
