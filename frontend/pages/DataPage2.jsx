// src/pages/DataPage2.tsx
import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import Filters from "../components/module1/Filter2";
import * as XLSX from "xlsx";
import DonutChart from "../components/module1/DonutChart";
import DonutChart2 from "../components/module1/DonutChart2";
import Uploadfrom2 from "../components/module1/Uploadfrom2";
import DataTable2 from "../components/module1/DataTable2";
import Rawmaterial from "../components/module1/Rawmaterial";
import Baught from "../components/module1/Baught";
import ReferenceBList from "../components/module1/ReferenceBList";
import ReceiptBarChart from "../components/module1/ReciptBarchart";
import ItemInsightsPopup from "../components/module1/ItemInsightsPopup";
import ProjectNumber from "../components/module1/ProjectNumber";
import RMSupplier from "../components/module1/RMSupplier";
import BOISupplier from "../components/module1/BOISupplier";

// ZoomIcon component
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
    <circle cx="11" cy="11" r="9"></circle>
    <path d="m21 21-4.35-4.35"></path>
    <line x1="11" y1="8" x2="11" y2="14"></line>
    <line x1="8" y1="11" x2="14" y2="11"></line>
  </svg>
);



const DataPage2 = () => {
  // State management
  const [rows, setRows] = useState([]);
  const [indentRows, setIndentRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [filteredIndentRows, setFilteredIndentRows] = useState([]);
  const [animationKey, setAnimationKey] = useState(0);
  const [excelFile, setExcelFile] = useState(null);
  const [excelData, setExcelData] = useState([]);
  const [activeComponent, setActiveComponent] = useState(null);
  const [selectedRef, setSelectedRef] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showItemInsights, setShowItemInsights] = useState(false);
  const [prismRows, setPrismRows] = useState(null);


  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    itemCode: "",
    description: "",
    refStart: "",
    refEnd: "",
  });

  // Animation effect
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setAnimationKey((prevKey) => prevKey + 1);
  //   }, 10000);
  //   return () => clearInterval(interval);
  // }, []);

  // Data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dataRes, indentRes] = await Promise.all([
          fetch("https://aerozone3-1.onrender.com/api/data/get-data"),
          fetch("https://aerozone3-1.onrender.com/api/data/get-indent")
        ]);

        const data = await dataRes.json();
        const indentData = await indentRes.json();

        setRows(data);
        setFilteredRows(data);
        setIndentRows(indentData);
        setFilteredIndentRows(indentData);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    const fetchPrismData = async () => {
      try {
        const res = await fetch("https://aerozone3-1.onrender.com/api/data/prism");
        const data = await res.json();

        const processed = Array.isArray(data)
          ? data.map(row => ({
            ...row,
            Difference: (Number(row.RequiredQty) || 0) - (Number(row.OrderedQty) || 0),
            OrderStatus:
              (Number(row.RequiredQty) || 0) - (Number(row.OrderedQty) || 0) <= 5
                ? "YES"
                : "NO",
          }))
          : [];

        setPrismRows(processed);
      } catch (err) {
        console.error("PRISM API error:", err);
        setPrismRows([]); // SAFE FALLBACK
      }
    };

    fetchPrismData();
  }, []);



  // Handle component click
  const handleComponentClick = (componentName) => {
    setActiveComponent(componentName);
  };

  // Handle backdrop click to close zoomed view
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      setActiveComponent(null);
    }
  };

  // Process uploaded Excel
  const processExcel = async (file) => {
    if (!file) {
      alert("Please upload an Excel file first.");
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const excelJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      setExcelData(excelJson);

      // Merge ReferenceB into rows
      const updated = rows.map((row) => {
        const match = excelJson.find((excelRow) => {
          const excelPONo = excelRow[4]; // Column E
          return String(excelPONo).trim() === String(row.PONo).trim();
        });
        return {
          ...row,
          ReferenceB: match ? match[14] : "N/A", // Column O
        };
      });

      setRows(updated);
      setFilteredRows(updated);
      // Close the modal after successful upload
      setShowUploadModal(false);
    } catch (err) {
      console.error("Error processing Excel:", err);
    }
  };

  //unique Item code for Rawmaterial and Baught components
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

  // Group suppliers for each RM ItemCode
  const suppliersByRM = useMemo(() => {
    return filteredRows
      .filter(row => String(row.Category
      ).trim().toUpperCase() === "RM")
      .reduce((acc, row) => {
        (acc[row.ItemCode] ??= new Set()).add(row.SupplierName);
        return acc;
      }, {});
  }, [filteredRows]);

  const suppliersByBOI = useMemo(() => {
    return filteredRows
      .filter(row => String(row.Category
      ).trim().toUpperCase() === "BOI")
      .reduce((acc, row) => {
        (acc[row.ItemCode] ??= new Set()).add(row.SupplierName);
        return acc;
      }, {});
  }, [filteredRows]);

  // Filter helper functions
  const normalizeKey = (k = "") => String(k).replace(/\s|_|-/g, "").toLowerCase();

  const findRowValue = (row = {}, candidates = []) => {
    // Direct key matches
    for (const c of candidates) {
      if (row[c] !== undefined && row[c] !== null && String(row[c]).trim() !== "") {
        return String(row[c]).trim();
      }
    }

    // Fallback: match by normalized key
    const map = {};
    Object.keys(row).forEach((k) => {
      map[normalizeKey(k)] = k;
    });

    for (const c of candidates) {
      const nk = normalizeKey(c);
      if (map[nk]) return String(row[map[nk]]).trim();
    }

    return "";
  };


  const plannedStats = useMemo(() => {
    if (!Array.isArray(prismRows) || prismRows.length === 0) {
      return { total: 0, completed: 0, pending: 0 };
    }

    const total = new Set(prismRows.map(r => r.UNIQUE_CODE)).size;
    const completed = new Set(
      prismRows.filter(r => Number(r.OrderedQty) > 0).map(r => r.UNIQUE_CODE)
    ).size;

    return {
      total,
      completed,
      pending: total - completed
    };
  }, [prismRows]);

  const orderStats = useMemo(() => {
    if (!Array.isArray(prismRows) || prismRows.length === 0) {
      return { completed: 0, pending: 0 };
    }

    const completed = new Set(
      prismRows.filter(r => r.OrderStatus === "YES").map(r => r.UNIQUE_CODE)
    ).size;

    const pending = new Set(
      prismRows.filter(r => r.OrderStatus === "NO").map(r => r.UNIQUE_CODE)
    ).size;

    return { completed, pending };
  }, [prismRows]);





  // Apply filters
  const applyFilters = () => {
    const { search, itemCode, description, refStart, refEnd } = filters;

    // ✅ Pre-compute search terms once
    const searchTerms = String(search || "")
      .split(/[, ]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const start = parseFloat(refStart);
    const end = parseFloat(refEnd);
    const refFilterActive = !isNaN(start) || !isNaN(end);

    // ✅ Pre-define searchable keys once (no recreation inside loop)
    const searchableFields = [
      "ProjectCode",
      "ItemCode",
      "Description",
      "ReferenceB", "REF_B", "Reference B", "Reference_B", "REFB", "Reference"
    ];

    // ✅ Escape regex once
    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const filterRow = (row) => {

      // ✅ Fast Item Code check
      if (itemCode && String(row.ItemCode).trim() !== itemCode.trim()) return false;

      // ✅ Fast Description check
      if (description) {
        const desc = (row.Description || "").toLowerCase();
        if (!desc.includes(description.toLowerCase())) return false;
      }

      // ✅ ReferenceB range check
      if (refFilterActive) {
        const refStr = findRowValue(row, ["ReferenceB", "REF_B", "Reference B", "Reference_B", "REFB", "Reference"]);
        const refVal = refStr ? parseFloat(String(refStr).replace(/[^0-9.\-]/g, "")) : NaN;

        if (isNaN(refVal)) return false;
        if (!isNaN(start) && refVal < start) return false;
        if (!isNaN(end) && refVal > end) return false;
      }

      // ✅ Search terms — optimized single-pass matching
      for (const term of searchTerms) {
        const numericTerm = parseFloat(term);
        const termIsNumeric = !isNaN(numericTerm);

        let matched = false;

        for (const key of searchableFields) {
          if (!(key in row)) continue;

          const value = row[key];
          if (value == null) continue;

          const text = String(value).toLowerCase();

          // Numeric → match exact numeric value or full token
          if (termIsNumeric) {
            const extracted = parseFloat(String(value).replace(/[^0-9.\-]/g, ""));
            if (!isNaN(extracted) && extracted === numericTerm) { matched = true; break; }

            const tokenRegex = new RegExp("\\b" + escapeRegExp(term) + "\\b", "i");
            if (tokenRegex.test(String(value))) { matched = true; break; }
          }
          // Text → substring match
          else if (text.includes(term)) { matched = true; break; }
        }

        // ✅ If any term does NOT match → fail early
        if (!matched) return false;
      }

      return true;
    };

    // ✅ Perform filtering once
    setFilteredRows(rows.filter(filterRow));
    setFilteredIndentRows(indentRows.filter(filterRow));
  };

  // Match prism rows with filteredRows using ItemCode / UNIQUE_CODE
  const filteredPrismRows = useMemo(() => {
    if (!Array.isArray(prismRows) || prismRows.length === 0) return [];

    const filteredItemCodes = new Set(
      filteredRows.map(r => String(r.ItemCode))
    );

    return prismRows.filter(pr =>
      filteredItemCodes.has(String(pr.UNIQUE_CODE))
    );
  }, [filteredRows, prismRows]);


  // Zoomed component renderer
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
      />
      ,

      donutChart: <DonutChart rows={filteredRows} />,
      donutChart2: <DonutChart2 filteredRows={filteredRows} filteredIndentRows={filteredIndentRows} />,
      rawMaterial: <Rawmaterial
        value={`${filteredRows.length} Items`}
        label="Raw Materials"
        bgColor="bg-[var(--color-card)]"
        valueColor="text-[var(--color-primary)]"
        labelColor="text-[var(--color-muted-foreground)]"
      />,
      baught: <Baught
        value={`${filteredRows.length} Items`}
        label="Business Operations Index"
        bgColor="bg-[var(--color-card)]"
        valueColor="text-[var(--color-primary)]"
        labelColor="text-[var(--color-muted-foreground)]"
      />,
      yashgraph: <ReceiptBarChart rows={filteredRows} />,
      dataTable: <DataTable2 rows={filteredRows} indentRows={filteredIndentRows} />,

    };

    // Special handling for dataTable to show full width
    if (activeComponent === 'dataTable') {
      return (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-[var(--color-card)] rounded-[var(--radius)] shadow-2xl w-[98vw] h-[92vh] overflow-auto relative">

            {/* Close Button */}
            <button
              className="absolute top-4 right-4 bg-[var(--color-secondary)] rounded-full w-10 h-10 flex items-center justify-center text-[var(--color-secondary-foreground)] transition-transform duration-200 hover:scale-[1.05]"
              onClick={() => setActiveComponent(null)}
            >
              ×
            </button>

            {/* ✅ Force full width & height */}
            <div className="w-full h-full overflow-auto p-6">
              <DataTable2
                rows={filteredRows}
                indentRows={filteredIndentRows}
                fullView={true}   // <--- add this prop
              />
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
        <div className="bg-[var(--color-card)] rounded-[var(--radius)] shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto transform transition-all duration-300 scale-100">
          <div className="relative">
            <button
              className="absolute -top-2 -right-2 bg-[var(--color-secondary)] rounded-full w-8 h-8 flex items-center justify-center text-[var(--color-secondary-foreground)] transition-transform duration-200 hover:scale-[1.05]"
              onClick={() => setActiveComponent(null)}
            >
              ×
            </button>
            {components[activeComponent]}
          </div>
        </div>
      </div>
    );
  };

  // Upload Modal Component
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
            <div className="mt-4">
              <Uploadfrom2 onUpload={processExcel} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-[var(--color-background)] text-[var(--color-foreground)] transition-colors duration-300 relative ${activeComponent ? 'overflow-hidden' : ''} min-h-screen`}>

      {/* Zoomed Component Overlay */}
      {renderZoomedComponent()}

      {/* Upload Modal */}
      {renderUploadModal()}

      <ItemInsightsPopup
        rows={filteredRows}
        indentRows={filteredIndentRows}
        isOpen={showItemInsights}
        onClose={() => setShowItemInsights(false)}
      />




      {/* Fixed Filter Bar */}
      <div className={`pt-12 fixed max-h-[10%] left-0 right-0 z-10 bg-[var(--color-background)]/95 backdrop-blur-sm shadow-sm ${activeComponent ? 'blur-sm' : ''}`}>
        <div className="flex justify-center items-center ml-3 px-2">
          <Filters
            filters={filters}
            setFilters={setFilters}
            applyFilters={applyFilters}
            rows={rows}
          />
        </div>


        {/* Main Content with Top Padding for Fixed Filter */}
        <div className={`  px-6 x-30 transition-all duration-300 ${activeComponent ? 'blur-sm' : ''}`}>
          {/* Metrics Cards Section */}
          <div className="my-14 mt-2">
            {/* Single Row with All Components */}
            <div className="flex flex-row justify-between items-start gap-2 w-full mb-1">
              {/* Rawmaterial and Baught Components */}
              <div className="flex flex-col gap-1 ">
                <div className="flex flex-row gap-2 w-full">
                  <div className="transform transition-transform w-full duration-200 hover:scale-[1]">
                    <Rawmaterial
                      value={`${uniqueItemCount} `}
                      bgColor="bg-[var(--color-card)]"
                      valueColor="text-[var(--color-primary)]"
                      labelColor="text-[var(--color-muted-foreground)]"
                    />
                  </div>
                  <div className="transform transition-transform w-full duration-200 hover:scale-[1]">
                    <Baught
                      value={`${uniqueBOICount} `}
                      bgColor="bg-[var(--color-card)]"
                      valueColor="text-[var(--color-primary)]"
                      labelColor="text-[var(--color-muted-foreground)]"
                    />
                  </div>
                </div>
                <div className="transform transition-transform w-full duration-200 hover:scale-[1.02]">
                  {/* ReferenceBList Section */}
                  <div >
                    <ReferenceBList
                      rows={filteredRows}
                      selectedRef={selectedRef}
                      onSelectRef={(ref) => {
                        setSelectedRef(ref);
                        // Apply filters again after selection change`
                        setTimeout(() => applyFilters(), 0);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Supplier Name Component with RMSupplier and BOISupplier */}
              <div className="bg-[var(--color-card)] h-45 p-3 rounded-[var(--radius)] font-semibold shadow border border-[var(--color-border)] text-center align-middle w-[70%] transform transition-transform duration-200 hover:scale-[1.02]">
                <h1 >Supplier Name</h1>
                <div className="flex flex-row gap-1 justify-center">

                  <div className="w-[60%]" >
                    <RMSupplier

                      value={`${filteredRows.length} `}
                      
                      suppliers={suppliersByRM}
                    />
                  </div>
                  <div className="w-[60%]">
                    <BOISupplier
                      value={`${filteredRows.length} `}
                      
                      suppliers={suppliersByBOI}
                    />
                  </div>
                </div>
              </div>

              {/* Donut Charts */}
              <div className="flex flex-row gap-2 w-[40%]">
                <div className="transform transition-transform duration-200 hover:scale-[1.02]">
                  <DonutChart plannedStats={plannedStats} />
                </div>

                <div className="transform transition-transform duration-200 hover:scale-[1.02]">
                  <DonutChart2 orderStats={orderStats} />
                </div>
              </div>

            </div>

            {/* Split Layout - Left Half: ReferenceBList, ProjectNumber & ReceiptBarChart, Right Half: DataTable2 */}
            <div className="flex justify-between  items-start gap-2 mb-5">
              {/* Left Half - ReferenceBList, ProjectNumber and ReceiptBarChart */}
              <div className="w-[25%] flex flex-col right-3 ">

                <div>
                  <div className="transform transition-transform duration-200 hover:scale-[1.02]">
                    <ProjectNumber
                      values={[...new Set(filteredRows.map(row => row.ProjectCode))]} // unique project codes horizontal
                      selectedProject={selectedRef} // you can also create a new state for project filter
                      onSelectProject={(project) => {
                        setSelectedRef(project);
                        setTimeout(() => applyFilters(), 0);
                      }}
                    />
                  </div>
                </div>
                {/* ReceiptBarChart Component - Added Here */}
                <div className="mt-1 z-10 transform transition-transform duration-200 hover:scale-[1.02]">
                  <ReceiptBarChart rows={filteredRows} />
                </div>

              </div>

              {/* Right Half - DataTable2 */}
              <div className="w-[75%]  ">
                <div className="bg-[var(--color-card)] p-4 rounded-[var(--radius)] shadow-md relative h-full">
                  <div className="fixed -mt-2 gap-2 mr-15 flex right-10 z-10 items-center">
                   <div className="flex flex-row gap-2">
                     <button
                      onClick={() => setShowItemInsights(true)}
                      className="h-fit text-xs font-semibold bg-[var(--color-primary)] text-[var(--color-primary-foreground)] px-4 py-2 rounded-[var(--radius)] shadow-lg z-20 transition-transform duration-200 hover:scale-[1.05]"
                    >
                      Item Insights
                    </button>

                    {/* Floating Upload Button */}
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className=" bg-[var(--color-primary)] text-[var(--color-primary-foreground)] w-9 h-9 rounded-full shadow-lg flex items-center justify-center z-20 transition-transform duration-300 hover:scale-[1.05]"
                      title="Upload Excel File"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </button>
                   </div>
                    <button
                      className=" p-2  bg-[var(--color-primary)] rounded-[var(--radius)] text-[var(--color-primary-foreground)] transition-transform duration-200 hover:scale-[1.05] z-10"
                      title="Zoom Table"
                      onClick={() => setActiveComponent('dataTable')}
                    >
                      <ZoomIcon />
                    </button>
                  </div>
                  <DataTable2
                    rows={filteredRows}
                    indentRows={filteredIndentRows}
                    fullView={activeComponent === 'dataTable'}
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

export default DataPage2;