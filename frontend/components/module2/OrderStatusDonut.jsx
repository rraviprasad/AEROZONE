import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const OrderStatusDonut = ({ filteredRows = [] }) => {
  // Unique Pending & Completed by UNIQUE_CODE
  const { pending, completed, percentage, datasets } = useMemo(() => {
    const completedSet = new Set(
      filteredRows
        .filter((r) => r.OrderStatus === "YES")
        .map((r) => r.UNIQUE_CODE)
    );

    const pendingSet = new Set(
      filteredRows
        .filter((r) => r.OrderStatus === "NO")
        .map((r) => r.UNIQUE_CODE)
    );

    const completed = completedSet.size;
    const pending = pendingSet.size;
    const total = completed + pending;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

    const datasets = [
      {
        data: [completed, pending],
        backgroundColor: [
          "#16a34a", // Green-600 - Completed (using green for contrast)
          "#ea580c", // Orange-600 - Pending
        ],
        borderWidth: 0,
        hoverBackgroundColor: [
          "#22c55e", // Green-500 - Completed hover
          "#f97316", // Orange-500 - Pending hover
        ],
      },
    ];

    return { pending, completed, percentage, datasets };
  }, [filteredRows]);

  const total = pending + completed;
  if (total === 0) {
    return (
      <div className="relative w-full drop-shadow-lg">
        <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-[1px] clip-angled">
          <div className="bg-black clip-angled p-4 flex flex-col items-center text-center">
            <p className="text-orange-400 text-sm">No Order Status Data</p>
            <p className="text-orange-500 text-xs">Try clearing filters</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full group transition-all duration-300 drop-shadow-lg hover:drop-shadow-xl">
      <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-[1px] clip-angled h-full">
        <div className="bg-black clip-angled p-3 flex flex-col items-center h-full w-full">

          <h2 className="text-md font-semibold text-white mb-2 text-center">
            Order Status
          </h2>

      <div className="relative flex justify-center items-center w-[90px] md:w-[110px] lg:w-[140px]  ">

        <div className="z-50 flex justify-center items-center w-[80px] md:w-[100px] lg:w-[130px] h-[90px] md:h-[110px] lg:h-[140px]">
            <Doughnut
              data={{
                labels: ["Completed", "Pending"],
                datasets,
              }}
              options={{
                cutout: "75%",
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    enabled: true,
                    padding: 6,
                    bodySpacing: 2,
                    boxWidth: 6,
                    boxHeight: 6,
                    caretSize: 4,
                    cornerRadius: 4,
                    titleFont: { size: 10 },
                    bodyFont: { size: 10 },
                    backgroundColor: 'rgba(31, 41, 55, 0.95)', // Dark background for tooltip
                    titleColor: '#fb923c', // Orange for title
                    bodyColor: '#fed7aa', // Light orange for body
                    borderColor: '#ea580c', // Orange border
                    borderWidth: 1,
                  },
                },
                elements: {
                  arc: {
                    borderWidth: 0,
                    borderRadius: 50,
                  },
                },
              }}
            />
        </div>

            {/* Center Percentage */}
            <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
              <span className="text-xl font-bold text-white drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]">{percentage}%</span>
              <span className="text-sm text-gray-300">
                {/* {percentage === 100 ? "Completed" : "Pending"} */}
                Ordered
              </span>
            </div>
          </div>

          <p className="text-xs mt-3 text-gray-300">
            Completed: <span className="text-green-400">{completed}</span> • Pending: <span className="text-orange-400">{pending}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderStatusDonut;
