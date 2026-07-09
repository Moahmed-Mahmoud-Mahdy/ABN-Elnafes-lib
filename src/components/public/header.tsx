"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Search, BookOpen, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { SiteSettings } from "@/lib/settings";

type Category = { id: string; name: string; slug: string; icon?: string | null };

export default function PublicHeader({
  categories,
  settings,
}: {
  categories: Category[];
  settings: SiteSettings;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "الرئيسية" },
    { href: "/products", label: "المنتجات" },
    { href: "/categories", label: "الأقسام" },
    { href: "/offers", label: "العروض" },
    { href: "/about", label: "من نحن" },
    { href: "/contact", label: "تواصل معنا" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(search.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
      {/* Top bar */}
      <div className="hidden md:block bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 flex items-center justify-between h-9 text-sm">
          <div className="flex items-center gap-4">
            <a href={`tel:${settings.phone}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
              <Phone className="h-3.5 w-3.5" />
              <span dir="ltr">{settings.phone}</span>
            </a>
            <span className="opacity-70">|</span>
            <span className="opacity-90">{settings.workingHours}</span>
          </div>
          <div className="flex items-center gap-3 opacity-90">
            <span>تابعنا:</span>
            <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">فيسبوك</a>
            <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">انستجرام</a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-white flex items-center justify-center shadow-md">
              <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold leading-tight text-primary" style={{ fontFamily: "var(--font-amiri), serif" }}>
                {settings.libraryName}
              </h1>
              <p className="text-xs text-muted-foreground">للكتب والأدوات المدرسية</p>
            </div>
          </Link>

          {/* Desktop search */}
          <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="ابحث عن منتج..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 bg-background"
              />
            </div>
            <Button type="submit" className="mr-2">بحث</Button>
          </form>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">القائمة</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="text-right">{settings.libraryName}</SheetTitle>
              </SheetHeader>
              <div className="px-4 py-4 space-y-4">
                <form onSubmit={onSearch} className="flex gap-2">
                  <Input
                    type="search"
                    placeholder="ابحث..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button type="submit" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>

                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">الأقسام</h4>
                  <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.slug}`}
                        onClick={() => setOpen(false)}
                        className="px-3 py-2 rounded-md text-sm hover:bg-secondary transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
