import React, { useMemo, useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

// Debounce Hook (New)
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

/* ---------------- Magnet Icon ---------------- */
const Magnet = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#fafafa",
}) => {
  const controls = useAnimation();
  return (
    <div
      className="cursor-pointer select-none p-2 flex items-center justify-center"
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
  const inputClass =
    "w-full px-3 py-1.5 text-xs rounded-md bg-zinc-900 border border-zinc-400 text-zinc-100 placeholder-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition";

  return (
    <div className="mb-1">
      <div className="bg-zinc-900 border  border-white/30 rounded-xl p-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyFilters();
          }}
          className="flex flex-col md:flex-row gap-3 justify-between items-center "
        >
          {/* Title */}
          <a href="/" className="shrink-0">
            <h1 className="text-xl font-semibold tracking-wide text-zinc-100 uppercase">
              ANALYZE
            </h1>
          </a>

          {/* Search */}
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            className={`${inputClass} text-zinc-50`}
          />

          {/* Item Code */}
          <select
            value={itemCode}
            onChange={(e) => setFilters(f => ({ ...f, itemCode: e.target.value }))}
            className={inputClass}
          >
            <option value="">All Item Codes</option>
            {itemCodes.map(ic => (
              <option key={ic} value={ic}>
                {ic}
              </option>
            ))}
          </select>

          {/* Project Code */}
          <select
            value={projectCode}
            onChange={(e) => setFilters(f => ({ ...f, projectCode: e.target.value }))}
            className={inputClass}
          >
            <option value="">All Project Codes</option>
            {projectCodes.map(pc => (
              <option key={pc} value={pc}>
                {pc}
              </option>
            ))}
          </select>

          {/* Description */}
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setFilters(f => ({ ...f, description: e.target.value }))}
            className={inputClass}
          />

          {/* Ref Start */}
          <input
            type="number"
            placeholder="Ref B Start"
            value={refStart}
            onChange={(e) => setFilters(f => ({ ...f, refStart: e.target.value }))}
            className={inputClass}
          />

          {/* Ref End */}
          <input
            type="number"
            placeholder="Ref B End"
            value={refEnd}
            onChange={(e) => setFilters(f => ({ ...f, refEnd: e.target.value }))}
            className={inputClass}
          />

          {/* Apply */}
          <button
            type="submit"
            className="w-10 h-10 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 flex items-center justify-center transition"
          >
            <Magnet width={18} height={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
