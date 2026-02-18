import React from "react";

const SupplierName = ({ values = [], selectedSupplier, onSelectSupplier }) => {
  // ✅ Remove duplicates & ignore empty/null/undefined
  const uniqueValues = [...new Set(values.filter(Boolean))];

  return (
    <div className="bg-[var(--card)] p-4 h-16 rounded-md shadow border  border-[var(--border)] flex justify-between items-center ">
      <div className="text-sm font-semibold text-[var(--primary)] ">
        Supplier Names
      </div>

      {uniqueValues.length === 0 ? (
        <div className="text-[var(--muted-foreground)] text-sm">No data found</div>
      ) : (
        <div className="flex flex-col max-h-10 ml-3 overflow-y-auto scrollbar-hide gap-2 py-1">
          {uniqueValues.map((item, idx) => {
            const isActive = selectedSupplier === item;
            return (
              <span
                key={idx}
                onClick={() => onSelectSupplier(item)}
                className={`
                  px-3 py-1 text-sm border rounded-md cursor-pointer transition-all
                  ${isActive
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent scale-105"
                    : "bg-white/40 border-gray-300 hover:bg-white/60 text-gray-700"
                  }
                `}
              >
                {item}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SupplierName;
