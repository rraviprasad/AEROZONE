import React, { useMemo } from "react";

export default function ReferenceBList({ rows, selectedRef, onSelectRef }) {
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
    return (
      <div className="p-4 text-sm text-gray-500 italic">
        No ReferenceB values found.
      </div>
    );
  }

  return (
    <div className="p-4 bg-[var(--card)] w-full  rounded-lg shadow border  border-[var(--border)]">
      <h3 className="text-xs font-semibold mb-1 text-[var(--foreground)]">
        Reference B List
      </h3>

      {/* Scrollable List Container */}
      <div className="max-h-8 overflow-y-auto scrollbar-hide pr-1">
        <ul className="grid grid-cols-4  gap-2">
          {/* ALL BUTTON */}
          <li
            onClick={() => onSelectRef(null)}
            className={`px-7 py-1 text-xs  w-fit h-fit rounded cursor-pointer transition ${selectedRef === null
                ? "bg-blue-600 text-white"
                : "bg-gray-50 hover:bg-blue-300 text-[var(--foreground)] dark:text-white dark:bg-gray-700 dark:hover:bg-blue-400"
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
                className={`px-5 py-1 text-xs w-fit h-fit rounded cursor-pointer transition ${isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-50 hover:bg-blue-300 text-[var(--foreground)] dark:text-white dark:bg-gray-700 dark:hover:bg-blue-400"
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
}
