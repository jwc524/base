"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminCard, adminMuted } from "@/lib/admin-styles";
import { cn } from "@/lib/utils";

type SignupPoint = {
  date: string;
  signups: number;
};

export function SignupsChart({ data }: { data: SignupPoint[] }) {
  return (
    <div className={cn(adminCard, "p-6")}>
      <h2 className={cn("text-sm font-medium", adminMuted)}>
        User signups (last 90 days)
      </h2>
      <div className="mt-6 h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#71717a", fontSize: 11 }}
              tickFormatter={(value: string) => value.slice(5)}
              stroke="#3f3f46"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "#71717a", fontSize: 11 }}
              stroke="#3f3f46"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "0.375rem",
                color: "#fafafa",
              }}
              labelStyle={{ color: "#a1a1aa" }}
            />
            <Line
              type="monotone"
              dataKey="signups"
              stroke="#a1a1aa"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#e4e4e7" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
