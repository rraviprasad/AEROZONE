// src/pages/DataPage2.tsx
import React, { useEffect, useState } from "react";
import { useMemo } from "react";
import Filters from "../components/module2/Filter22";
import * as XLSX from "xlsx";
import DonutChart from "../components/module2/PlannedOrderDonut";
import Rawmaterial from "../components/module2/Rawmaterial1";
import Baught from "../components/module2/Baught1";
import ReferenceBList from "../components/module2/ReferenceBList1";
import ProjectNumber from "../components/module2/ProjectNumber1";

import DataTable2 from "../components/module2/Datatable";
import OrderStatusDonut from "../components/module2/OrderStatusDonut";
import MaterialTypeMatrix from "../components/module2/MaterialMatrix";

// mockPrismRows removed
import ItemInsightsPopup from "../components/module2/ItemInsightsPopup";
import UnifiedStatsBoard from "../components/module2/UnifiedStatsBoard";

// ZoomIcon component
const ZoomIcon = ({ width = 15, height = 15, stroke = "#6366f1" }) => (
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

const Module2Page1 = () => {
    // State management
    const [rows, setRows] = useState([]);
    const [indentRows, setIndentRows] = useState([]);
    const [filteredRows, setFilteredRows] = useState([]);
    const [filteredIndentRows, setFilteredIndentRows] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [activeComponent, setActiveComponent] = useState(null);
    const [selectedRef, setSelectedRef] = useState(null);
    const [orderStats, setOrderStats] = useState({ total: 0, completed: 0, pending: 0 });
    const [plannedStats, setPlannedStats] = useState({ total: 0, completed: 0, pending: 0 });
    const [matchStats, setMatchStats] = useState({ total: 0, completed: 0, pending: 0 });
    const [showItemInsights, setShowItemInsights] = useState(false);


    // Filter state
    const [filters, setFilters] = useState({
        search: "",
        itemCode: "",
        projectCode: "",
        description: "",
        refStart: "",
        refEnd: "",
    });

    // Data fetching effect
    useEffect(() => {
        document.documentElement.classList.add('dark');
        const fetchData = async () => {

            // Helper to process data
            const processRows = (rawData) => {
                return rawData.map(row => {
                    const required = Number(row.RequiredQty) || 0;
                    const ordered = Number(row.OrderedQty) || 0;
                    const diff = required - ordered;

                    return {
                        ...row,
                        Difference: diff,
                        OrderStatus: diff <= 5 ? "YES" : "NO", // "NO" = Pending, "YES" = Completed
                    };
                });
            };

            const updateStats = (rowsWithStatus) => {
                // ----- ORDER STATUS (using diff <= 5 logic) -----
                const total = new Set(rowsWithStatus.map(r => r.UNIQUE_CODE)).size;
                const completed = new Set(rowsWithStatus.filter(r => r.OrderStatus === "YES").map(r => r.UNIQUE_CODE)).size;
                const pending = total - completed;
                setOrderStats({ total, completed, pending });

                // ----- PLANNED ORDER STATUS -----
                const totalIndentCodes = new Set(rowsWithStatus.map(r => r.UNIQUE_CODE)).size;
                const completedPlanned = new Set(rowsWithStatus.filter(r => Number(r.OrderedQty) > 0).map(r => r.UNIQUE_CODE)).size;
                const pendingPlanned = totalIndentCodes - completedPlanned;
                setPlannedStats({ total: totalIndentCodes, completed: completedPlanned, pending: pendingPlanned });
            };


            try {
                const [dataRes] = await Promise.all([
                    fetch("https://aerozone3-1.onrender.com/api/data/prism"),
                ]);

                if (!dataRes.ok) throw new Error("Backend Error");

                const data = await dataRes.json();

                if (!data || data.length === 0) throw new Error("No Data");

                const rowsWithStatus = processRows(data);

                setRows(rowsWithStatus);
                updateStats(rowsWithStatus);
                setFilteredRows(rowsWithStatus);
            } catch (err) {
                console.warn("Backend Error:", err);
                // No mock data fallback
                setRows([]);
                updateStats([]);
                setFilteredRows([]);
            }
        };
        fetchData();
    }, []);

    // Handle backdrop click to close zoomed view
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setActiveComponent(null);
        }
    };

    const normalizeType = (t = "") => t.toString().trim().toUpperCase();

    const RM_KEYWORDS = ["RM", "RAW MATERIAL", "RAW", "RAW MATERIALS"];
    const BOI_KEYWORDS = ["BOI", "BOUGHT OUT", "BOUGHT ITEMS", "BOUGHT MATERIAL"];

    const uniqueItemCount = new Set(
        filteredRows
            .filter(row => {
                const type = normalizeType(row.Category);
                return RM_KEYWORDS.some(k => type === k || type.includes(k));
            })
            .map(row => row.ItemCode)
    ).size;

    const uniqueBOICount = new Set(
        filteredRows
            .filter(row => {
                const type = normalizeType(row.Category);
                return BOI_KEYWORDS.some(k => type === k || type.includes(k));
            })
            .map(row => row.ItemCode)
    ).size;


    // Filter helper functions
    const normalizeKey = (k = "") => String(k).replace(/\s|_|-/g, "").toLowerCase();

    // Apply filters
    const applyFilters = () => {
        const { search, itemCode, description, refStart, refEnd, projectCode } = filters;

        const searchTerms = (search || "")
            .split(/[, ]+/)
            .map((s) => s.trim().toLowerCase())
            .filter(Boolean);

        const start = refStart ? Number(refStart) : null;
        const end = refEnd ? Number(refEnd) : null;
        const refRangeActive = start !== null || end !== null;

        const searchableFields = [
            "ProjectCode",
            "ProjectNo",
            "ItemCode",
            "Description",
            "ReferenceB",
            "REF_B",
            "Reference B",
            "REFB",
            "Reference"
        ];

        const extractRefNum = (ref) => {
            if (!ref) return NaN;
            const numbers = String(ref).match(/\d+/g);
            if (!numbers) return NaN;
            return Number(numbers.join(""));
        };

        const filterRow = (row) => {
            // Item Code partial match
            if (itemCode) {
                const term = itemCode.toLowerCase();
                if (!String(row.ItemCode || "").toLowerCase().includes(term)) return false;
            }

            // Project Code exact match
            if (projectCode) {
                const term = projectCode.toLowerCase();
                if (String(row.ProjectCode || row.ProjectNo || "").toLowerCase() !== term) return false;
            }

            // Description partial match
            if (description) {
                const term = description.toLowerCase();
                if (!String(row.Description || "").toLowerCase().includes(term)) return false;
            }

            // ReferenceB range filter
            // ReferenceB range filter (EXACT numeric from ReferenceB only)
            if (refRangeActive) {
                const refStr =
                    row.ReferenceB || row["REF_B"] || row["Reference B"] || row["REFB"] || row["Reference"];
                const refVal = extractRefNum(refStr);

                if (isNaN(refVal)) return false;
                if (start !== null && refVal < start) return false;
                if (end !== null && refVal > end) return false;
            }

            // General search box filter (EXACT matching)
            if (searchTerms.length) {
                const hasMatch = searchTerms.some(term =>
                    searchableFields.some(key => {
                        const value = row[key];
                        if (!value) return false;
                        return String(value).trim().toLowerCase() === term;
                    })
                );

                if (!hasMatch) return false;
            }

            return true;
        };

        // 🔥 Recalculate Difference + OrderStatus again before filtering (ensures live updates)
        const processedRows = rows.map(r => {
            const required = Number(r.RequiredQty) || 0;
            const ordered = Number(r.OrderedQty) || 0;
            const diff = required - ordered;

            return {
                ...r,
                Difference: diff,
                OrderStatus: diff <= 5 ? "YES" : "NO"
            };
        });

        const processedIndentRows = indentRows.map(r => {
            const required = Number(r.RequiredQty) || 0;
            const ordered = Number(r.OrderedQty) || 0;
            const diff = required - ordered;

            return {
                ...r,
                Difference: diff,
                OrderStatus: diff <= 5 ? "YES" : "NO"

            };
        });

        // 🔥 Table should show BOTH pending (NO) and completed (YES)
        setFilteredRows(
            processedRows.filter(r => filterRow(r))
        );

        setFilteredIndentRows(
            processedIndentRows.filter(r => filterRow(r))
        );

    };

    useEffect(() => {
        if (!filteredRows.length) return;

        const totalIndentCodes = new Set(filteredRows.map(r => r.UNIQUE_CODE)).size;

        const matchedCodes = new Set(
            filteredRows.filter(r => Number(r.OrderedQty) > 0).map(r => r.UNIQUE_CODE)
        ).size;

        const pendingCodes = totalIndentCodes - matchedCodes;

        setMatchStats({
            total: totalIndentCodes,
            completed: matchedCodes,
            pending: pendingCodes
        });
    }, [filteredRows]);

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
            />,

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
            dataTable: <DataTable2 rows={filteredRows} indentRows={filteredIndentRows} />,
        };

        // Special handling for dataTable to show full width
        if (activeComponent === 'dataTable') {
            return (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={handleBackdropClick}
                >
                    <div className="relative w-[98vw] h-[92vh] drop-shadow-2xl">
                        <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-[1px] clip-angled h-full">
                            <div className="bg-[var(--color-card)] clip-angled w-full h-full overflow-auto relative">

                                {/* Close Button */}
                                <button
                                    className="absolute top-4 right-4 bg-[var(--color-secondary)] clip-angled w-10 h-10 flex items-center justify-center text-[var(--color-secondary-foreground)] transition-transform duration-200 hover:scale-[1.05]"
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
                    <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-[1px] clip-angled h-full">
                        <div className="bg-[var(--color-card)] clip-angled p-6 w-full h-full overflow-auto transform transition-all duration-300 scale-100">
                            <div className="relative">
                                <button
                                    className="absolute -top-2 -right-2 bg-[var(--color-secondary)] clip-angled w-8 h-8 flex items-center justify-center text-[var(--color-secondary-foreground)] transition-transform duration-200 hover:scale-[1.05]"
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

    return (
        <div className={`dark bg-black text-[var(--color-foreground)] transition-colors duration-300 relative ${activeComponent ? 'overflow-hidden' : ''} min-h-screen`}>


            {renderZoomedComponent()}

            <ItemInsightsPopup
                rows={filteredRows}
                isOpen={showItemInsights}
                onClose={() => setShowItemInsights(false)}
            />



            {/* Main Content with Top Padding for Fixed Filter */}
            <div className={`pt-12 px-4 sm:px-6 lg:px-8 pb-2 transition-all duration-300 ${activeComponent ? 'blur-sm' : ''}`}>
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
                <div className="">
                    {/* Grid Layout for Top Components */}
                    <div className="flex flex-row justify-between gap-1 w-full  ">

                        {/* Col 1: Planned Order Donut */}
                        <div className="h-[200px] w-full transform transition-transform duration-200 hover:scale-[1.02]">
                            <DonutChart plannedStats={matchStats} />
                        </div>

                        {/* Col 2: Order Status Donut */}
                        <div className="h-[200px] w-full transform transition-transform duration-200 hover:scale-[1.02]">
                            <OrderStatusDonut filteredRows={filteredRows} />
                        </div>

                        {/* Col 3: Stats & Lists (RM, BOI, Projects, Refs) - UNIFIED CONTAINER */}
                        <div className="w-full">

                            <UnifiedStatsBoard
                                filteredRows={filteredRows}
                                uniqueItemCount={uniqueItemCount}
                                uniqueBOICount={uniqueBOICount}
                                selectedRef={selectedRef}
                                setSelectedRef={setSelectedRef}
                                applyFilters={applyFilters}
                                setSelectedProject={setSelectedProject}
                            />
                        </div>

                        {/* Col 4: Material Type Matrix */}
                        <div className="h-[200px] w-full transform transition-transform duration-200 hover:scale-[1.02]">
                            <MaterialTypeMatrix rows={filteredRows} />
                        </div>

                    </div>


                    {/* Right Half - DataTable2 */}
                    <div className="w-full mt-1 ">
                        <div className="relative  drop-shadow-md">
                            <div className="bg-gradient-to-br from-orange-600 to-orange-800 p-[1px] clip-angled h-full">
                                <div className="bg-black clip-angled p-2 h-full relative">
                                    <div className="fixed mt-2 gap-2 mr-15 flex right-5 z-10 items-center">
                   <div className="flex flex-row gap-2">
                                        <button
                                            onClick={() => setShowItemInsights(true)}
                                            className=" text-sm w-full h-8  bg-gradient-to-br from-orange-600 to-orange-800 clip-angled  clip-angled shadow-lg z-20 transition-transform duration-200 hover:scale-[1.05]"
                                        >
                                            Item Insights
                                        </button>

                                        {/* Floating Upload Button */}
                                        <button
                                            onClick={() => setShowUploadModal(true)}
                                            className="bg-gradient-to-br from-orange-600 to-orange-800 clip-angled w-18 h-8 clip-angled shadow-lg flex items-center justify-center z-20 transition-transform duration-300 hover:scale-[1.05]"
                                            title="Upload Excel File"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                <polyline points="17 8 12 3 7 8"></polyline>
                                                <line x1="12" y1="3" x2="12" y2="15"></line>
                                            </svg>
                                        </button>
                                        </div>
                                        <button
                                            className="h-8 p-2 bg-[var(--color-primary)] clip-angled text-[var(--color-primary-foreground)] transition-transform duration-200 hover:scale-[1.05] z-10  dark:bg-white dark:text-black"
                                            title="Zoom Table"
                                            onClick={() => setActiveComponent('dataTable')}
                                        >
                                            <ZoomIcon />
                                        </button>
                                    </div>
                                    <DataTable2
                                        rows={filteredRows.filter(r => r.OrderStatus === "NO")}  // <--- only NO rows
                                        indentRows={filteredIndentRows.filter(r => r.OrderStatus === "NO")}
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

export default Module2Page1;