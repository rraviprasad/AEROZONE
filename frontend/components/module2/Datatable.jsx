import React, { useState, useMemo } from "react";

// FileChartColumn component included directly
const FileChartColumn = ({
  width = 28,
  height = 28,
  strokeWidth = 2,
  stroke = "#fb923c", // Changed to orange
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="cursor-pointer p-2 flex items-center justify-center transition-transform duration-200 hover:scale-[1.05]"
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

export default function SummaryTable({
  rows,
  fullView = false,
  prioritizedRows: externalPrioritizedRows = new Map(),
  onPriorityChange
}) {
  const columns = [
    { key: "priority", label: "Priority" },
    { key: "ReferenceB", label: "Reference B" },
    // { key: "Category", label: "Category" },
    // { key: "Type", label: "Type" },
    { key: "ProjectNo", label: "Project No" },
    { key: "ItemCode", label: "Item Code" },
    { key: "Description", label: "Description" },
    { key: "OrderedQty", label: "Ordered Qty" },
    { key: "RequiredQty", label: "Required Qty" },
    { key: "UOM", label: "UOM" },
    { key: "PlannedOrder", label: "Planned Order" },
    { key: "Difference", label: "Difference" },
  ];
  // State for managing column visibility - All 12 columns visible by default
  const [visibleColumns, setVisibleColumns] = useState(
    Array(columns.length).fill(true) // ✅ simpler & correct
  );

  const [showColumnSelector, setShowColumnSelector] = useState(false);

  // Use external prioritizedRows if provided, otherwise use internal state
  const [internalPrioritizedRows, setInternalPrioritizedRows] = useState(new Map());
  const prioritizedRows = onPriorityChange ? externalPrioritizedRows : internalPrioritizedRows;

  // Generate a unique ID for each row based on key fields
  const generateRowId = (row) => {
    if (row.UNIQUE_CODE) return row.UNIQUE_CODE;
    if (row.id) return row.id;
    const project = row.ProjectNo || row.ProjectCode || "";
    const key = `${row.ReferenceB || ""}|${project}|${row.ItemCode || ""}`;
    return btoa(key);
  };


  // ✅ Remove empty rows (preserving original logic)
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      return Object.entries(row).some(([key, value]) => {
        if (value === null || value === undefined) return false;
        const str = String(value).trim();
        return str !== "" && str !== "0" && str.toUpperCase() !== "NA";
      });
    });
  }, [rows]);

  // Separate prioritized rows into those in the current filter and those not
  const { prioritizedInFilter, prioritizedNotInFilter } = useMemo(() => {
    const inFilter = [];
    const notInFilter = [];

    prioritizedRows.forEach((row, rowId) => {
      const isInFilter = filteredRows.some(filterRow => generateRowId(filterRow) === rowId);
      if (isInFilter) {
        inFilter.push(row);
      } else {
        notInFilter.push(row);
      }
    });

    return { prioritizedInFilter: inFilter, prioritizedNotInFilter: notInFilter };
  }, [filteredRows, prioritizedRows]);

  // Create a Set of prioritized row IDs for quick lookup
  const prioritizedRowIds = useMemo(() => {
    return new Set(Array.from(prioritizedRows.keys()));
  }, [prioritizedRows]);

  // Sort rows based on priority
  const sortedRows = useMemo(() => {
    // First, get all non-prioritized rows from the current filter
    const nonPrioritizedRows = filteredRows.filter(row => {
      const rowId = generateRowId(row);
      return !prioritizedRowIds.has(rowId);
    });

    // Combine prioritized rows (in filter) with non-prioritized rows
    return [...prioritizedInFilter, ...nonPrioritizedRows];
  }, [filteredRows, prioritizedInFilter, prioritizedRowIds]);

  // ✅ Copy table to clipboard (preserving original logic)
  const copyTable = () => {
    if (!filteredRows.length && prioritizedNotInFilter.length === 0) return;
    const headers = columns.map((col) => col.label);
    let text = headers.join("\t") + "\n";

    // Add prioritized rows not in filter
    prioritizedNotInFilter.forEach((row) => {
      const rowId = generateRowId(row);
      text += columns.map((col) => {
        if (col.key === "priority") return "✓";
        return row[col.key] ?? "";
      }).join("\t") + "\n";
    });

    // Add sorted rows
    sortedRows.forEach((row) => {
      const rowId = generateRowId(row);
      text += columns.map((col) => {
        if (col.key === "priority") return prioritizedRowIds.has(rowId) ? "✓" : "";
        return row[col.key] ?? "";
      }).join("\t") + "\n";
    });

    navigator.clipboard
      .writeText(text)
      .then(() => alert("✅ Table copied to clipboard!"))
      .catch(() => alert("❌ Failed to copy"));
  };

  // Toggle column visibility
  const toggleColumn = (index) => {
    const newVisibleColumns = [...visibleColumns];
    newVisibleColumns[index] = !newVisibleColumns[index];
    setVisibleColumns(newVisibleColumns);
  };

  // Handle priority checkbox change - Fixed to work independently
  const handlePriorityChange = (row, event) => {
    // Stop event propagation to prevent row click
    if (event) {
      event.stopPropagation();
    }

    const rowId = generateRowId(row);
    const newPrioritizedRows = new Map(prioritizedRows);

    if (newPrioritizedRows.has(rowId)) {
      newPrioritizedRows.delete(rowId);
    } else {
      // Store the entire row data to ensure persistence
      newPrioritizedRows.set(rowId, { ...row });
    }

    // Use external handler if provided, otherwise update internal state
    if (onPriorityChange) {
      onPriorityChange(newPrioritizedRows);
    } else {
      setInternalPrioritizedRows(newPrioritizedRows);
    }
  };

  // Get visible column count
  const visibleColumnCount = visibleColumns.filter(Boolean).length;

  // Render a table row
  const renderTableRow = (row, index, isPrioritizedNotInFilter = false) => {
    const rowId = generateRowId(row);
    const isPrioritized = prioritizedRowIds.has(rowId);

    return (
      <tr
        key={rowId}
        className={`
          ${index % 2 === 0 ? 'bg-black' : 'bg-black'}
          ${isPrioritizedNotInFilter ? 'bg-orange-900/30' : ''}
          ${isPrioritized ? 'bg-orange-900/20' : ''}
          transition-colors duration-200 hover:bg-orange-800/20
        `}
      >
        {columns.map((col, colIndex) => {
          if (!visibleColumns[colIndex]) return null;

          // Special handling for the Priority column
          if (col.key === "priority") {
            return (
              <td
                key={colIndex}
                className="px-2 py-1 text-xs text-orange-200 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isPrioritized}
                  onChange={(e) => handlePriorityChange(row, e)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 cursor-pointer text-orange-500 focus:ring-orange-500 border-orange-700 rounded bg-black"
                />
              </td>
            );
          }


          return (
            <td
              key={colIndex}
              className={`px-2 py-1  text-xs text-white ${col.key === "Description" ? "w-[300px] max-w-[300px] whitespace-normal break-words" : "whitespace-nowrap text-center"}`}
            >
              {row[col.key] ?? ""}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="relative -mb-1  text-xs mx-auto drop-shadow-lg hover:drop-shadow-xl transition-all duration-300">
      <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-[1px] clip-angled h-full">
        <div className="bg-black clip-angled py-2 p-3 h-full">
          {/* Header + Buttons */}
          <div className="flex justify-between items-center mb-1">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-orange-400 flex items-center">
                <span className="h-5 w-1 bg-orange-500 mr-2 shadow-sm shadow-orange-500/50"></span>
                DATA
              </h2>
              <h4 className="p-2 font-semibold text-white">
                Total Rows : {sortedRows.length + prioritizedNotInFilter.length}
                {prioritizedNotInFilter.length > 0 && (
                  <span className="ml-2 text-orange-400">
                    (Includes {prioritizedNotInFilter.length} prioritized item{prioritizedNotInFilter.length > 1 ? 's' : ''} not in current filter)
                  </span>
                )}
              </h4>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowColumnSelector(!showColumnSelector)}
                className="bg-orange-600 hover:bg-orange-500 text-white py-2 px-2 clip-angled text-sm flex items-center shadow-md h-8 w-12 transition-transform duration-200 hover:scale-[1.05] hover:shadow-orange-500/30"
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
            <div className="mb-4 p-3 bg-black border border-orange-700/50 clip-angled shadow-md shadow-orange-500/10">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-semibold text-orange-300">
                  Select Columns to Display
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVisibleColumns(Array(columns.length).fill(true))}
                    className="text-xs bg-orange-600 hover:bg-orange-500 text-white py-1 px-2 clip-angled transition-transform duration-200 hover:scale-[1.05]"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setVisibleColumns(Array(columns.length).fill(false))}
                    className="text-xs bg-orange-700 hover:bg-orange-600 text-white py-1 px-2 clip-angled transition-transform duration-200 hover:scale-[1.05]"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {columns.map((column, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`column-${index}`}
                      checked={visibleColumns[index]}
                      onChange={() => toggleColumn(index)}
                      className="mr-2 text-orange-500 focus:ring-orange-500 border-orange-700 rounded"
                    />
                    <label
                      htmlFor={`column-${index}`}
                      className="text-xs text-orange-200"
                    >
                      {column.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Table */}
          <div className={`${fullView ? "h-[75vh]" : "h-[35vh]"} overflow-y-auto clip-angled `}>
            <table className="w-full ">
              <thead className="bg-black sticky top-0 border-b border-orange-700/50">
                <tr>
                  {columns.map((col, index) => {
                    if (!visibleColumns[index]) return null;
                    return (
                      <th
                        key={index}
                        className="px-2 py-1 text-center text-xs font-semibold text-orange-400 uppercase tracking-wider"
                      >
                        {col.label}
                      </th>

                    );
                  })}
                </tr>
              </thead>
              <tbody className="bg-black/30 divide-y divide-white/30 ">
                {sortedRows.length === 0 && prioritizedNotInFilter.length === 0 ? (
                  <tr>
                    <td
                      colSpan={visibleColumnCount}
                      className="px-2 py-4 text-center text-wrap text-orange-500"
                    >
                      <div className="flex flex-col items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-orange-500 mb-2"
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
                  <>
                    {/* Render prioritized rows not in current filter */}
                    {prioritizedNotInFilter.length > 0 && (
                      <>
                        <tr className="bg-orange-900/30">
                          <td
                            colSpan={visibleColumnCount}
                            className="px-2 py-1 text-xs font-semibold text-orange-300"
                          >
                            Prioritized Items (Not in Current Filter)
                          </td>
                        </tr>
                        {prioritizedNotInFilter.map((row, index) =>
                          renderTableRow(row, index, true)
                        )}
                      </>
                    )}

                    {/* Render sorted rows (prioritized in filter + non-prioritized) */}
                    {sortedRows.map((row, index) =>
                      renderTableRow(row, index)
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
