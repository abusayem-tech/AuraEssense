import Link from "next/link";
import { AdminHeader, Card, StatCard, Table, Th, Td } from "@/components/admin/admin-ui";
import { RevenueChart, MiniBars } from "@/components/admin/revenue-chart";
import { getAnalytics } from "@/lib/admin/analytics";
import { formatBDT } from "@/lib/format";

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const days = Number(range) || 30;
  const a = await getAnalytics(days);

  return (
    <div>
      <AdminHeader
        title="Sales & Analytics"
        description={`Insights across the last ${days} days.`}
        action={
          <div className="flex border border-line">
            {RANGES.map((r) => (
              <Link
                key={r.days}
                href={`/admin/analytics?range=${r.days}`}
                className={`px-4 py-2 text-xs uppercase tracking-widest ${
                  days === r.days ? "bg-gold text-onyx" : "text-ivory-dim hover:text-ivory"
                }`}
              >
                {r.label}
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue" value={formatBDT(a.revenue)} trend={a.revenueTrend} />
        <StatCard label="Orders" value={String(a.orders)} trend={a.ordersTrend} />
        <StatCard label="Avg. Order Value" value={formatBDT(a.aov)} />
        <StatCard label="Units Sold" value={String(a.units)} />
        <StatCard label="Repeat Rate" value={`${a.returningRate.toFixed(0)}%`} sub="returning customers" />
        <StatCard label="New Customers" value={String(a.newCustomers)} />
        <StatCard label="Failed Payments" value={String(a.failedCount)} />
        <StatCard label="Inventory Value" value={formatBDT(a.inventoryValue)} />
      </div>

      <Card className="mt-6">
        <p className="mb-4 text-[0.65rem] uppercase tracking-widest text-muted">Revenue Over Time</p>
        <RevenueChart data={a.series} />
      </Card>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="mb-4 text-[0.65rem] uppercase tracking-widest text-muted">Sales by Brand</p>
          {a.byBrand.length ? <MiniBars data={a.byBrand} /> : <Empty />}
        </Card>
        <Card>
          <p className="mb-4 text-[0.65rem] uppercase tracking-widest text-muted">Sales by Delivery Zone</p>
          {a.byZone.length ? (
            <MiniBars data={a.byZone.map((z) => ({ label: z.zone === "dhaka" ? "Inside Dhaka" : "Outside Dhaka", value: z.revenue }))} />
          ) : (
            <Empty />
          )}
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <p className="mb-4 text-[0.65rem] uppercase tracking-widest text-muted">Best Sellers</p>
          <Table>
            <thead>
              <tr><Th>Product</Th><Th className="text-right">Units</Th><Th className="text-right">Revenue</Th></tr>
            </thead>
            <tbody>
              {a.byProduct.map((p) => (
                <tr key={p.label}>
                  <Td className="text-ivory">{p.label}</Td>
                  <Td className="text-right tnum">{p.units}</Td>
                  <Td className="text-right tnum text-ivory">{formatBDT(p.value)}</Td>
                </tr>
              ))}
              {a.byProduct.length === 0 && (
                <tr><Td className="text-center text-muted" >No sales yet.</Td></tr>
              )}
            </tbody>
          </Table>
        </Card>
        <Card>
          <p className="mb-4 text-[0.65rem] uppercase tracking-widest text-muted">Top Customers (LTV)</p>
          <Table>
            <thead>
              <tr><Th>Customer</Th><Th className="text-right">Orders</Th><Th className="text-right">Spend</Th></tr>
            </thead>
            <tbody>
              {a.topCustomers.map((c, i) => (
                <tr key={i}>
                  <Td className="text-ivory">{c.name}</Td>
                  <Td className="text-right tnum">{c.orders}</Td>
                  <Td className="text-right tnum text-ivory">{formatBDT(c.spend)}</Td>
                </tr>
              ))}
              {a.topCustomers.length === 0 && (
                <tr><Td className="text-center text-muted">No customers yet.</Td></tr>
              )}
            </tbody>
          </Table>
        </Card>
      </div>

      <Card className="mt-6">
        <p className="mb-4 text-[0.65rem] uppercase tracking-widest text-muted">Orders by Status</p>
        <div className="flex flex-wrap gap-3">
          {a.byStatus.map((s) => (
            <div key={s.status} className="border border-line px-4 py-3">
              <p className="text-xs capitalize text-muted">{s.status.replace("_", " ")}</p>
              <p className="font-display text-2xl text-ivory tnum">{s.count}</p>
            </div>
          ))}
          {a.byStatus.length === 0 && <Empty />}
        </div>
      </Card>
    </div>
  );
}

function Empty() {
  return <p className="py-8 text-center text-xs text-muted">No data for this period.</p>;
}
