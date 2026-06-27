"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export function RevenueChart({
  data,
}: {
  data: { label: string; revenue: number; orders: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c8a96a" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#c8a96a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,241,233,0.06)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#8a857a", fontSize: 11 }}
          axisLine={{ stroke: "rgba(245,241,233,0.1)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#8a857a", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={60}
          tickFormatter={(v) => `৳${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
        <Tooltip
          contentStyle={{
            background: "#18181b",
            border: "1px solid rgba(245,241,233,0.12)",
            borderRadius: 2,
            color: "#f5f1e9",
            fontSize: 12,
          }}
          formatter={((value: unknown) => [
            `৳ ${Number(value).toLocaleString()}`,
            "Revenue",
          ]) as never}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#c8a96a"
          strokeWidth={2}
          fill="url(#rev)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MiniBars({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs text-ivory-dim">
            {d.label}
          </span>
          <div className="h-2 flex-1 bg-line-strong">
            <div className="h-full bg-gold" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
          <span className="w-20 text-right text-xs text-muted tnum">
            ৳ {d.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
