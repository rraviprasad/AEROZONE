import React, { useState } from "react";

// FileChartColumn component included directly
const FileChartColumn = ({ 
  width = 28, 
  height = 28, 
  strokeWidth = 2, 
  stroke = "#ffffff", 
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 24 24"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path
          d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
          style={{
            strokeDasharray: isHovered ? "100" : "0",
            strokeDashoffset: "0",
            transition: "stroke-dasharray 0.3s ease, opacity 0.15s ease",
            opacity: isHovered ? 1 : 0.7
          }}
        />
        <path
          d="M14 2v4a2 2 0 0 0 2 2h4"
          style={{
            strokeDasharray: isHovered ? "100" : "0",
            strokeDashoffset: "0",
            transition: "stroke-dasharray 0.3s ease, opacity 0.15s ease",
            transitionDelay: isHovered ? "0.1s" : "0s",
            opacity: isHovered ? 1 : 0.7
          }}
        />
        <path
          d="M8 18v-1"
          style={{
            strokeDasharray: isHovered ? "100" : "0",
            strokeDashoffset: "0",
            transition: "stroke-dasharray 0.3s ease, opacity 0.15s ease",
            transitionDelay: isHovered ? "0.2s" : "0s",
            opacity: isHovered ? 1 : 0.7
          }}
        />
        <path
          d="M12 18v-6"
          style={{
            strokeDasharray: isHovered ? "100" : "0",
            strokeDashoffset: "0",
            transition: "stroke-dasharray 0.3s ease, opacity 0.15s ease",
            transitionDelay: isHovered ? "0.3s" : "0s",
            opacity: isHovered ? 1 : 0.7
          }}
        />
        <path
          d="M16 18v-3"
          style={{
            strokeDasharray: isHovered ? "100" : "0",
            strokeDashoffset: "0",
            transition: "stroke-dasharray 0.3s ease, opacity 0.15s ease",
            transitionDelay: isHovered ? "0.4s" : "0s",
            opacity: isHovered ? 1 : 0.7
          }}
        />
      </svg>
    </div>
  );
};

export default function DataTable({ rows }) {
  // State for managing column visibility
  const [visibleColumns, setVisibleColumns] = useState(
    Array(18).fill(false).map((_, index) => index < 6) // First 6 columns visible by default
  );
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // ✅ Copy table to clipboard
  const copyTable = () => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    let text = headers.join("\t") + "\n";
    rows.forEach((row) => {
      text += headers.map((h) => row[h] ?? "").join("\t") + "\n";
    });
    navigator.clipboard
      .writeText(text)
      .then(() => alert("✅ Table copied to clipboard!"))
      .catch(() => alert("❌ Failed to copy"));
  };

  // ✅ Table headers
  const headers = [
    "Project Code",
    "Item Code",
    "Description",
    "Type",
    "Supplier Name",
    "PO No.",
    "Date",
    "Ordered Qty",
    "UOM",
    "Order Value",
    "Currency",
    "Planned Receipt Date",
    "Delivery",
    "Inventory Qty",
    "Inventory UOM",
    "Inventory Value",
    "Indent Qty",
    "Indent UOM",
    "Indent Planned Order",
  ];

  // Column definitions
  const columnDefs = [
    { row: "ProjectCode" },
    { row: "ItemCode" },
    { row: "ItemShortDescription" },
    { row: "Type" },
    { row: "SupplierName" },
    { row: "PONo" },
    { row: "Date" },
    { row: "OrderedLineQuantity" },
    { row: "UOM" },
    { row: "OrderLineValue" },
    { row: "Currency" },
    { row: "PlannedReceiptDate" },
    { row: "Delivery" },
    { row: "InventoryQuantity" },
    { row: "InventoryUOM" },
    {
      row: "InventoryValue",
      format: (value) =>
        value != null ? Number(value).toFixed(2) : "",
    },
    { row: "IndentQuantity" },
    { row: "IndentUOM" },
    { row: "IndentPlannedOrder" },
  ];

  // Toggle column visibility
  const toggleColumn = (index) => {
    const newVisibleColumns = [...visibleColumns];
    newVisibleColumns[index] = !newVisibleColumns[index];
    setVisibleColumns(newVisibleColumns);
  };

  // Get visible column count
  const visibleColumnCount = visibleColumns.filter(Boolean).length;

  return (
    <div className="p-2 text-xs rounded-xl w-full max-w-fit mx-auto">
      {/* Header + Buttons */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center">
          <span className="h-5 w-1 bg-[var(--primary)] mr-2"></span>
          DATA TABLE
        </h2>

        <div className="flex gap-2 ">
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white py-2 px-2 rounded-lg text-sm flex items-center shadow-md h-10 w-13 transition"
          >
            <FileChartColumn 
              width={20} 
              height={20} 
              stroke="#ffffff" 
            />
          </button>
        </div>
      </div>

      {/* Column Selector */}
      {showColumnSelector && (
        <div className="mb-4 p-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Select Columns to Display
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setVisibleColumns(Array(18).fill(true))}
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
              >
                Select All
              </button>
              <button
                onClick={() => setVisibleColumns(Array(18).fill(false))}
                className="text-xs bg-gray-500 hover:bg-gray-600 text-white py-1 px-2 rounded"
              >
                Deselect All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {headers.map((header, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="checkbox"
                  id={`column-${index}`}
                  checked={visibleColumns[index]}
                  onChange={() => toggleColumn(index)}
                  className="mr-2"
                />
                <label
                  htmlFor={`column-${index}`}
                  className="text-xs text-[var(--foreground)]"
                >
                  {header}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div
        className="overflow-auto border border-[var(--border)] rounded-lg shadow scrollbar-hide max-h-66"
        data-lenis-prevent
      >
        <table className="min-w-full table-auto text-xs border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)]">
          <thead className="bg-gradient-to-r from-cyan-800 to-indigo-800 sticky -top-1 z-10 text-white">
            <tr>
              {headers.map((header, index) => {
                if (!visibleColumns[index]) return null;
                return (
                  <th
                    key={index}
                    className="py-3 px-2 text-left text-xs font-bold uppercase tracking-wider border-r border-[var(--border)] last:border-r-0 whitespace-wrap"
                  >
                    {header}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumnCount}
                  className="py-6 text-center text-[var(--muted-foreground)]"
                >
                  <div className="flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-[var(--muted-foreground)] mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium">NO DATA AVAILABLE</p>
                    <p className="text-xs mt-1">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="hover:bg-[var(--accent)] transition-colors"
                >
                  {columnDefs.map((col, colIndex) => {
                    if (!visibleColumns[colIndex]) return null;
                    return (
                      <td
                        key={colIndex}
                        className="py-2 px-2 border-r border-[var(--border)] last:border-r-0 whitespace-wrap text-wrap"
                      >
                        {col.format ? col.format(row[col.row]) : row[col.row] ?? ""}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}