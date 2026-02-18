import { ArrowsUpFromLine } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import DataTable2 from '../components/module4/DataTable';
import Filters from '../components/module4/Filter22';
import AnalysisComboChart from '../components/module4/AnalysisComboChart';
import TradingViewChart from '../components/module4/TradingViewChart';
const ZoomIcon = ({ width = 18, height = 18, stroke = "#fff" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    stroke={stroke}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
    <line x1="11" y1="8" x2="11" y2="14"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);


const Analysis1page = () => {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [selectedRef, setSelectedRef] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activeComponent, setActiveComponent] = useState(null);
  const [zoomActive, setZoomActive] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    itemCode: "",
    projecCode: "",
    description: "",
    refStart: "",
    refEnd: "",
  });

  useEffect(() => {
    document.documentElement.classList.add("dark");

    const isReload = performance.getEntriesByType("navigation")[0]?.type === "reload";

    const fetchData = async () => {
      try {
        setLoading(true);

        if (!isReload) {
          const cachedData = localStorage.getItem("analysisData");
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            setRows(parsed);
            setFilteredRows(parsed);
            setLoading(false);
            return;
          }
        }

        const res = await fetch("https://aerozone3-1.onrender.com/api/data/analysis");
        const data = await res.json();

        localStorage.setItem("analysisData", JSON.stringify(data));
        setRows(data);
        setFilteredRows(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const applyFilters = () => {
    const { search, itemCode, description, refStart, refEnd, projectCode } = filters;

    const searchTerms = String(search || "")
      .split(/[, ]+/)
      .map(s => s.trim().toLowerCase())
      .filter(Boolean);

    const start = parseFloat(refStart);
    const end = parseFloat(refEnd);
    const refFilterActive = !isNaN(start) || !isNaN(end);

    const searchableFields = [
      "ProjectCode",
      "ItemCode",
      "ItemShortDescription",
      "Description",
      "ReferenceB",
      "REF_B",
      "Reference B",
      "Reference_B",
      "REFB",
      "Reference"
    ];

    const escapeRegExp = (str) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const filterRow = (row) => {

      if (itemCode && String(row.ItemCode).trim() !== itemCode.trim()) {
        return false;
      }
      if (projectCode && String(row.ProjectCode).trim() !== projectCode.trim()) {
        return false;
      }

      if (description) {
        const desc = (
          row.ItemShortDescription ||
          row.Description ||
          ""
        ).toLowerCase();

        if (!desc.includes(description.toLowerCase())) return false;
      }

      if (refFilterActive) {
        const refStr = findRowValue(row, [
          "ReferenceB",
          "REF_B",
          "Reference B",
          "Reference_B",
          "REFB",
          "Reference"
        ]);

        const refVal = refStr
          ? parseFloat(String(refStr).replace(/[^0-9.\-]/g, ""))
          : NaN;

        if (isNaN(refVal)) return false;
        if (!isNaN(start) && refVal < start) return false;
        if (!isNaN(end) && refVal > end) return false;
      }

      for (const term of searchTerms) {
        const numericTerm = parseFloat(term);
        const isNumeric = !isNaN(numericTerm);
        let matched = false;

        for (const key of searchableFields) {
          const value = row[key];
          if (value == null) continue;

          const text = String(value).toLowerCase();

          if (isNumeric) {
            const extracted = parseFloat(
              String(value).replace(/[^0-9.\-]/g, "")
            );
            if (!isNaN(extracted) && extracted === numericTerm) {
              matched = true;
              break;
            }

            const tokenRegex = new RegExp(
              "\\b" + escapeRegExp(term) + "\\b",
              "i"
            );
            if (tokenRegex.test(String(value))) {
              matched = true;
              break;
            }
          } else if (text.includes(term)) {
            matched = true;
            break;
          }
        }

        if (!matched) return false;
      }

      return true;
    };

    setFilteredRows(rows.filter(filterRow));
  };


  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setActiveComponent(null);
    }
  };


  const renderZoomedComponent = () => {
    if (!activeComponent) return null;

    const components = {

      dataTable: <DataTable2 rows={filteredRows} />,
    };

    // Special handling for dataTable to show full width
    if (activeComponent === 'dataTable') {
      return (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="relative w-[98vw] h-[92vh] drop-shadow-2xl">
            <div className="bg-gradient-to-br from-purple-600 to-purple-900 p-[1px] clip-angled h-full">
              <div className="bg-[#111111] clip-angled w-full h-full overflow-auto relative">

                {/* Close Button */}
                <button
                  className="absolute top-4 right-4 bg-purple-600 clip-angled w-10 h-10 flex items-center justify-center text-white transition-transform duration-200 hover:scale-[1.05]"
                  onClick={() => setActiveComponent(null)}
                >
                  ×
                </button>

                {/* ✅ Force full width & height */}
                <div className="w-full h-full overflow-auto p-6">
                  <DataTable2
                    rows={filteredRows}

                    fullView={true}   // <--- add this prop
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <div className="relative max-w-2xl w-full max-h-[90vh] drop-shadow-2xl">
          <div className="bg-gradient-to-br from-purple-600 to-purple-900 p-[1px] clip-angled h-full">
            <div className="bg-[#111111] clip-angled p-6 w-full h-full overflow-auto transform transition-all duration-300 scale-100">
              <div className="relative">
                <button
                  className="absolute -top-2 -right-2 bg-purple-600 clip-angled w-8 h-8 flex items-center justify-center text-white transition-transform duration-200 hover:scale-[1.05]"
                  onClick={() => setActiveComponent(null)}
                >
                  ×
                </button>
                {components[activeComponent]}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="p-6 text-purple-400">Loading Orbit Data…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  return (
    <div
      className={`dark bg-black text-[var(--color-foreground)] transition-colors duration-300 relative ${activeComponent ? 'overflow-hidden' : ''} min-h-screen`}
      style={{
        "--primary": "oklch(0.55 0.25 295)", // Purple override
        "--color-primary": "oklch(0.55 0.25 295)"
      }}
    >


      {renderZoomedComponent()}

      <div className={`pt-12 px-2 sm:px-3 lg:px-3 pb-2 transition-all duration-300 ${activeComponent ? 'blur-sm' : ''} max-w-screen`}>
        {/* Filter Bar */}
        <div className="mb-1">
          <Filters
            filters={filters}
            setFilters={setFilters}
            applyFilters={applyFilters}
            rows={rows}
          />
        </div>

        <div className='flex flex-col gap-2'>

          <div className='w-full flex gap-2'>
            <div className='w-1/2 h-60 overflow-hidden rounded-[var(--radius)] border border-white/10 shadow-md'>
              <TradingViewChart />
            </div>
            <div className='w-1/2 h-60 overflow-hidden rounded-[var(--radius)] shadow-md'>
              <AnalysisComboChart data={filteredRows} />
            </div>
          </div>

          <div className="w-full bg-[var(--color-muted)] min-h-50 p-2 rounded-[var(--radius)] shadow-md relative flex flex-col">

            {/* Zoom Button */}
            <div className="flex justify-end absolute top-2 right-2 z-10">
              <button
                className="p-1.5 bg-purple-600 rounded-[var(--radius)] text-white transition-transform duration-200 hover:scale-[1.05]"
                title="Zoom Table"
                onClick={() => setActiveComponent("dataTable")}
              >
                <ZoomIcon width={14} height={14} />
              </button>
            </div>

            <div >
              <DataTable2
                rows={filteredRows}
                fullView={activeComponent === "dataTable"}

              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Analysis1page