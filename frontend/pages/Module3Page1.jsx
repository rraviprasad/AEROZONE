import React, { useEffect, useState } from "react";
import Rawmaterial1 from "../components/module3/Rawmaterial1";
import ReferenceBList from "../components/module3/ReferenceBList1";
import Baught1 from "../components/module3/Baught1";
import Filters from "../components/module3/Filter22";
import CustomerName from "../components/module3/CustomerName";
import AmountTable from "../components/module3/AmountTable";
import ReceiptBarChart from "../components/module3/ReciptBarchart";
import DataTable from "../components/module3/DataTable";

import ProjectCylinder from "../components/module3/ProjectCylinder";
import WorldMap from "../components/module3/WorldMap";
import Typecubescence from "../components/module3/Typecubescence";


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

const Module3Page1 = () => {
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

    const isReload =
      performance.getEntriesByType("navigation")[0]?.type === "reload";

    const fetchData = async () => {
      try {
        setLoading(true);

        if (!isReload) {
          const cachedData = localStorage.getItem("orbitData");
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            setRows(parsed);
            setFilteredRows(parsed);
            setLoading(false);
            return;
          }
        }

        const res = await fetch("/api/data/orbit");
        const data = await res.json();

        localStorage.setItem("orbitData", JSON.stringify(data));
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


  const customerValues = filteredRows.map(row => row.CustomerName);


  const uniqueItemCount = new Set(
    filteredRows
      .filter(row => String(row.Category
      ).trim().toUpperCase() === "RM")
      .map(row => row.ItemCode)
  ).size;

  const uniqueBOICount = new Set(
    filteredRows
      .filter(row => String(row.Category
      ).trim().toUpperCase() === "BOI")
      .map(row => row.ItemCode)
  ).size;



  const findRowValue = (row, keys) => {
    for (const key of keys) {
      if (row[key] != null && row[key] !== "") {
        return row[key];
      }
    }
    return null;
  };



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
      refBCards: <ReferenceBList
        rows={filteredRows}
        selectedRef={selectedRef}
        onSelectRef={(ref) => {
          setSelectedRef(ref);
          setTimeout(() => applyFilters(), 0);
        }}
      />,

      rawMaterial: <Rawmaterial1
        value={`${filteredRows.length} Items`}
        label="Raw Materials"
        bgColor="bg-[var(--color-card)]"
        valueColor="text-purple-500"
        labelColor="text-[var(--color-muted-foreground)]"
      />,
      baught: <Baught1
        value={`${filteredRows.length} Items`}
        label="Business Operations Index"
        bgColor="bg-[var(--color-card)]"
        valueColor="text-purple-500"
        labelColor="text-[var(--color-muted-foreground)]"
      />,
      dataTable: <DataTable rows={filteredRows} />,
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
                  <DataTable
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

        {/* Metrics Cards Section */}
        <div className="mt-2">
          <div className="flex flex-row justify-center items-stretch gap-2 w-full mb-1">

            {/* LEFT: Amount Table */}
            <div className="lg:col-span-1 w-[33%]">
              <AmountTable rows={filteredRows} />
            </div>


            {/* RIGHT: Calendar, Cylinder, Map */}
            <div className="flex flex-row gap-2 w-[67%] items-stretch">
              {/* Receipt Calendar */}
              <div className="w-[25%]">
                <div className="h-full">
                  <ReceiptBarChart rows={filteredRows} />
                </div>
              </div>

              {/* PROJECT DISTRIBUTION Cylinder */}
              <div className="w-[25%]">
                <div className="bg-black rounded-xl border border-purple-700/80 p-4 shadow-md h-[223px] relative group transition-all duration-300 hover:shadow-lg flex flex-col">
                  <div className="flex items-center mb-1">
                    <div className="h-4 w-1 bg-purple-500 mr-2 rounded-sm" />
                    <h2 className="text-[10px] font-semibold text-white uppercase tracking-wider">PROJECT DISTRIBUTION</h2>
                  </div>
                  <div className="flex-1 min-h-0 relative flex items-center justify-center">
                    <ProjectCylinder rows={filteredRows} />
                  </div>
                </div>
              </div>

              {/* World Map */}
              <div className="w-[50%]">
                <div className="bg-black rounded-xl border border-purple-700/80 p-2 shadow-md h-[223px] relative group transition-all duration-300 hover:shadow-lg flex flex-col">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="h-4 w-1 bg-purple-500 mr-2 rounded-sm" />
                      <h2 className="text-[10px] font-semibold text-white uppercase tracking-wider">LIVE GLOBAL NETWORK</h2>
                    </div>

                    {/* Live Status Badge */}
                    <div className="flex items-center gap-2 px-2 py-0.5 bg-black border border-purple-500/20 rounded-full">
                      <div className="relative w-1.5 h-1.5">
                        <div className="absolute inset-0 rounded-full bg-purple-500 animate-pulse" />
                        <div className="absolute inset-0 rounded-full bg-purple-500 animate-ping opacity-75" />
                      </div>
                      <span className="text-[8px] font-bold text-purple-400 uppercase tracking-tighter">Live</span>
                    </div>
                  </div>
                  <div className="bg-black rounded-xl border border-purple-700/80
       p-1 shadow-md h-full flex flex-col">
                    <WorldMap rows={filteredRows} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-row  items-center gap-2 w-full mb-1">
            <div className="w-[25%] flex flex-row gap-3">
              <div className="transform transition-transform w-fit h-full duration-200 hover:scale-[1.0] ">

                <Rawmaterial1
                  value={`${uniqueItemCount}`}
                  valueColor="text-purple-500"
                  labelColor="text-[var(--color-muted-foreground)]"
                />
              </div>
              <div className="transform transition-transform w-fit h-full duration-200 hover:scale-[1.0] ">

                <Baught1
                  value={`${uniqueBOICount} `}
                  valueColor="text-purple-500"
                  labelColor="text-[var(--color-muted-foreground)]"
                />
              </div>
            </div>
            <div className=" w-[70%] ">
              <CustomerName
                values={customerValues}
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
              />
            </div>

          </div>
          <div className="flex flex-col  gap-1 w-full ">

            {/* LEFT COLUMN */}
            <div className="flex flex-row gap-2 h-full w-full">

              <div className="w-[30%] h-3/4 flex flex-row  gap-2 ">

                <div className="w-[80%] h-full overflow-hidden">
                  <Typecubescence rows={filteredRows} />
                </div>

                <div className="w-[30%] h-full overflow-hidden">
                  <ReferenceBList
                    rows={filteredRows}
                    selectedRef={selectedRef}
                    onSelectRef={(ref) => setSelectedRef(ref)}
                  />
                </div>


              </div>
              <div className="w-full bg-black border border-purple-700/80 p-2 rounded-[var(--radius)] shadow-md relative flex flex-col">

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
                  <DataTable
                    rows={filteredRows}
                    fullView={activeComponent === "dataTable"}

                  />
                </div>
              </div>
            </div>



          </div>

        </div>
      </div>
    </div>
  );
};

export default Module3Page1;


