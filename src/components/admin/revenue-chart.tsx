"use client";

import { useTheme } from "next-themes";
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
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";
  const grid = isLight ? "rgba(23,23,26,0.08)" : "rgba(245,241,233,0.06)";
  const axis = isLight ? "rgba(23,23,26,0.12)" : "rgba(245,241,233,0.1)";
  const muted = isLight ? "#6f6a60" : "#8a857a";
  const tooltipBg = isLight ? "#efe9df" : "#18181b";
  const tooltipBorder = isLight
    ? "1px solid rgba(23,23,26,0.12)"
    : "1px solid rgba(245,241,233,0.12)";
  const tooltipColor = isLight ? "#17171a" : "#f5f1e9";
  const gold = isLight ? "#8f7035" : "#c8a96a";

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gold} stopOpacity={0.4} />
            <stop offset="100%" stopColor={gold} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: muted, fontSize: 11 }}
          axisLine={{ stroke: axis }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: muted, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={60}
          tickFormatter={(v) => `৳${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
        />
        <Tooltip
          contentStyle={{
            background: tooltipBg,
            border: tooltipBorder,
            borderRadius: 2,
            color: tooltipColor,
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
          stroke={gold}
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
