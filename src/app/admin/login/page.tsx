"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@ibnalnafis.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("بيانات الدخول غير صحيحة");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="h-16 w-16 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center mb-4 shadow-lg">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>
            مكتبة ابن النفيس
          </h1>
          <p className="text-sm text-muted-foreground mt-1">لوحة تحكم الإدارة</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle style={{ fontFamily: "var(--font-amiri), serif" }}>تسجيل الدخول</CardTitle>
            <CardDescription>أدخل بياناتك للوصول إلى لوحة التحكم</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  className="text-left"
                />
              </div>

              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full h-11">
                {loading && <Loader2 className="h-4 w-4 ml-2 animate-spin" />}
                تسجيل الدخول
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t text-center text-sm">
              <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                ← العودة إلى الموقع
              </Link>
            </div>

            <div className="mt-4 bg-secondary/50 p-3 rounded-lg text-xs text-muted-foreground">
              <p className="font-semibold mb-1">بيانات تجريبية:</p>
              <p dir="ltr" className="text-right">Email: admin@ibnalnafis.com</p>
              <p dir="ltr" className="text-right">Password: admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
