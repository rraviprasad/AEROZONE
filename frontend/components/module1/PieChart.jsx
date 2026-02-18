import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieCharts({ rows = [], indentRows, singleChart = false }) {
  // Helper to group by ProjectCode and sum fields
  const groupByProject = (key) => {
    const grouped = {};
    rows.forEach((row) => {
      const project = row.ProjectCode || "Unknown";
      grouped[project] = (grouped[project] || 0) + (Number(row[key]) || 0);
    });
    return grouped;
  };

  // Data grouping
  const projectOrderQty = groupByProject("OrderedLineQuantity");
  const projectIndentQty = groupByProject("IndentQuantity");
  const projectOrderValue = groupByProject("OrderLineValue");
  const projectInventoryValue = groupByProject("InventoryValue");

  // Chart data builder
  const buildChartData = (dataObj, label) => ({
    labels: Object.keys(dataObj),
    datasets: [
      {
        label,
        data: Object.values(dataObj),
        backgroundColor: [
          "#4ade80", "#60a5fa", "#f87171", "#facc15",
          "#a78bfa", "#fb923c", "#22d3ee", "#2dd4bf",
        ],
        borderWidth: 1,
      },
    ],
  });

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  const charts = singleChart
    ? [{ title: "PROJECT DISTRIBUTION", data: projectOrderQty, label: "Order Qty" }]
    : [
      { title: "PROJECT DISTRIBUTION", data: projectOrderQty, label: "Order Qty" },
      { title: "INDENT QUANTITY DISTRIBUTION", data: projectIndentQty, label: "Indent Qty" },
      { title: "ORDER VALUE DISTRIBUTION", data: projectOrderValue, label: "Order Value" },
      { title: "INVENTORY QUANTITY DISTRIBUTION", data: projectInventoryValue, label: "Inventory Value" },
    ];

  if (singleChart) {
    return (
      <div className="relative h-full flex justify-center items-center">
        <Pie
          data={buildChartData(charts[0].data, charts[0].label)}
          options={chartOptions}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full px-2 overflow-y-auto scrollbar-hide">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 h-full">
        {charts.map((chart, idx) => (
          <div
            key={idx}
            className="bg-[var(--card)] rounded-lg border border-[var(--border)] p-2 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center mb-3">
              <div className="h-5 w-1 bg-[var(--primary)] mr-2 rounded-sm"></div>
              <h2 className="text-sm md:text-[13px] font-semibold text-[var(--foreground)]">
                {chart.title}
              </h2>
            </div>

            <div className="relative h-[80px] flex justify-center items-center">
              <Pie
                data={buildChartData(chart.data, chart.label)}
                options={chartOptions}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
