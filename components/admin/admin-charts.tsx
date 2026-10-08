"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { analytics as defaultAnalytics } from "@/lib/data";

export type ChartDataPoint = {
  month: string;
  revenue: number;
  enrollments: number;
};

export function RevenueChart({ data }: { data?: ChartDataPoint[] }) {
  const chartData = data && data.length > 0 ? data : defaultAnalytics;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="revenue" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#2f7d4f" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#2f7d4f" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#dbe6d5" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value: any) => [`₹${Number(value).toLocaleString("en-IN")}`, "Revenue"]}
          />
          <Area type="monotone" dataKey="revenue" stroke="#2f7d4f" fill="url(#revenue)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EnrollmentChart({ data }: { data?: ChartDataPoint[] }) {
  const chartData = data && data.length > 0 ? data : defaultAnalytics;

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dbe6d5" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value: any) => [`${value} Students`, "Enrollments"]}
          />
          <Bar dataKey="enrollments" fill="#bd6b42" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
