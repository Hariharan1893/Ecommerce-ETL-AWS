"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

// --------------------------------------------------
// Types
// --------------------------------------------------
type RevenueRow = { day: string; revenue: string };
type ProductRow = { productName: string; units: string };
type OrderRow = { day: string; orders: string };

export default function DashboardPage() {
  // Base URL (default: localhost Flask)
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:5000";

  // State for analytics data
  const [dailyRevenue, setDailyRevenue] = useState<RevenueRow[]>([]);
  const [topProducts, setTopProducts] = useState<ProductRow[]>([]);
  const [orderCount, setOrderCount] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------
  // Fetch analytics data on mount
  // --------------------------------------------------
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [revRes, prodRes, orderRes] = await Promise.all([
          fetch(`${API_BASE}/analytics/daily-revenue`),
          fetch(`${API_BASE}/analytics/top-products`),
          fetch(`${API_BASE}/analytics/order-count`)
        ]);

        setDailyRevenue(await revRes.json());
        setTopProducts(await prodRes.json());
        setOrderCount(await orderRes.json());
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }

      setLoading(false);
    };

    fetchAll();
  }, []);

  // --------------------------------------------------
  // Summary metrics
  // --------------------------------------------------
  const totalRevenue = dailyRevenue.reduce(
    (sum, r) => sum + Number(r.revenue || 0),
    0
  );

  const totalOrders = orderCount.reduce(
    (sum, r) => sum + Number(r.orders || 0),
    0
  );

  const totalProducts = topProducts.length;

  // Loading state UI
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center">
        <p className="text-lg animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  // --------------------------------------------------
  // Formatters
  // --------------------------------------------------
  const formatWeekday = (iso: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { weekday: "short" });
  };

  // --------------------------------------------------
  // Custom Tooltip Component
  // --------------------------------------------------
  const CustomTooltip = ({
    active,
    payload,
    label,
    formatLabel,
    formatValue
  }: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg shadow-xl px-3 py-2 text-xs">
        <p className="text-indigo-300 font-medium mb-1">
          {formatLabel ? formatLabel(label) : label}
        </p>

        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-emerald-400">
            {entry.name}:{" "}
            <span className="font-semibold">
              {formatValue ? formatValue(entry.value) : entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  };

  // --------------------------------------------------
  // Dashboard UI
  // --------------------------------------------------
  return (
    <main className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ------------------------------------------ */}
        {/* Header + Back Button                       */}
        {/* ------------------------------------------ */}
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              Weekly Sales & Operations Insights
            </h1>

            <p className="text-slate-400 text-sm mt-1">
              Track your sales performance, order trends, and product demand —
              automatically processed through your AWS ETL workflow.
            </p>
          </div>

          <a
            href="/"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 
                       text-sm font-medium rounded-xl border border-indigo-500 
                       transition-colors shadow-lg shadow-indigo-900/20"
          >
            ← Upload New Dataset
          </a>
        </header>

        {/* ------------------------------------------ */}
        {/* Summary Cards                              */}
        {/* ------------------------------------------ */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Revenue */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5">
            <p className="text-xs text-slate-400">Total Revenue (Current Week)</p>
            <h2 className="text-2xl font-bold mt-1">
              ₹{totalRevenue.toLocaleString()}
            </h2>
          </div>

          {/* Orders */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5">
            <p className="text-xs text-slate-400">Orders Processed</p>
            <h2 className="text-2xl font-bold mt-1">{totalOrders}</h2>
          </div>

          {/* Products */}
          <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5">
            <p className="text-xs text-slate-400">Unique Products Sold</p>
            <h2 className="text-2xl font-bold mt-1">{totalProducts}</h2>
          </div>
        </section>

        {/* ------------------------------------------ */}
        {/* Daily Revenue Line Chart                   */}
        {/* ------------------------------------------ */}
        <section className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h3 className="mb-4 text-lg font-medium">Revenue Trend by Day</h3>

          <p className="text-slate-400 text-sm mb-4">
            Daily revenue generated from processed order data for the current week.
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                tickFormatter={(value) => formatWeekday(value)}
                interval={0}
                tickMargin={10}
              />

              <YAxis stroke="#94a3b8" />

              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    {...props}
                    formatLabel={formatWeekday}
                    formatValue={(val: any) => `₹${val}`}
                  />
                )}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, stroke: "#22c55e", fill: "#1a1a1a" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </section>

        {/* ------------------------------------------ */}
        {/* Top Products Bar Chart                     */}
        {/* ------------------------------------------ */}
        <section className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h3 className="mb-4 text-lg font-medium">Top-Selling Products</h3>

          <p className="text-slate-400 text-sm mb-4">
            Ranking of products by total units sold, based on cleaned ETL output.
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

              <XAxis dataKey="productName" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />

              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    {...props}
                    formatValue={(val: any) => `${val} units`}
                  />
                )}
              />

              <Bar dataKey="units" fill="#38bdf8" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* ------------------------------------------ */}
        {/* Order Count Area Chart                     */}
        {/* ------------------------------------------ */}
        <section className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
          <h3 className="mb-4 text-lg font-medium">Daily Order Volume</h3>

          <p className="text-slate-400 text-sm mb-4">
            Total number of orders processed each day across the selected week.
          </p>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={orderCount}>
              <defs>
                <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                tickFormatter={(value) => formatWeekday(value)}
                interval={0}
                tickMargin={10}
              />

              <YAxis stroke="#94a3b8" />

              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    {...props}
                    formatLabel={formatWeekday}
                    formatValue={(val: any) => `${val} orders`}
                  />
                )}
              />

              <Area
                type="monotone"
                dataKey="orders"
                stroke="#6366f1"
                fill="url(#colorOrders)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>
      </div>
    </main>
  );
}
