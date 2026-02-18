import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AnalysisComboChart({ data = [] }) {
  const [selectedYear, setSelectedYear] = useState(null);

  /* -------------------- Get Available Years -------------------- */
  const years = useMemo(() => {
    const yearSet = new Set();

    data.forEach((row) => {
      if (!row.PlannedReceiptDate) return;
      yearSet.add(new Date(row.PlannedReceiptDate).getFullYear());
    });

    const sortedYears = Array.from(yearSet).sort((a, b) => b - a);

    // auto-select latest year
    if (!selectedYear && sortedYears.length) {
      setSelectedYear(sortedYears[0]);
    }

    return sortedYears;
  }, [data, selectedYear]);

  /* -------------------- Chart Data (Year Filtered) -------------------- */
  const chartData = useMemo(() => {
    if (!selectedYear) return [];

    const dayMap = new Map();

    data.forEach((row) => {
      if (!row.PlannedReceiptDate) return;

      const dateObj = new Date(row.PlannedReceiptDate);
      const year = dateObj.getFullYear();
      if (year !== selectedYear) return;

      const dayKey = dateObj.toISOString().split("T")[0];

      const qty = Number(row.OrderedLineQuantity) || 0;
      const value = Number(row.OrderLineValue) || 0;

      if (!dayMap.has(dayKey)) {
        dayMap.set(dayKey, {
          date: dayKey,
          totalQuantity: 0,
          totalValue: 0,
        });
      }

      const entry = dayMap.get(dayKey);
      entry.totalQuantity += qty;
      entry.totalValue += value;
    });

    return Array.from(dayMap.values()).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [data, selectedYear]);

  return (
    <div className="w-full h-60 bg-black border border-zinc-800 p-3 rounded-xl">

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <span className="h-4 w-1 bg-zinc-500 mr-2"></span>
          <h3 className="text-sm font-semibold text-zinc-100 tracking-wide">
            ORDER VALUE VS QUANTITY
          </h3>
        </div>

        {/* Year Toggle */}
        <div className="flex gap-1">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-2 py-1 text-xs rounded-md border transition
                ${
                  selectedYear === year
                    ? "bg-zinc-100 text-black border-zinc-100"
                    : "bg-transparent text-zinc-400 border-zinc-700 hover:text-zinc-100"
                }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[200px] w-full mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid
              stroke="#52525b"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleString("en-US", { month: "short" })
              }
              minTickGap={40}
              tick={{ fill: "#d4d4d8", fontSize: 11 }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={{ stroke: "#3f3f46" }}
            />

            <YAxis
              yAxisId="left"
              tick={{ fill: "#d4d4d8", fontSize: 11 }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={{ stroke: "#3f3f46" }}
              label={{
                value: "Order Value",
                angle: -90,
                position: "insideLeft",
                style: { fill: "#a1a1aa", fontSize: 11 },
              }}
            />

            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: "#d4d4d8", fontSize: 11 }}
              axisLine={{ stroke: "#3f3f46" }}
              tickLine={{ stroke: "#3f3f46" }}
              label={{
                value: "Order Quantity",
                angle: 90,
                offset: -2,
                position: "insideRight",
                style: { fill: "#a1a1aa", fontSize: 11 },
              }}
            />

            <Tooltip
              labelFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              }
              cursor={false}
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                borderRadius: "6px",
                color: "#fafafa",
                fontSize: "11px",
              }}
            labelStyle={{ color: "#a1a1aa" }}
            />

            <Legend wrapperStyle={{ fontSize: "11px", color: "#e4e4e7" }} />

            <Bar
              yAxisId="right"
              dataKey="totalQuantity"
              name="Order Quantity"
              barSize={26}
              fill="#a1a1aa"
              radius={[4, 4, 0, 0]}
            />

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="totalValue"
              name="Order Value"
              stroke="#fafafa"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
