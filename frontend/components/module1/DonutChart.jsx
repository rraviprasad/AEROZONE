import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const PlannedOrderDonut = ({ plannedStats = {} }) => {
  const { percentage, completed, pending } = useMemo(() => {
    const completed = plannedStats.completed || 0;
    const pending = plannedStats.pending || 0;
    const total = completed + pending;

    return {
      completed,
      pending,
      percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    };
  }, [plannedStats]);

  if (completed + pending === 0) {
    return (
      <div className="bg-[var(--color-background)] dark:bg-[var(--color-card)] rounded-[var(--radius)] p-6 w-full flex flex-col items-center border border-[var(--color-border)]">
        <p className="text-[var(--color-muted-foreground)] text-sm">
          No Planned Orders
        </p>
      </div>
    );
  }

  const data = {
    labels: ["YES", "NO"],
    datasets: [
      {
        data: [completed, pending],
        backgroundColor: [
          "oklch(0.6723 0.1606 244.9955)", // completed (blue)
          "oklch(0.6188 0.2376 25.7658)",  // pending (orange)
        ],
        hoverBackgroundColor: [
          "oklch(0.6723 0.1606 244.9955)",
          "oklch(0.6188 0.2376 25.7658)",
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: "75%",
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        padding: 6,
        bodySpacing: 2,
        boxWidth: 6,
        boxHeight: 6,
        titleFont: { size: 10 },
        bodyFont: { size: 10 },
      },
    },
    elements: {
      arc: {
        borderRadius: 50,
      },
    },
  };

  return (
    <div className="bg-[var(--color-background)] dark:bg-[var(--color-card)] border border-[var(--color-border)] w-62 rounded-[var(--radius)] p-2 flex flex-col items-center shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-all duration-300">

      <h2 className="text-md font-semibold text-[var(--color-foreground)] mb-2 text-center">
        Planned Orders
      </h2>

      <div className="relative flex justify-center items-center w-[80px] md:w-[100px] lg:w-[130px] h-[60px] md:h-[80px] lg:h-[100px]">
        <Doughnut data={data} options={options} />

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
          <span className="text-md font-bold text-[var(--color-foreground)]">
            {percentage}%
          </span>
          <span className="text-xs text-[var(--color-muted-foreground)]">
            Completed
          </span>
        </div>
      </div>

      <p className="text-xs mt-3 text-[var(--color-muted-foreground)]">
        Completed: <span className="text-[var(--color-foreground)]">{completed}</span>
        {" "}•{" "}
        Pending: <span className="text-[var(--color-foreground)]">{pending}</span>
      </p>
    </div>
  );
};

export default PlannedOrderDonut;
