import React, { useEffect, useState } from "react";
import UploadForm from "../components/module1/UploadForm";
import DataTable from "../components/module1/DataTable";
import PieCharts from "../components/module1/PieChart";
import LineChart from "../components/module1/LineChart";
import Filters from "../components/module1/Filter";
import BarChart from "../components/module1/BarChart";

// Navbar is now global in App.jsx


// ThemeToggle component



const DataPage = () => {
  const [rows, setRows] = useState([]);
  const [indentRows, setIndentRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [filteredIndentRows, setFilteredIndentRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showUploadModal, setShowUploadModal] = useState(false);


  const [filters, setFilters] = useState({
    search: "",
    projectCode: "",
    itemCode: "",
    description: "",
  });

  // 🔹 Fetch data ONCE
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res1, res2] = await Promise.all([
          fetch("https://aerozone3-1.onrender.com/api/data/get-data"),
          fetch("https://aerozone3-1.onrender.com/api/data/get-indent")
        ]);

        if (!res1.ok || !res2.ok) throw new Error("Backend Error");

        const excelData = await res1.json();
        const indentData = await res2.json();

        // Check for empty data or quota error response that might come as JSON
        if (excelData.error || indentData.error) throw new Error("API Error");

        setRows(excelData);
        setFilteredRows(excelData);

        setIndentRows(indentData);
        setFilteredIndentRows(indentData);
      } catch (err) {
        console.warn("Backend Error:", err);
        setRows([]);
        setFilteredRows([]);
        setIndentRows([]);
        setFilteredIndentRows([]);
      }
    };
    fetchData();
  }, []);

  // 🔹 Strict Exact-Match Filtering Logic (Search, ProjectCode, ItemCode, Description)
  const applyFilters = () => {
    const { search, projectCode, itemCode, description } = filters;

    // ✅ Normalize helper (trim + lowercase + remove spaces)
    const normalize = (v) =>
      String(v ?? "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .trim();

    // ✅ Split search terms by comma or space, normalize them
    const searchTerms = String(search || "")
      .split(/[, ]+/)
      .map((s) => normalize(s))
      .filter(Boolean);

    // ✅ Define searchable fields
    const searchableFields = [
      "ProjectCode",
      "ItemCode",
      "Description",
      "ItemShortDescription",
      "ITEM_DESCRIPTION",
    ];

    const filterFn = (row) => {
      // ✅ Exact ItemCode match
      if (itemCode) {
        const rowItem = normalize(row.ItemCode);
        if (rowItem !== normalize(itemCode)) return false;
      }

      // ✅ Exact ProjectCode match
      if (projectCode) {
        const rowProject = normalize(row.ProjectCode || row.PROJECT_NO);
        if (rowProject !== normalize(projectCode)) return false;
      }

      // ✅ Exact Description match
      if (description) {
        const rowDesc = normalize(
          row.Description ||
          row.ItemShortDescription ||
          row.ITEM_DESCRIPTION ||
          ""
        );
        if (rowDesc !== normalize(description)) return false;
      }

      // ✅ Search field: all terms must exactly match some field (case-insensitive)
      if (searchTerms.length > 0) {
        for (const term of searchTerms) {
          let matched = false;

          for (const key of searchableFields) {
            if (!(key in row)) continue;
            const value = row[key];
            if (value == null) continue;

            const text = normalize(value);
            if (text === term) {
              matched = true;
              break;
            }
          }

          // If any term doesn’t match → reject this row
          if (!matched) return false;
        }
      }

      return true;
    };

    // ✅ Apply filter
    setFilteredRows(rows.filter(filterFn));
    setFilteredIndentRows(indentRows.filter(filterFn));
  };




  const renderUploadModal = () => {
    if (!showUploadModal) return null;

    return (
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowUploadModal(false);
          }
        }}
      >
        <div className="bg-[var(--color-card)] rounded-[var(--radius)] shadow-2xl p-6 max-w-lg w-full transform transition-all duration-300 scale-100">
          <div className="relative">
            <button
              className="absolute -top-2 -right-2 bg-[var(--color-secondary)] rounded-full w-8 h-8 flex items-center justify-center text-[var(--color-secondary-foreground)] transition-transform duration-200 hover:scale-[1.05]"
              onClick={() => setShowUploadModal(false)}
            >
              ×
            </button>
            <div >
              <UploadForm setLoading={setLoading} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-[var(--color-background)] text-[var(--color-foreground)] transition-colors duration-300 min-h-screen pt-20">
      {/* Navbar is now global in App.jsx */}
      {renderUploadModal()}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="w-16 h-16 border-4 border-t-transparent border-[var(--primary)] rounded-full animate-spin"></div>
          <span className="ml-4 text-white text-xl">Processing data...</span>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">

        {/* Filter Bar */}
        <div className="mb-1">
          <Filters
            filters={filters}
            setFilters={setFilters}
            applyFilters={applyFilters}
            rows={rows}
          />
        </div>

        {/* ===== CHARTS ROW ===== */}
        {/* ===== CHARTS ROW ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4">

          {/* Bar Chart - Stock Summary */}
          <div className="bg-[var(--card)] rounded-xl shadow-md p-2 lg:col-span-3 h-[420px] lg:h-[320px] flex items-center justify-center overflow-hidden">
            <BarChart rows={filteredRows} />
          </div>

          {/* Pie Charts */}
          <div className="bg-[var(--card)] rounded-xl shadow-md p-2 lg:col-span-5 h-[420px] lg:h-[320px] overflow-hidden">
            <PieCharts rows={filteredRows} indentRows={filteredIndentRows} />
          </div>

          {/* Line Chart */}
          <div className="bg-[var(--card)] rounded-xl shadow-md p-2 lg:col-span-4 h-[420px] lg:h-[320px] overflow-hidden">
            <LineChart indentRows={filteredIndentRows} />
          </div>

        </div>

        {/* ===== DATA TABLE ===== */}
        <div className="bg-[var(--card)] rounded-xl shadow-md p-2">
          <DataTable rows={filteredRows} indentRows={filteredIndentRows} />
        </div>

      </div>

      {/* Floating Upload Button */}
      <button
        onClick={() => setShowUploadModal(true)}
        className="fixed bottom-6 left-6 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] w-12 h-12 rounded-full shadow-lg flex items-center justify-center z-20 transition-transform duration-300 hover:scale-[1.05]"
        title="Upload Excel File"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </button>
    </div>
  );
};

export default DataPage;