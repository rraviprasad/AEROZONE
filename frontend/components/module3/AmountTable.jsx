import React, { useMemo } from "react";

const AmountTable = ({ rows = [] }) => {

    // ✅ Group & sum data by SupplierName
    const aggregatedData = useMemo(() => {
        const map = {};

        rows.forEach(row => {
            const supplier = row.SupplierName;
            if (!supplier) return;

            if (!map[supplier]) {
                map[supplier] = {
                    SupplierName: supplier,
                    TotalQuantity: 0,
                    UOM: row.UOM || "-",
                    TotalValue: 0,
                    Currency: row.Currency || "-"
                };
            }

            map[supplier].TotalQuantity += Number(row.OrderedLineQuantity) || 0;
            map[supplier].TotalValue += Number(row.OrderLineValue) || 0;
        });

        return Object.values(map);
    }, [rows]);

    return (
        <div className="bg-black text-xs rounded-lg p-2 shadow-lg h-fit  border border-purple-700/80">
            <h3 className="text-sm font-semibold text-center text-white mb-1 ">
                Supplier Amount Summary
                <span className="text-white text-xs ml-2">
                    ({aggregatedData.length})
                </span>
            </h3>

            {aggregatedData.length === 0 ? (
                <div className="text-purple-500 ">No data found</div>
            ) : (
                <div className="overflow-y-auto max-h-45  scrollbar-hide  rounded-xl border border-purple-700/30">
                    <table className="min-w-full  border border-purple-700/40  ">

                        <thead className="sticky top-0 z-10 text-[11px] bg-purple-700  text-white">
                            <tr>
                                <th className="px-3 py-2  text-left">SUPPLIER</th>
                                <th className="px-2 py-2  text-right">Total Qty</th>
                                <th className="px-2 py-2  text-center">UOM</th>
                                <th className="px-2 py-2  text-right">Total Value</th>
                                <th className="px-2 py-2  text-center">Currency</th>
                            </tr>
                        </thead>

                        <tbody>
                            {aggregatedData.map((row, idx) => (
                                <tr
                                    key={idx}
                                    className="border-t border-white/30 hover:bg-purple-900/40 transition  "
                                >
                                    <td className="px-2 py-2 text-[10px]  text-white">{row.SupplierName}</td>
                                    <td className="px-2 py-2 text-[10px]  text-right text-white">
                                        {row.TotalQuantity.toFixed(2)}
                                    </td>
                                    <td className="px-2 py-2 text-[10px]  text-center text-white">{row.UOM}</td>
                                    <td className="px-2 py-2 text-[10px]  text-right text-white">
                                        {row.TotalValue.toLocaleString()}
                                    </td>
                                    <td className="px-2 py-2 text-[10px]  text-center text-white">
                                        {row.Currency}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>

            )}
        </div>
    );
};

export default AmountTable;
