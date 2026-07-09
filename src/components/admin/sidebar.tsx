"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tags,
  Boxes,
  History,
  Settings,
  BookOpen,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/categories", label: "الأقسام", icon: FolderTree },
  { href: "/admin/offers", label: "العروض", icon: Tags },
  { href: "/admin/inventory", label: "إدارة المخزون", icon: Boxes },
  { href: "/admin/inventory/history", label: "سجل المخزون", icon: History },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-md"
        aria-label="فتح القائمة"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 right-0 h-screen w-72 bg-card border-l border-border/60 z-40 transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
              <div className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-bold text-base leading-tight" style={{ fontFamily: "var(--font-amiri), serif" }}>
                  مكتبة ابن النفيس
                </h1>
                <p className="text-xs text-muted-foreground">لوحة التحكم</p>
              </div>
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="lg:hidden p-1 hover:bg-secondary rounded"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            عرض الموقع
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
