"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

const COLORS = ["#8b5a2b", "#c08a4a", "#a06a35", "#d4a574", "#6b4423", "#b8855a", "#9c6f3d", "#d4a574", "#7a5230", "#a87f4a"];

type DataPoint = { name: string; count: number };

export default function CategoryDistributionChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="h-72 w-full" dir="ltr">
      {data.length === 0 ? (
        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
          لا توجد بيانات
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#6b7280" }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              width={80}
            />
            <Tooltip
              contentStyle={{
                direction: "rtl",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="count" name="عدد المنتجات" radius={[0, 4, 4, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
