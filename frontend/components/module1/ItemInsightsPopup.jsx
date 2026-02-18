// components/module1/ItemInsightsPopup.jsx
import React, { useState, useEffect, useMemo } from "react";

const ItemInsightsPopup = ({ rows, indentRows, isOpen, onClose }) => {
  const [itemCodeFilter, setItemCodeFilter] = useState("");
  const [itemDescriptionFilter, setItemDescriptionFilter] = useState("");
  const [availableItemCodes, setAvailableItemCodes] = useState([]);
  const [availableDescriptions, setAvailableDescriptions] = useState([]);
  const [selectedItemCodes, setSelectedItemCodes] = useState([]);
  const [selectedDescriptions, setSelectedDescriptions] = useState([]);

  // Helper function for quantity ranges
  const getQuantityRange = (quantity) => {
    const qty = Number(quantity) || 0;
    if (qty === 0) return "0";
    if (qty <= 10) return "1-10";
    if (qty <= 50) return "11-50";
    if (qty <= 100) return "51-100";
    if (qty <= 500) return "101-500";
    return "500+";
  };

  // Helper function for value ranges
  const getValueRange = (value) => {
    const val = Number(value) || 0;
    if (val === 0) return "₹0";
    if (val <= 1000) return "₹1-1K";
    if (val <= 5000) return "₹1K-5K";
    if (val <= 10000) return "₹5K-10K";
    if (val <= 50000) return "₹10K-50K";
    if (val <= 100000) return "₹50K-1L";
    return "₹1L+";
  };

  // Close popup when clicking outside or pressing Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Extract available item codes and descriptions
  useEffect(() => {
    if (rows.length > 0) {
      const itemCodes = [...new Set(rows.map(row => row.ItemCode).filter(Boolean))].sort();
      const descriptions = [...new Set(rows.map(row => row.ItemShortDescription).filter(Boolean))].sort();
      
      setAvailableItemCodes(itemCodes);
      setAvailableDescriptions(descriptions);
    }
  }, [rows]);

  // Handle text input for item codes
  const handleItemCodeInput = (e) => {
    const value = e.target.value;
    setItemCodeFilter(value);
    
    // Parse selections from text input
    const codes = value
      .split(/[,;\n]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    setSelectedItemCodes(codes);
  };

  // Handle dropdown selection for item codes
  const handleItemCodeSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedItemCodes(selected);
    setItemCodeFilter(selected.join(", "));
  };

  // Handle text input for descriptions
  const handleDescriptionInput = (e) => {
    const value = e.target.value;
    setItemDescriptionFilter(value);
    
    // Parse selections from text input
    const descriptions = value
      .split(/[,;\n]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    setSelectedDescriptions(descriptions);
  };

  // Handle dropdown selection for descriptions
  const handleDescriptionSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedDescriptions(selected);
    setItemDescriptionFilter(selected.join(", "));
  };

  // Clear all item code filters
  const clearItemCodes = () => {
    setSelectedItemCodes([]);
    setItemCodeFilter("");
  };

  // Clear all description filters
  const clearDescriptions = () => {
    setSelectedDescriptions([]);
    setItemDescriptionFilter("");
  };

  // Filter data based on selections
  const filteredData = useMemo(() => {
    let filtered = rows;

    if (selectedItemCodes.length > 0) {
      filtered = filtered.filter(row => 
        selectedItemCodes.includes(row.ItemCode)
      );
    }

    if (selectedDescriptions.length > 0) {
      filtered = filtered.filter(row => 
        selectedDescriptions.includes(row.ItemShortDescription)
      );
    }

    return filtered;
  }, [rows, selectedItemCodes, selectedDescriptions]);

  // Chart data calculations
  const chartData = useMemo(() => {
    // 1. PROJECT DISTRIBUTION
    const projectDistribution = filteredData.reduce((acc, row) => {
      const project = row.ProjectCode || row.PROJECT_NO || "Unknown";
      acc[project] = (acc[project] || 0) + 1;
      return acc;
    }, {});

    // 2. INDENT QUANTITY DISTRIBUTION
    const indentQuantityDistribution = filteredData.reduce((acc, row) => {
      const indentQty = row.IndentQuantity || row.INDENT_QTY || 0;
      const range = getQuantityRange(indentQty);
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});

    // 3. ORDER VALUE DISTRIBUTION
    const orderValueDistribution = filteredData.reduce((acc, row) => {
      const orderValue = row.OrderValue || row.ORDER_VALUE || 0;
      const range = getValueRange(orderValue);
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});

    // 4. INVENTORY QUANTITY DISTRIBUTION
    const inventoryQuantityDistribution = filteredData.reduce((acc, row) => {
      const inventoryQty = row.InventoryQuantity || row.INVENTORY_QTY || 0;
      const range = getQuantityRange(inventoryQty);
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});

    return {
      projectDistribution,
      indentQuantityDistribution,
      orderValueDistribution,
      inventoryQuantityDistribution
    };
  }, [filteredData]);

  // Donut Chart Component
  const DonutChart = ({ title, data, colors }) => {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    
    if (total === 0) {
      return (
        <div className="bg-[var(--card)] p-4 rounded-xl shadow-md flex flex-col items-center justify-center h-48">
          <h3 className="text-xs font-semibold mb-2 text-[var(--foreground)] text-center">{title}</h3>
          <div className="text-[var(--muted-foreground)] text-xs">No data available</div>
        </div>
      );
    }

    let accumulatedPercent = 0;
    const segments = Object.entries(data).map(([label, value], index) => {
      const percent = (value / total) * 100;
      const segment = {
        label,
        value,
        percent,
        start: accumulatedPercent,
        end: accumulatedPercent + percent
      };
      accumulatedPercent += percent;
      return segment;
    });

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const strokeWidth = 15;

    return (
      <div className="bg-[var(--card)] p-3 rounded-xl shadow-md flex flex-col items-center h-48">
        <h3 className="text-sm font-semibold mb-3 text-[var(--foreground)] text-center">{title}</h3>
        <div className="relative w-24 h-24">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {segments.map((segment, index) => {
              const dashArray = circumference;
              const dashOffset = circumference - (segment.percent / 100) * circumference;
              const rotation = (segment.start / 100) * 360;

              return (
                <circle
                  key={segment.label}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={colors[index % colors.length]}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  transform={`rotate(${rotation} 50 50)`}
                  className="transition-all duration-300"
                />
              );
            })}
            <text
              x="50"
              y="55"
              textAnchor="middle"
              className="text-lg font-bold fill-[var(--foreground)]"
            >
              {total}
            </text>
          </svg>
        </div>
        <div className="mt-2 w-full max-h-16 overflow-y-auto">
          {segments.slice(0, 3).map((segment, index) => (
            <div key={segment.label} className="flex items-center justify-between text-xs mb-1">
              <div className="flex items-center">
                <div
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: colors[index % colors.length] }}
                ></div>
                <span className="text-[var(--foreground)] truncate max-w-[60px]">
                  {segment.label}
                </span>
              </div>
              <span className="text-[var(--muted-foreground)]">
                {segment.percent.toFixed(0)}%
              </span>
            </div>
          ))}
          {segments.length > 3 && (
            <div className="text-xs text-[var(--muted-foreground)] text-center">
              +{segments.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  };

  const chartColors = [
    "#3B82F6", "#EF4444", "#10B981", "#F59E0B", 
    "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"
  ];

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--background)] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--card)] p-4 border-b border-[var(--border)]">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Item Insights Dashboard</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--muted)] rounded-lg transition-colors text-[var(--foreground)]"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Filters Section */}
          <div className="bg-[var(--card)] p-4 rounded-xl shadow-md space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Item Code Filter */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Item Code Filter
                  </label>
                  {selectedItemCodes.length > 0 && (
                    <button
                      onClick={clearItemCodes}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={itemCodeFilter}
                    onChange={handleItemCodeInput}
                    placeholder="Enter item codes separated by commas, semicolons, or new lines"
                    className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--input-background)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] text-sm"
                  />
                  <select
                    multiple
                    value={selectedItemCodes}
                    onChange={handleItemCodeSelect}
                    className="w-full mt-2 p-2 border border-[var(--border)] rounded-lg bg-[var(--input-background)] text-[var(--foreground)] max-h-32 text-sm"
                    size="4"
                  >
                    {availableItemCodes.map(code => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">
                  {selectedItemCodes.length > 0 ? (
                    <span>Selected: {selectedItemCodes.length} item codes</span>
                  ) : (
                    <span>Hold Ctrl/Cmd to select multiple items</span>
                  )}
                </div>
                {selectedItemCodes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedItemCodes.slice(0, 3).map(code => (
                      <span key={code} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {code}
                      </span>
                    ))}
                    {selectedItemCodes.length > 3 && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        +{selectedItemCodes.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Item Description Filter */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Item Description Filter
                  </label>
                  {selectedDescriptions.length > 0 && (
                    <button
                      onClick={clearDescriptions}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={itemDescriptionFilter}
                    onChange={handleDescriptionInput}
                    placeholder="Enter descriptions separated by commas, semicolons, or new lines"
                    className="w-full p-2 border border-[var(--border)] rounded-lg bg-[var(--input-background)] text-[var(--foreground)] placeholder-[var(--muted-foreground)] text-sm"
                  />
                  <select
                    multiple
                    value={selectedDescriptions}
                    onChange={handleDescriptionSelect}
                    className="w-full mt-2 p-2 border border-[var(--border)] rounded-lg bg-[var(--input-background)] text-[var(--foreground)] max-h-32 text-sm"
                    size="4"
                  >
                    {availableDescriptions.map(desc => (
                      <option key={desc} value={desc}>
                        {desc}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">
                  {selectedDescriptions.length > 0 ? (
                    <span>Selected: {selectedDescriptions.length} descriptions</span>
                  ) : (
                    <span>Hold Ctrl/Cmd to select multiple items</span>
                  )}
                </div>
                {selectedDescriptions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {selectedDescriptions.slice(0, 2).map(desc => (
                      <span key={desc} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded truncate max-w-[120px]">
                        {desc}
                      </span>
                    ))}
                    {selectedDescriptions.length > 2 && (
                      <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        +{selectedDescriptions.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Donut Charts Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <DonutChart
              title="PROJECT DISTRIBUTION"
              data={chartData.projectDistribution}
              colors={chartColors}
            />
            <DonutChart
              title="INDENT QUANTITY"
              data={chartData.indentQuantityDistribution}
              colors={chartColors}
            />
            <DonutChart
              title="ORDER VALUE"
              data={chartData.orderValueDistribution}
              colors={chartColors}
            />
            <DonutChart
              title="INVENTORY QUANTITY"
              data={chartData.inventoryQuantityDistribution}
              colors={chartColors}
            />
          </div>

          {/* Summary */}
          <div className="bg-[var(--card)] p-4 rounded-xl shadow-md">
            <div className="text-sm text-[var(--foreground)] text-center">
              Showing <strong>{filteredData.length}</strong> items out of <strong>{rows.length}</strong> total
              {selectedItemCodes.length > 0 && ` • ${selectedItemCodes.length} item codes selected`}
              {selectedDescriptions.length > 0 && ` • ${selectedDescriptions.length} descriptions selected`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemInsightsPopup;
