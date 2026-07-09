"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type DataPoint = {
  date: string;
  dateLabel: string;
  add: number;
  remove: number;
  net: number;
};

export default function DashboardChart({ data }: { data: DataPoint[] }) {
  return (
    <div className="h-72 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAdd" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorRemove" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11, fill: "#6b7280" }}
            interval={4}
          />
          <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
          <Tooltip
            contentStyle={{
              direction: "rtl",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "12px",
            }}
            labelStyle={{ fontWeight: 600 }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Area
            type="monotone"
            dataKey="add"
            name="توريد"
            stroke="#16a34a"
            strokeWidth={2}
            fill="url(#colorAdd)"
          />
          <Area
            type="monotone"
            dataKey="remove"
            name="خصم"
            stroke="#dc2626"
            strokeWidth={2}
            fill="url(#colorRemove)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
