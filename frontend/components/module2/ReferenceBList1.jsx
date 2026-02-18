import React, { useMemo } from "react";

export default function ReferenceBList({ rows, selectedRef, onSelectRef, bare = false }) {
    // Extract unique ReferenceB values from current filtered rows
    const referenceBValues = useMemo(() => {
        const unique = new Set();
        rows.forEach((r) => {
            const ref = String(r.ReferenceB || "").trim();
            if (ref && ref !== "N/A" && ref !== "NA" && ref !== "0") {
                unique.add(ref);
            }
        });
        return [...unique];
    }, [rows]);

    if (referenceBValues.length === 0) {
        if (bare) return <div className="text-orange-500 text-sm italic p-2">0 References</div>; // Simple fallback for bare mode
        return (
            <div className="relative w-full drop-shadow-lg">
                <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-[1px] clip-angled">
                    <div className="bg-black/90 clip-angled p-4 text-sm text-orange-500 italic">
                        No Reference B values found
                    </div>
                </div>
            </div>
        );
    }

    const content = (
        <div className={`w-full flex flex-col max-h-17 ${bare ? "" : "bg-black/90 clip-angled p-3"} bg-black`}>
            <h3 className="text-xs font-semibold mb-1 text-orange-400 shrink-0">
                Reference B List
                <span className="text-orange-300 text-xs ml-2">
                    ({referenceBValues.length})
                </span>
            </h3>

            {/* Scrollable List Container */}
            <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
                <ul className="space-y-1 text-xs grid grid-cols-1 md:grid-cols-4 gap-2">
                    {/* ALL BUTTON */}
                    <li
                        onClick={() => onSelectRef(null)}
                        className={`w-full px-2 py-1 clip-angled cursor-pointer transition-all duration-200 text-center ${selectedRef === null
                            ? "bg-orange-600 text-white shadow-md shadow-orange-500/30"
                            : "bg-gray-800 hover:bg-orange-900/30 text-white hover:text-orange-200 border border-orange-700/50"
                            }`}
                    >
                        All
                    </li>

                    {/* Dynamic ReferenceB Values */}
                    {referenceBValues.map((ref, i) => {
                        const isActive = selectedRef === ref;
                        return (
                            <li
                                key={i}
                                onClick={() => onSelectRef(isActive ? null : ref)}
                                className={`px-2 py-1 clip-angled cursor-pointer transition-all duration-200 text-center ${isActive
                                    ? "bg-orange-600 text-white shadow-md shadow-orange-500/30"
                                    : "bg-orange-900/60 hover:bg-orange-900 text-white hover:text-orange-200 border border-orange-700/50 h-fit"
                                    }`}
                            >
                                {ref}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );

    if (bare) return content;

    return (
        <div className="relative w-full h-fit group transition-all duration-300 drop-shadow-lg hover:drop-shadow-xl">
            <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-[1px] clip-angled h-full">
                <div className="bg-black clip-angled">

                {content}
                </div>
            </div>
        </div>
    );
}
