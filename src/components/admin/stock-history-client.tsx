"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Minus, History, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { formatDateTime } from "@/lib/format";

type Movement = {
  id: string;
  type: string;
  quantity: number;
  reason: string;
  userName: string;
  createdAt: string;
  product: {
    id: string;
    name: string;
    category: { name: string };
  };
};

export default function StockHistoryClient({ movements }: { movements: Movement[] }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          m.product.name.toLowerCase().includes(q) ||
          m.reason.toLowerCase().includes(q) ||
          m.userName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [movements, search, typeFilter]);

  const exportCsv = () => {
    const headers = ["التاريخ", "المنتج", "القسم", "النوع", "الكمية", "السبب", "المستخدم"];
    const rows = filtered.map((m) => [
      formatDateTime(m.createdAt),
      m.product.name,
      m.product.category.name,
      m.type === "ADD" ? "إضافة" : "خصم",
      (m.type === "ADD" ? "+" : "-") + m.quantity,
      m.reason,
      m.userName,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stock-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "var(--font-amiri), serif" }}>
            سجل حركات المخزون
          </h1>
          <p className="text-muted-foreground">{movements.length} عملية مسجلة</p>
        </div>
        <Button onClick={exportCsv} variant="outline">
          <Download className="h-4 w-4 ml-2" />
          تصدير CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="ابحث بالمنتج أو السبب أو المستخدم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل العمليات</SelectItem>
            <SelectItem value="ADD">إضافات فقط</SelectItem>
            <SelectItem value="REMOVE">خصومات فقط</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block border rounded-lg overflow-hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>التاريخ</TableHead>
              <TableHead>المنتج</TableHead>
              <TableHead>القسم</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الكمية</TableHead>
              <TableHead>السبب</TableHead>
              <TableHead>المستخدم</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  <History className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  لا توجد عمليات
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="text-sm whitespace-nowrap">{formatDateTime(m.createdAt)}</TableCell>
                  <TableCell className="font-medium">{m.product.name}</TableCell>
                  <TableCell><Badge variant="outline">{m.product.category.name}</Badge></TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={m.type === "ADD" ? "border-green-200 text-green-700 bg-green-50" : "border-red-200 text-red-700 bg-red-50"}
                    >
                      {m.type === "ADD" ? <><Plus className="h-3 w-3 ml-1" /> إضافة</> : <><Minus className="h-3 w-3 ml-1" /> خصم</>}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`font-bold ${m.type === "ADD" ? "text-green-700" : "text-red-700"}`}>
                      {m.type === "ADD" ? "+" : "−"}{m.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{m.reason}</TableCell>
                  <TableCell className="text-sm">{m.userName}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-card text-muted-foreground">
            <History className="h-10 w-10 mx-auto mb-2 opacity-40" />
            لا توجد عمليات
          </div>
        ) : (
          filtered.map((m) => (
            <div key={m.id} className="border rounded-lg bg-card p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="font-medium">{m.product.name}</p>
                  <p className="text-xs text-muted-foreground">{m.product.category.name}</p>
                </div>
                <Badge
                  variant="outline"
                  className={m.type === "ADD" ? "border-green-200 text-green-700 bg-green-50" : "border-red-200 text-red-700 bg-red-50"}
                >
                  {m.type === "ADD" ? "+" : "−"}{m.quantity}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{m.reason}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>{m.userName}</span>
                <span>{formatDateTime(m.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
