import React, { useState, useEffect, useMemo } from "react";



export default function DataTable({ 
  rows, 
  fullView = false, 
  prioritizedRows: externalPrioritizedRows = new Map(),
  onPriorityChange 
}) {
  // ✅ Column definitions (keys = your row object fields)
  const columns = [
    { key: "priority", label: "Priority" },
    { key: "ProjectCode", label: "Project Code" },
    { key: "ItemCode", label: "Item Code" },
    { key: "ItemShortDescription", label: "Description" },
    { key: "SupplierName", label: "Supplier" }, // Shortened label
    // { key: "Type", label: "Type" },
    { key: "PONo", label: "PO No." },
    { key: "OrderedLineQuantity", label: " Qty" },
    { key: "UOM", label: "UOM" },
    // { key: "Delivery", label: "Delivery" },
    { key: "OrderLineValue", label: "Order Value" },
    { key: "Currency", label: "Currency" },
    { key: "PlannedReceiptDate", label: "Planned Receipt" },

    ];

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

  const key = `${row.ItemCode || ""}|${row.PONo || ""}|${row.SupplierName || ""}`;
  return btoa(key);
};


const handlePriorityChange = (row, event) => {
  if (event) event.stopPropagation();

  const rowId = generateRowId(row);
  const newMap = new Map(prioritizedRows);

  if (newMap.has(rowId)) {
    newMap.delete(rowId);
  } else {
    newMap.set(rowId, { ...row });
  }

  if (onPriorityChange) {
    onPriorityChange(newMap);
  } else {
    setInternalPrioritizedRows(newMap);
  }
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

   // ✅ Deduplicate + aggregate duplicate rows
const aggregatedRows = useMemo(() => {
  const map = new Map();

  filteredRows.forEach((row) => {
    const id = generateRowId(row);

    if (!map.has(id)) {
      map.set(id, {
        ...row,
        OrderedLineQuantity: Number(row.OrderedLineQuantity) || 0,
        OrderLineValue: Number(row.OrderLineValue) || 0,
      });
    } else {
      const existing = map.get(id);
      existing.OrderedLineQuantity += Number(row.OrderedLineQuantity) || 0;
      existing.OrderLineValue += Number(row.OrderLineValue) || 0;
    }
  });

  return Array.from(map.values());
}, [filteredRows]);

 
   // Separate prioritized rows into those in the current filter and those not
   const { prioritizedInFilter, prioritizedNotInFilter } = useMemo(() => {
     const inFilter = [];
     const notInFilter = [];
 
     prioritizedRows.forEach((row, rowId) => {
const isInFilter = aggregatedRows.some(filterRow => generateRowId(filterRow) === rowId);
       if (isInFilter) {
         inFilter.push(row);
       } else {
         notInFilter.push(row);
       }
     });
 
     return { prioritizedInFilter: inFilter, prioritizedNotInFilter: notInFilter };
   }, [aggregatedRows, prioritizedRows]);
 
   // Create a Set of prioritized row IDs for quick lookup
   const prioritizedRowIds = useMemo(() => {
     return new Set(Array.from(prioritizedRows.keys()));
   }, [prioritizedRows]);
 
   // Sort rows based on priority
   const sortedRows = useMemo(() => {
     // First, get all non-prioritized rows from the current filter
     const nonPrioritizedRows = aggregatedRows.filter((row) => {
  const rowId = generateRowId(row);
  return !prioritizedRowIds.has(rowId);
});

 
     // Combine prioritized rows (in filter) with non-prioritized rows
     return [...prioritizedInFilter, ...nonPrioritizedRows];
   }, [aggregatedRows, prioritizedInFilter, prioritizedRowIds]);
 

 
   // Toggle column visibility
   const toggleColumn = (index) => {
     const newVisibleColumns = [...visibleColumns];
     newVisibleColumns[index] = !newVisibleColumns[index];
     setVisibleColumns(newVisibleColumns);
   };
 
  
 
   // Get visible column count
   const visibleColumnCount = visibleColumns.filter(Boolean).length;
 
   // Render a table row
   const renderTableRow = (row, index, isPrioritizedNotInFilter = false) => {
     const rowId = generateRowId(row );
     const isPrioritized = prioritizedRowIds.has(rowId);
 
     return (
      <tr
        key={rowId}
        className={`
          ${index % 2 === 0 ? 'bg-black' : 'bg-black'}
          ${isPrioritizedNotInFilter ? 'bg-yellow-500 dark:bg-yellow-900/20' : ''}
          ${isPrioritized ? 'bg-blue-500 dark:bg-blue-900/20' : ''}
          transition-colors duration-500 hover:bg-purple-900/40 cursor-pointer
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
              className="px-1 py-1 font-normal text-wrap text-center  text-[11px] text-white/90"
            >
              {row[col.key] ?? ""}
            </td>
          );
        })}
      </tr>
    );
  };
 
   return (
    <div className=" -mt-1 px-1 -mb-2 text-xs rounded-xl mx-auto">
      {/* Header + Buttons */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <span className="h-5 w-1 bg-[var(--color-primary)] mr-2"></span>
            DATA 
          </h2>
          <h4 className="p-2  text-white">
            Total Rows : {sortedRows.length + prioritizedNotInFilter.length}
            {prioritizedNotInFilter.length > 0 && (
              <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                (Includes {prioritizedNotInFilter.length} prioritized item{prioritizedNotInFilter.length > 1 ? 's' : ''} not in current filter)
              </span>
            )}
          </h4>
        </div>

      </div>
      

      {/* Column Selector */}
      {showColumnSelector && (
        <div className="mb-4 p-3 bg-[var(--color-muted)] border border-[var(--color-border)] rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
              Select Columns to Display
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setVisibleColumns(Array(columns.length).fill(true))}
                className="text-xs bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-[var(--color-primary-foreground)] py-1 px-2 rounded transition-transform duration-200 hover:scale-[1.05]"
              >
                Select All
              </button>
              <button
                onClick={() => setVisibleColumns(Array(columns.length).fill(false))}
                className="text-xs bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-[var(--color-secondary-foreground)] py-1 px-2 rounded transition-transform duration-200 hover:scale-[1.05]"
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
                  className="mr-2"
                />
                <label
                  htmlFor={`column-${index}`}
                  className="text-xs text-[var(--color-foreground)]"
                >
                  {column.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className={`${fullView ? "h-[75vh]" : "h-[29vh]"} overflow-y-auto rounded-md scrollbar-hide `}>
        <table className="w-full ">
          <thead className="bg-black border-b border-purple-700/80 z-10 sticky top-0 ">
            <tr>
              {columns.map((col, index) => {
                if (!visibleColumns[index]) return null;
                return (
                  <th
                    key={index}
                    className="px-1 py-1  text-center font-bold text-[12px] text-purple-500 uppercase tracking-wider"
                  >
                    {col.label}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-black text-[11px] divide-y divide-white/30">
            {sortedRows.length === 0 && prioritizedNotInFilter.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumnCount}
                  className="px-2 py-3 text-center text-[var(--color-muted-foreground)]"
                >
                  <div className="flex flex-col items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-[var(--color-muted-foreground)] mb-2"
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
                    <p className="text-[11px] mt-1">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {/* Render prioritized rows not in current filter */}
                {prioritizedNotInFilter.length > 0 && (
                  <>
                    <tr className="bg-yellow-100 dark:bg-yellow-900/30">
                      <td 
                        colSpan={visibleColumnCount}
                        className="px-2 py-1 text-[11px]   text-yellow-800 dark:text-yellow-200"
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
  );
 }