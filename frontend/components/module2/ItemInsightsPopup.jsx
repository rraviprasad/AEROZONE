import React from "react";

const ItemInsightsPopup = ({ rows, isOpen, onClose }) => {
    if (!isOpen) return null;

    const referenceGroups = rows.reduce((acc, row) => {
        const ref = row.ReferenceB || row["REF_B"] || row["Reference B"] || row["REFB"] || "Unknown";
        if (!acc[ref]) acc[ref] = [];
        acc[ref].push(row);
        return acc;
    }, {});

    const insightData = Object.keys(referenceGroups).map(ref => {
        const group = referenceGroups[ref];
        const total = group.length;
        const plannedCompleted = group.filter(r => Number(r.OrderedQty) > 0).length;
        const orderCompleted = group.filter(r => (Number(r.RequiredQty) - Number(r.OrderedQty)) <= 5).length;

        return {
            ref,
            plannedPercent: Math.round((plannedCompleted / total) * 100),
            orderPercent: Math.round((orderCompleted / total) * 100)
        };
    });

    const Bar = ({ percent, colorClass }) => (
        <div className="w-full h-3 bg-muted rounded-md overflow-hidden">
            <div
                className={`h-full rounded-md transition-all duration-700 ease-out ${colorClass}`}
                style={{ width: `${percent}%` }}
            ></div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            {/* 🔥 Gradient Border Wrapper */}
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-[2px] clip-angled w-[92vw]   max-w-7xl  flex flex-col shadow-2xl ">

                {/* 🔥 Inner Themed Card */}
                <div className="bg-[var(--color-card)]  p-6 flex flex-col text-[var(--color-foreground)] relative clip-angled">

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] clip-angled w-10 h-10 flex items-center justify-center font-bold text-xl hover:scale-[1.05] transition-transform"
                    >
                        ×
                    </button>

                    <h2 className="text-2xl font-semibold mb-5 text-center">
                        Item Insights Overview
                    </h2>

                    <div className="overflow-auto flex-1 rounded-lg bg-[var(--color-background)]/40">
                        <table className="w-full border-collapse text-sm">
                            {/* Thead with gradient border */}
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-gradient-to-br from-orange-600 to-orange-800">
                                    <th className="p-3 text-left text-white">ReferenceB</th>
                                    <th className="p-3 text-center text-white">Planned Order Status</th>
                                    <th className="p-3 text-center text-white">Order Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {insightData.map((row, i) => (
                                    <tr
                                        key={i}
                                        className="border-b border-[var(--color-border)] hover:bg-[var(--color-muted-foreground)]/20 transition"
                                    >
                                        <td className="p-3 font-medium">{row.ref}</td>

                                        {/* Planned order (green meaning success) */}
                                        <td className="p-3">
                                            <Bar percent={row.plannedPercent} colorClass="bg-green-500 dark:bg-green-600" />
                                            <p className="text-sm text-center mt-1 font-semibold">
                                                {row.plannedPercent}% {row.plannedPercent === 100 ? "Completed" : "Pending"}
                                            </p>
                                        </td>

                                        {/* Order Status (theme primary) */}
                                        <td className="p-3">
                                            <Bar percent={row.orderPercent} colorClass="bg-gradient-to-r from-orange-600 to-orange-800" />
                                            <p className="text-sm text-center mt-1 font-semibold">
                                                {row.orderPercent}% {row.orderPercent === 100 ? "Completed" : "Pending"}
                                            </p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ItemInsightsPopup;
