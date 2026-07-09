"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, Phone, MapPin, Clock, Share2, BookOpen, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { SiteSettings } from "@/lib/settings";

export default function SettingsClient({ initial }: { initial: SiteSettings }) {
  const router = useRouter();
  const [data, setData] = useState<SiteSettings>(initial);
  const [saving, setSaving] = useState(false);

  const update = (key: keyof SiteSettings, value: string) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("تم حفظ الإعدادات بنجاح");
      router.refresh();
    } else {
      toast.error("حدث خطأ أثناء الحفظ");
    }
  };

  return (
    <form onSubmit={onSave} className="space-y-6 pb-12">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>
            إعدادات الموقع
          </h1>
          <p className="text-muted-foreground">عدّل بيانات التواصل والمحتوى من هنا بدون تعديل الكود</p>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Save className="h-4 w-4 ml-2" />}
          حفظ التغييرات
        </Button>
      </div>

      {/* Contact info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-amiri), serif" }}>
            <Phone className="h-5 w-5" />
            بيانات التواصل
          </CardTitle>
          <CardDescription>ستظهر في الهيدر والفوتر وصفحة التواصل</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="libraryName">اسم المكتبة</Label>
            <Input id="libraryName" value={data.libraryName} onChange={(e) => update("libraryName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input id="phone" value={data.phone} onChange={(e) => update("phone", e.target.value)} dir="ltr" className="text-left" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="whatsapp">رقم واتساب (مع رمز الدولة)</Label>
            <Input id="whatsapp" value={data.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} dir="ltr" className="text-left" placeholder="+201001234567" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" value={data.email} onChange={(e) => update("email", e.target.value)} dir="ltr" className="text-left" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">العنوان</Label>
            <Textarea id="address" rows={2} value={data.address} onChange={(e) => update("address", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="googleMapsUrl">رابط خرائط جوجل</Label>
            <Input id="googleMapsUrl" value={data.googleMapsUrl} onChange={(e) => update("googleMapsUrl", e.target.value)} dir="ltr" className="text-left" placeholder="https://maps.google.com/?q=..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workingHours">ساعات العمل</Label>
            <Textarea id="workingHours" rows={2} value={data.workingHours} onChange={(e) => update("workingHours", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Social */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-amiri), serif" }}>
            <Share2 className="h-5 w-5" />
            مواقع التواصل الاجتماعي
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="facebook">فيسبوك</Label>
            <Input id="facebook" value={data.facebook} onChange={(e) => update("facebook", e.target.value)} dir="ltr" className="text-left" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">انستجرام</Label>
            <Input id="instagram" value={data.instagram} onChange={(e) => update("instagram", e.target.value)} dir="ltr" className="text-left" />
          </div>
        </CardContent>
      </Card>

      {/* Home page content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-amiri), serif" }}>
            <BookOpen className="h-5 w-5" />
            محتوى الصفحة الرئيسية
          </CardTitle>
          <CardDescription>عدّل النصوص التي تظهر في الصفحة الرئيسية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">عنوان البانر الرئيسي</Label>
            <Input id="heroTitle" value={data.heroTitle} onChange={(e) => update("heroTitle", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">النص الفرعي للبانر</Label>
            <Textarea id="heroSubtitle" rows={2} value={data.heroSubtitle} onChange={(e) => update("heroSubtitle", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* About content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-amiri), serif" }}>
            <Info className="h-5 w-5" />
            محتوى صفحة "من نحن"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aboutTitle">عنوان القسم</Label>
            <Input id="aboutTitle" value={data.aboutTitle} onChange={(e) => update("aboutTitle", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aboutText">النص</Label>
            <Textarea id="aboutText" rows={5} value={data.aboutText} onChange={(e) => update("aboutText", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Why choose us */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: "var(--font-amiri), serif" }}>مميزات المكتبة (لماذا تختارنا)</CardTitle>
          <CardDescription>4 مميزات تظهر في الصفحة الرئيسية</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="grid sm:grid-cols-2 gap-4 pb-4 border-b last:border-0 last:pb-0">
              <div className="space-y-2">
                <Label htmlFor={`whyChoose${n}Title`}>الميزة {n} - العنوان</Label>
                <Input
                  id={`whyChoose${n}Title`}
                  value={data[`whyChoose${n}Title` as keyof SiteSettings]}
                  onChange={(e) => update(`whyChoose${n}Title` as keyof SiteSettings, e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`whyChoose${n}Text`}>الميزة {n} - الوصف</Label>
                <Textarea
                  id={`whyChoose${n}Text`}
                  rows={2}
                  value={data[`whyChoose${n}Text` as keyof SiteSettings]}
                  onChange={(e) => update(`whyChoose${n}Text` as keyof SiteSettings, e.target.value)}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 ml-2 animate-spin" /> : <Save className="h-4 w-4 ml-2" />}
          حفظ جميع التغييرات
        </Button>
      </div>
    </form>
  );
}
