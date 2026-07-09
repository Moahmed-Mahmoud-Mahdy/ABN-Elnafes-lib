"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from "@/components/public/product-card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number | null;
  stock: number;
  minStock: number;
  featured: boolean;
  images: { url: string; position: number }[];
  category: { id: string; name: string };
};

type Category = { id: string; name: string; slug: string };

export default function ProductsClient({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "all";
  const sort = searchParams.get("sort") ?? "newest";
  const page = parseInt(searchParams.get("page") ?? "1");

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    params.set("page", String(page));
    params.set("limit", "12");

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);
    setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
    setLoading(false);
  }, [search, category, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    if (key !== "page") params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("search", searchInput);
  };

  const clearFilters = () => {
    router.push("/products");
    setSearchInput("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: "var(--font-amiri), serif" }}>
          المنتجات
        </h1>
        <p className="text-muted-foreground">
          تصفح جميع منتجاتنا - {pagination.total} منتج متاح
        </p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border/60 rounded-xl p-4 mb-6 space-y-3">
        <form onSubmit={onSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن منتج..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button type="submit">بحث</Button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">القسم:</span>
          </div>
          <Select value={category} onValueChange={(v) => updateParams("category", v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="كل الأقسام" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل الأقسام</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.slug}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">ترتيب:</span>
          </div>
          <Select value={sort} onValueChange={(v) => updateParams("sort", v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">الأحدث</SelectItem>
              <SelectItem value="featured">المميزة</SelectItem>
            </SelectContent>
          </Select>

          {(search || category !== "all") && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 ml-1" />
              مسح الفلاتر
            </Button>
          )}
        </div>

        {/* Active filters */}
        {(search || category !== "all") && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {search && (
              <Badge variant="secondary" className="gap-1">
                بحث: {search}
                <button onClick={() => updateParams("search", "")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {category !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {categories.find((c) => c.slug === category)?.name}
                <button onClick={() => updateParams("category", "all")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-xl text-muted-foreground">لا توجد منتجات مطابقة</p>
          <p className="text-sm text-muted-foreground mt-2">جرّب تعديل الفلاتر أو البحث بكلمات أخرى</p>
          <Button onClick={clearFilters} className="mt-4">عرض كل المنتجات</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  {page > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        href={`/products?${new URLSearchParams({
                          ...(search && { search }),
                          ...(category !== "all" && { category }),
                          page: String(page - 1),
                        }).toString()}`}
                      />
                    </PaginationItem>
                  )}
                  {Array.from({ length: pagination.totalPages }).map((_, i) => {
                    const pageNum = i + 1;
                    // Show current, first, last, and adjacent
                    if (
                      pageNum === 1 ||
                      pageNum === pagination.totalPages ||
                      Math.abs(pageNum - page) <= 1
                    ) {
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href={`/products?${new URLSearchParams({
                              ...(search && { search }),
                              ...(category !== "all" && { category }),
                              page: String(pageNum),
                            }).toString()}`}
                            isActive={pageNum === page}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    }
                    if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                      return <span key={pageNum} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  {page < pagination.totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        href={`/products?${new URLSearchParams({
                          ...(search && { search }),
                          ...(category !== "all" && { category }),
                          page: String(page + 1),
                        }).toString()}`}
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}
    </div>
  );
}
