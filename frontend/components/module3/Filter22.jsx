import React, { useMemo, useState, useEffect } from "react";
import { motion, useAnimation } from "motion/react";

// Debounce Hook (New)
function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
}

// Magnet component
const Magnet = ({
    width = 28,
    height = 28,
    strokeWidth = 2,
    stroke = "#9333ea", // Changed to purple-600
}) => {
    const controls = useAnimation();
    return (
        <div
            style={{
                cursor: "pointer",
                userSelect: "none",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
            onMouseEnter={() => controls.start("animate")}
            onMouseLeave={() => controls.start("normal")}
        >
            <motion.svg
                xmlns="http://www.w3.org/2000/svg"
                width={width}
                height={height}
                viewBox="0 0 24 24"
                fill="none"
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={{
                    normal: { scale: 1, rotate: 0, y: 0 },
                    animate: {
                        scale: [1, 1.04, 1],
                        rotate: [0, -8, 8, -8, 0],
                        y: [0, -2, 0],
                        transition: { duration: 0.6, ease: "easeInOut" },
                    },
                }}
                animate={controls}
            >
                <path d="m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15" />
                <path d="m5 8 4 4" />
                <path d="m12 15 4 4" />
            </motion.svg>
        </div>
    );
};

export default function Filters({ filters, setFilters, applyFilters, rows }) {
    const { search, itemCode, description, refStart, refEnd, projectCode } = filters;

    // ✅ Debounced fields
    const debouncedSearch = useDebounce(search);
    const debouncedDescription = useDebounce(description);

    // Send debounced values to parent filtering logic (but only when applyFilters is clicked)
    useEffect(() => {
        setFilters(f => ({ ...f, search: debouncedSearch, description: debouncedDescription }));
    }, [debouncedSearch, debouncedDescription, setFilters]);

    // ✅ Extract item codes once from rows
    const itemCodes = useMemo(
        () => [...new Set(rows.map((r) => r.ItemCode || r.ITEM_CODE))].filter(Boolean),
        [rows]
    );
    const projectCodes = useMemo(
        () => [...new Set(rows.map((r) => r.ProjectCode || r.PROJECT_CODE))].filter(Boolean),
        [rows]
    );

    return (
        <div className="mb-1 h-fit relative drop-shadow-lg hover:drop-shadow-xl transition-all duration-300">
            <div className="bg-gradient-to-br from-purple-600 to-purple-900 rounded-lg  p-[1px] h-full">
                <div className="bg-black rounded-lg p-2 h-13">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            applyFilters();
                        }}
                        className="flex flex-col md:flex-row gap-2 items-center w-full"
                    >

                        <a href="/" className="shrink-0">
                            <h1 className="text-3xl font-bold tracking-wide bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent uppercase drop-shadow-lg shadow-purple-500/50">ORBIT</h1>
                        </a>

                        {/* Search */}
                        <div className="flex-1 w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="🔍 Search"
                                value={search}
                                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                                className="w-full px-3 py-1.5 border border-purple-700/50 bg-[#111111] text-purple-200 placeholder-purple-700 text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                            />
                        </div>

                        {/* Item Code Dropdown */}
                        <div className="flex-1 w-full md:w-auto">
                            <select
                                value={itemCode}
                                onChange={(e) => setFilters(f => ({ ...f, itemCode: e.target.value }))}
                                className="w-full px-3 py-1.5 border border-purple-700/50 bg-[#111111] text-purple-200 text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                            >
                                <option value="" className="bg-black">All Item Codes</option>
                                {itemCodes.map((ic) => (
                                    <option key={ic} value={ic} className="bg-black">
                                        {ic}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 w-full md:w-auto">
                            <select
                                value={projectCode}
                                onChange={(e) => setFilters(f => ({ ...f, projectCode: e.target.value }))}
                                className="w-full px-3 py-1.5 border border-purple-700/50 bg-[#111111] text-purple-200 text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                            >
                                <option value="" className="bg-black">All Project Codes</option>
                                {projectCodes.map((pc) => (
                                    <option key={pc} value={pc} className="bg-black">
                                        {pc}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="flex-[2] w-full md:w-auto">
                            <input
                                type="text"
                                placeholder="Description"
                                value={description}
                                onChange={(e) => setFilters(f => ({ ...f, description: e.target.value }))}
                                className="w-full px-3 py-1.5 border border-purple-700/50 bg-[#111111] text-purple-200 placeholder-purple-700 text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                            />
                        </div>

                        {/* Ref Start */}
                        <div className="w-full md:w-32">
                            <input
                                type="number"
                                placeholder="Ref B Start"
                                value={refStart}
                                onChange={(e) => setFilters(f => ({ ...f, refStart: e.target.value }))}
                                className="w-full px-3 py-1.5 border border-purple-700/50 bg-[#111111] text-purple-200 placeholder-purple-700 text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                            />
                        </div>

                        {/* Ref End */}
                        <div className="w-full md:w-32">
                            <input
                                type="number"
                                placeholder="Ref B End"
                                value={refEnd}
                                onChange={(e) => setFilters(f => ({ ...f, refEnd: e.target.value }))}
                                className="w-full px-3 py-1.5 border border-purple-700/50 bg-[#111111] text-purple-200 placeholder-purple-700 text-xs focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                            />
                        </div>

                        {/* Apply Button */}
                        <button
                            type="submit"
                            className="w-10 h-10 flex items-center justify-center rounded-lg bg-purple-600 hover:bg-purple-500 text-white p-1.5 shadow-md hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 hover:scale-105 shrink-0"
                        >
                            <Magnet stroke="#ffffff" width={20} height={20} />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}