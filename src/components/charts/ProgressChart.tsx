"use client";

import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

interface ProgressChartProps {
  data: Array<{ date: string; amount: number }>;
  days?: number;
}

export default function ProgressChart({ data, days = 30 }: ProgressChartProps) {
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const result = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayData = data.filter((d) => d.date.startsWith(dateStr));
      const total = dayData.reduce((sum, d) => sum + d.amount, 0);

      result.push({
        date: format(date, "MMM d"),
        fullDate: dateStr,
        total,
      });
    }

    return result;
  }, [data, days]);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            className="text-gray-500 dark:text-gray-400"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            className="text-gray-500 dark:text-gray-400"
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--tooltip-bg, #fff)",
              border: "1px solid var(--tooltip-border, #e5e7eb)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelClassName="font-medium"
            formatter={(value: number) => [`${value} pushups`, "Total"]}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
