/**
 * Aerozone 5.O — Reverse Engineering Data Extractor
 * Generates a comprehensive Excel workbook with all project data.
 * 
 * Usage: node extract_project_data.js
 * Output: Aerozone_5O_ReverseEngineering.xlsx
 */

const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

// ============================================================
// SHEET 1: Project Overview
// ============================================================
const overviewData = [
    ["AEROZONE 5.O — REVERSE ENGINEERING DATA EXPORT"],
    ["Generated", new Date().toLocaleString()],
    [],
    ["FIELD", "VALUE"],
    ["Project Name", "Aerozone 5.O"],
    ["Description", "Aviation Materials Management & Analytics Platform"],
    ["Frontend Framework", "React 19.1.0"],
    ["Build Tool", "Vite 7.0.4"],
    ["CSS Framework", "TailwindCSS 4.1.13"],
    ["Backend Framework", "Express 5.1.0"],
    ["Database", "Firebase Firestore (Cloud)"],
    ["Module System (Backend)", "CommonJS (require)"],
    ["Module System (Frontend)", "ES Modules (import)"],
    ["Default Theme", "Dark Mode (locked)"],
    ["Backend Port", "5000 (or process.env.PORT)"],
    ["Total Frontend Pages", 8],
    ["Total Component Files", 59],
    ["Total Module Directories", 5],
    ["Total Backend Routes", 6],
    ["Firestore Collections", 2],
];

// ============================================================
// SHEET 2: Full Directory Structure
// ============================================================
function walkDir(dir, prefix = "", results = []) {
    try {
        const items = fs.readdirSync(dir);
        // Sort: directories first, then files
        const sorted = items
            .filter(i => !["node_modules", ".git", "package-lock.json"].includes(i))
            .sort((a, b) => {
                const aIsDir = fs.statSync(path.join(dir, a)).isDirectory();
                const bIsDir = fs.statSync(path.join(dir, b)).isDirectory();
                if (aIsDir && !bIsDir) return -1;
                if (!aIsDir && bIsDir) return 1;
                return a.localeCompare(b);
            });

        for (const item of sorted) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            const relativePath = path.relative(
                path.join(__dirname),
                fullPath
            ).replace(/\\/g, "/");

            if (stat.isDirectory()) {
                const childCount = fs.readdirSync(fullPath).filter(
                    i => !["node_modules", ".git", "package-lock.json"].includes(i)
                ).length;
                results.push([relativePath + "/", "Directory", "", childCount + " items"]);
                walkDir(fullPath, prefix + "  ", results);
            } else {
                const sizeKB = (stat.size / 1024).toFixed(1);
                const ext = path.extname(item);
                results.push([relativePath, "File", ext, sizeKB + " KB"]);
            }
        }
    } catch (e) { /* skip */ }
    return results;
}

const directoryData = [
    ["PATH", "TYPE", "EXTENSION", "SIZE / CHILDREN"],
    ...walkDir(__dirname)
];

// ============================================================
// SHEET 3: API Endpoints
// ============================================================
const apiData = [
    ["METHOD", "ENDPOINT", "FULL URL", "REQUEST BODY", "RESPONSE FORMAT", "USED BY MODULE(S)", "DESCRIPTION"],
    [
        "POST", "/api/data/upload-excel",
        "http://localhost:5000/api/data/upload-excel",
        "multipart/form-data (field: 'file')",
        "{ message, saved, deleted, rowsProcessed }",
        "Main Chart, Planer Checker",
        "Upload Excel file → parse → batch write to Firestore excelData collection"
    ],
    [
        "GET", "/api/data/get-data",
        "http://localhost:5000/api/data/get-data",
        "None",
        "Array<ExcelRow & IndentFields>",
        "Main Chart (DataPage), Planer Checker (DataPage2)",
        "Fetch all excelData LEFT JOIN Indent_Quantity on ItemCode → ITEM_CODE. Adds IndentQuantity, IndentUOM, IndentProject, IndentPlannedOrder."
    ],
    [
        "GET", "/api/data/get-indent",
        "http://localhost:5000/api/data/get-indent",
        "None",
        "Array<IndentRow>",
        "Direct access",
        "Fetch raw Indent_Quantity collection from Firestore"
    ],
    [
        "GET", "/api/data/prism",
        "http://localhost:5000/api/data/prism",
        "None",
        "Array<PrismRow>",
        "Prism (Module2Page1), Planer Checker (DataPage2)",
        "Group excelData + Indent_Quantity by UniqueCode/UNIQUE_CODE. LEFT JOIN indent→excel. Fields: UNIQUE_CODE, ReferenceB, ProjectNo, ItemCode, Description, Category, Type, OrderedQty, RequiredQty, Difference, UOM, PlannedOrder"
    ],
    [
        "GET", "/api/data/orbit",
        "http://localhost:5000/api/data/orbit",
        "None",
        "Array<OrbitRow>",
        "Orbit (Module3Page1)",
        "Flat export of excelData with geographic fields: Currency, Date, ItemCode, ItemShortDescription, OrderLineValue, OrderedLineQuantity, PONo, PlannedReceiptDate, ProjectCode, SupplierName, UOM, Category, CustomerName, Type, City, Country, ReferenceB"
    ],
    [
        "GET", "/api/data/analysis",
        "http://localhost:5000/api/data/analysis",
        "None",
        "Array<AnalysisRow>",
        "Analysis (Analysis1page)",
        "Export excelData with calculated Rate = OrderLineValue / OrderedLineQuantity (3 decimal places). Fields: Currency, ReferenceB, ItemCode, ItemShortDescription, ProjectCode, SupplierName, PONo, OrderLineValue, OrderedLineQuantity, UOM, PlannedReceiptDate, Rate"
    ],
];

// ============================================================
// SHEET 4: Firestore Schema — excelData
// ============================================================
const excelDataSchema = [
    ["FIELD NAME", "DATA TYPE", "SOURCE (Excel Column Index)", "DESCRIPTION", "COMPUTED?"],
    ["UniqueCode", "string", "Computed", "refNum + projectCode + itemCode", "Yes"],
    ["ReferenceB", "string", "row[45]", "Reference B (raw string with numbers)", "No"],
    ["ProjectCode", "string", "row[8]", "Project identifier", "No"],
    ["ItemCode", "string", "row[9]", "Material item code", "No"],
    ["ItemShortDescription", "string", "row[10]", "Item description", "No"],
    ["Category", "string", "row[4]", "Material category", "No"],
    ["SupplierName", "string", "row[3]", "Supplier name", "No"],
    ["PONo", "string/number", "row[5]", "Purchase order number", "No"],
    ["Date", "string (DD-MMM-YYYY)", "row[14]", "Formatted date", "No"],
    ["OrderedLineQuantity", "number", "row[19]", "Quantity ordered", "No"],
    ["UOM", "string", "row[16]", "Unit of measure", "No"],
    ["OrderLineValue", "number", "row[25]", "Monetary value of order line", "No"],
    ["Currency", "string", "row[23]", "Currency code (INR, USD, etc.)", "No"],
    ["PlannedReceiptDate", "string (DD-MMM-YYYY)", "row[15]", "Planned receipt date formatted", "No"],
    ["Delivery", "string (DD-MMM-YYYY)", "Computed", "PlannedReceiptDate + 31 days", "Yes"],
    ["InventoryQuantity", "number", "row[43]", "On-hand stock quantity", "No"],
    ["InventoryUOM", "string", "row[16]", "Same as UOM", "No"],
    ["InventoryValue", "number", "Computed", "(OrderLineValue / OrderedQty) × OnHand", "Yes"],
    ["Type", "string", "row[46] + row[47]", "Concatenation of Type + Material codes", "Yes (concat)"],
    ["CustomerName", "string", "row[49]", "Customer name", "No"],
    ["City", "string", "row[50]", "City", "No"],
    ["Country", "string", "row[51]", "Country", "No"],
];

// ============================================================
// SHEET 5: Firestore Schema — Indent_Quantity
// ============================================================
const indentSchema = [
    ["FIELD NAME", "DATA TYPE", "DESCRIPTION", "USED IN JOIN?"],
    ["UNIQUE_CODE", "string", "Same format as UniqueCode (refNum + projectCode + itemCode)", "Yes (prism endpoint)"],
    ["ITEM_CODE", "string", "Item code — joins to excelData.ItemCode", "Yes (get-data endpoint)"],
    ["ITEM_DESCRIPTION", "string", "Item description", "No"],
    ["CATEGORY", "string", "Material category", "No"],
    ["PROJECT_NO", "string", "Project number", "No"],
    ["REQUIRED_QTY", "number", "Required quantity", "No"],
    ["UOM", "string", "Unit of measure", "No"],
    ["PLANNED_ORDER", "string", "Planned order reference", "No"],
    ["TYPE", "string", "Material type (SHEETS, BarIN, etc.)", "No"],
    ["ReferenceB", "string", "Reference B value", "No"],
];

// ============================================================
// SHEET 6: Routes & Pages
// ============================================================
const routesData = [
    ["ROUTE PATH", "PAGE FILE", "COMPONENT NAME", "API ENDPOINT(S) USED", "MODULE NAME", "DESCRIPTION", "STATUS"],
    ["/", "pages/Home.jsx", "Home", "None", "Home", "Landing page with GSAP animations, module cards, hero section, CTA", "✅ Active"],
    ["/data", "pages/DataPage.jsx", "DataPage", "GET /get-data", "Main Chart", "Primary data table + pie/line/bar charts with Excel upload", "✅ Active"],
    ["/data2", "pages/DataPage2.jsx", "DataPage2", "GET /get-data, GET /prism", "Planer Checker", "Enhanced dashboard with donut charts, receipt bar chart, zoomable panels", "✅ Active"],
    ["/Module2Page1", "pages/Module2Page1.jsx", "Module2Page1", "GET /prism", "Prism", "Indent vs ordered comparison, material matrix, order status donuts", "✅ Active"],
    ["/Module3Page1", "pages/Module3Page1.jsx", "Module3Page1", "GET /orbit", "Orbit", "World map, 3D cylinders, geographic distribution, type cubes", "✅ Active"],
    ["/Analysis1page", "pages/Analysis1page.jsx", "Analysis1page", "GET /analysis", "Analysis", "Rate analysis, combo charts (bar+line), trading-view style charts", "✅ Active"],
    ["/Analysis2page", "pages/Analysis2page.jsx", "Analysis2page", "None", "Analysis 2", "Placeholder — 'Work in progress'", "🚧 WIP"],
    ["/pdf-to-json", "pages/PdfJson.jsx", "App (PdfJson)", "None (client-side)", "PDF to JSON", "Upload PDF → parse → download as JSON or Excel", "✅ Active"],
];

// ============================================================
// SHEET 7: All Components Inventory
// ============================================================
const componentsData = [
    ["COMPONENT FILE", "MODULE", "RELATIVE PATH", "SIZE (KB)", "COMPONENT NAME", "PURPOSE", "KEY FEATURES"],
    // Global / src/components
    ["GlobalLoader.jsx", "Global", "src/components/GlobalLoader.jsx", "1.4", "GlobalLoader", "Full-screen loading overlay", "Lottie airplane animation, 3s duration, triggers on route change"],
    ["PlaneLoader.jsx", "Global", "src/components/PlaneLoader.jsx", "3.2", "PlaneLoader", "Dual spinning planes loader", "SVG planes orbiting with dashed ring track"],
    ["PageTransitionLoader.jsx", "Global", "src/components/PageTransitionLoader.jsx", "0.3", "PageTransitionLoader", "Page transition overlay", "Backdrop blur + PlaneLoader"],
    ["ThemeToggle.jsx", "Global", "src/components/ThemeToggle.jsx", "2.5", "ThemeToggle", "Theme switch button", "Sun/Moon icons — NON-FUNCTIONAL (dark mode locked)"],
    // Module 1
    ["Navbar.jsx", "Module 1", "components/module1/Navbar.jsx", "8.1", "Navbar", "Global navigation bar", "Desktop horizontal nav + mobile drawer, dropdowns for Analysis & Menu"],
    ["Navbar2.jsx", "Module 1", "components/module1/Navbar2.jsx", "14.2", "Navbar2", "Alternative navbar", "Feature-rich alternative (not used in routing)"],
    ["DataTable.jsx", "Module 1", "components/module1/DataTable.jsx", "10.3", "DataTable", "Sortable data table", "Column sorting, scrollable, striped rows"],
    ["DataTable2.jsx", "Module 1", "components/module1/DataTable2.jsx", "16.6", "DataTable2", "Extended data table", "More columns, advanced features"],
    ["Filter.jsx", "Module 1", "components/module1/Filter.jsx", "4.5", "Filters", "Filter panel (Module 1)", "Search, Project Code, Item Code, Description filters"],
    ["Filter2.jsx", "Module 1", "components/module1/Filter2.jsx", "6.0", "Filters", "Enhanced filter panel", "Additional filter dimensions for Planer Checker"],
    ["UploadForm.jsx", "Module 1", "components/module1/UploadForm.jsx", "3.1", "UploadForm", "Excel upload form", "File select + POST to /upload-excel"],
    ["Uploadfrom2.jsx", "Module 1", "components/module1/Uploadfrom2.jsx", "2.2", "Uploadfrom2", "Upload form variant", "Alternative upload UX"],
    ["PieChart.jsx", "Module 1", "components/module1/PieChart.jsx", "3.2", "PieCharts", "Pie chart", "Category/project distribution via Chart.js"],
    ["DonutChart.jsx", "Module 1", "components/module1/DonutChart.jsx", "3.1", "DonutChart", "Donut chart variant 1", "Hollow center pie chart"],
    ["DonutChart2.jsx", "Module 1", "components/module1/DonutChart2.jsx", "2.6", "DonutChart2", "Donut chart variant 2", "Different data slicing"],
    ["BarChart.jsx", "Module 1", "components/module1/BarChart.jsx", "12.8", "BarChart", "Bar chart", "Comparison visualizations via Chart.js"],
    ["LineChart.jsx", "Module 1", "components/module1/LineChart.jsx", "2.9", "LineChart", "Line chart", "Trend over time"],
    ["ReciptBarchart.jsx", "Module 1", "components/module1/ReciptBarchart.jsx", "17.7", "ReciptBarchart", "Receipt analysis bar chart", "Timeline of receipts, complex data processing"],
    ["ItemInsightsPopup.jsx", "Module 1", "components/module1/ItemInsightsPopup.jsx", "17.6", "ItemInsightsPopup", "Item detail modal", "Full item details in popup (largest component at 18KB)"],
    ["ProjectNumber.jsx", "Module 1", "components/module1/ProjectNumber.jsx", "1.8", "ProjectNumber", "Project number widget", "Project selector/display"],
    ["ReferenceBList.jsx", "Module 1", "components/module1/ReferenceBList.jsx", "2.2", "ReferenceBList", "Reference B list", "Reference number list display"],
    ["SuppilerName.jsx", "Module 1", "components/module1/SuppilerName.jsx", "1.5", "SuppilerName", "Supplier name display", "Supplier info widget (typo in filename)"],
    ["Rawmaterial.jsx", "Module 1", "components/module1/Rawmaterial.jsx", "0.7", "Rawmaterial", "Raw material widget", "Category indicator for raw materials"],
    ["Baught.jsx", "Module 1", "components/module1/Baught.jsx", "0.7", "Baught", "Bought-out widget", "Category indicator for bought-out items"],
    ["RMSupplier.jsx", "Module 1", "components/module1/RMSupplier.jsx", "0.8", "RMSupplier", "RM supplier widget", "Raw material supplier display"],
    ["BOISupplier.jsx", "Module 1", "components/module1/BOISupplier.jsx", "0.8", "BOISupplier", "BOI supplier widget", "Bought-out item supplier display"],
    ["Pinicon.jsx", "Module 1", "components/module1/Pinicon.jsx", "2.0", "Pinicon", "Pin/map icon", "Location pin icon component"],
    ["Preloader.jsx", "Module 1", "components/module1/Preloader.jsx", "1.3", "Preloader", "Section preloader", "Section-level loading indicator"],
    ["Yashgraph.jsx", "Module 1", "components/module1/Yashgraph.jsx", "1.4", "Yashgraph", "Custom graph", "Custom graph component"],
    // Module 2
    ["Datatable.jsx", "Module 2 (Prism)", "components/module2/Datatable.jsx", "16.2", "Datatable", "Prism data table", "Prism-specific columns: RequiredQty, OrderedQty, Difference"],
    ["Filter22.jsx", "Module 2 (Prism)", "components/module2/Filter22.jsx", "9.5", "Filter22", "Prism filter panel", "Reference, project, item, type filters"],
    ["ItemInsightsPopup.jsx", "Module 2 (Prism)", "components/module2/ItemInsightsPopup.jsx", "4.9", "ItemInsightsPopup", "Prism item insights", "Simplified item details popup"],
    ["Navbar22.jsx", "Module 2 (Prism)", "components/module2/Navbar22.jsx", "17.9", "Navbar22", "Module-specific navbar", "Feature-rich navbar for Prism module"],
    ["MaterialMatrix.jsx", "Module 2 (Prism)", "components/module2/MaterialMatrix.jsx", "2.7", "MaterialMatrix", "Material type matrix", "Visual matrix of material types"],
    ["OrderStatusDonut.jsx", "Module 2 (Prism)", "components/module2/OrderStatusDonut.jsx", "4.4", "OrderStatusDonut", "Order status donut", "Fully/Partially/Not Ordered distribution"],
    ["PlannedOrderDonut.jsx", "Module 2 (Prism)", "components/module2/PlannedOrderDonut.jsx", "4.0", "PlannedOrderDonut", "Planned order donut", "Planned vs actual order distribution"],
    ["UnifiedStatsBoard.jsx", "Module 2 (Prism)", "components/module2/UnifiedStatsBoard.jsx", "2.8", "UnifiedStatsBoard", "Stats summary board", "KPI cards for order statistics"],
    ["ProjectNumber1.jsx", "Module 2 (Prism)", "components/module2/ProjectNumber1.jsx", "2.3", "ProjectNumber1", "Project widget", "Project number selector for Prism"],
    ["ReferenceBList1.jsx", "Module 2 (Prism)", "components/module2/ReferenceBList1.jsx", "3.6", "ReferenceBList1", "Reference list", "Reference B list for Prism"],
    ["Rawmaterial1.jsx", "Module 2 (Prism)", "components/module2/Rawmaterial1.jsx", "1.3", "Rawmaterial1", "Raw material widget", "Category indicator"],
    ["Baught1.jsx", "Module 2 (Prism)", "components/module2/Baught1.jsx", "1.3", "Baught1", "Bought-out widget", "Category indicator"],
    ["RMSupplier1.jsx", "Module 2 (Prism)", "components/module2/RMSupplier1.jsx", "1.3", "RMSupplier1", "RM supplier widget", "Supplier display"],
    ["BOISupplier1.jsx", "Module 2 (Prism)", "components/module2/BOISupplier1.jsx", "1.3", "BOISupplier1", "BOI supplier widget", "Supplier display"],
    // Module 3
    ["Datatable.jsx", "Module 3 (Orbit)", "components/module3/Datatable.jsx", "12.4", "Datatable", "Orbit data table", "Geographic-enriched columns"],
    ["Filter22.jsx", "Module 3 (Orbit)", "components/module3/Filter22.jsx", "9.3", "Filter22", "Orbit filter panel", "Customer, city, country filters"],
    ["ReciptBarchart.jsx", "Module 3 (Orbit)", "components/module3/ReciptBarchart.jsx", "8.4", "ReciptBarchart", "Receipt bar chart", "Receipt timeline for Orbit"],
    ["ReferenceBList1.jsx", "Module 3 (Orbit)", "components/module3/ReferenceBList1.jsx", "3.7", "ReferenceBList1", "Reference list", "Reference display"],
    ["Rawmaterial1.jsx", "Module 3 (Orbit)", "components/module3/Rawmaterial1.jsx", "1.3", "Rawmaterial1", "Raw material widget", "Category indicator"],
    ["Baught1.jsx", "Module 3 (Orbit)", "components/module3/Baught1.jsx", "1.3", "Baught1", "Bought-out widget", "Category indicator"],
    ["AmountTable.jsx", "Module 3 (Orbit)", "components/module3/AmountTable.jsx", "3.5", "AmountTable", "Amount summary table", "Value/currency summary"],
    ["CustomerName.jsx", "Module 3 (Orbit)", "components/module3/CustomerName.jsx", "2.6", "CustomerName", "Customer name widget", "Customer display + filter"],
    ["ProjectCylinder.jsx", "Module 3 (Orbit)", "components/module3/ProjectCylinder.jsx", "7.7", "ProjectCylinder", "3D cylinder chart", "Three.js/CSS 3D project distribution cylinders"],
    ["WorldMap.jsx", "Module 3 (Orbit)", "components/module3/WorldMap.jsx", "6.5", "WorldMap", "World map", "Highcharts geographic visualization of suppliers/customers"],
    ["Typecubescence.jsx", "Module 3 (Orbit)", "components/module3/Typecubescence.jsx", "2.8", "Typecubescence", "Type category cubes", "Visual cube for material types"],
    ["materialCube2.jsx", "Module 3 (Orbit)", "components/module3/materialCube2.jsx", "0.9", "materialCube2", "Material cube helper", "Helper component for cubes"],
    // Module 4
    ["DataTable.jsx", "Module 4 (Analysis)", "components/module4/DataTable.jsx", "12.4", "DataTable", "Analysis data table", "Rate column, sortable"],
    ["Filter22.jsx", "Module 4 (Analysis)", "components/module4/Filter22.jsx", "5.6", "Filter22", "Analysis filter panel", "Supplier, PO, item filters"],
    ["AnalysisComboChart.jsx", "Module 4 (Analysis)", "components/module4/AnalysisComboChart.jsx", "5.5", "AnalysisComboChart", "Combo chart", "Dual-axis bar + line chart"],
    ["TradingViewChart.jsx", "Module 4 (Analysis)", "components/module4/TradingViewChart.jsx", "2.2", "TradingViewChart", "Trading chart", "Financial-style chart interface"],
    // Module 5
    ["DataTable.jsx", "Module 5 (WIP)", "components/module5/DataTable.jsx", "12.0", "DataTable", "Reserved data table", "Prepared but page is WIP"],
    ["Filter22.jsx", "Module 5 (WIP)", "components/module5/Filter22.jsx", "5.4", "Filter22", "Reserved filter panel", "Prepared but page is WIP"],
    ["Typecubescence.jsx", "Module 5 (WIP)", "components/module5/Typecubescence.jsx", "2.8", "Typecubescence", "Reserved type cubes", "Prepared but page is WIP"],
    ["materialCube2.jsx", "Module 5 (WIP)", "components/module5/materialCube2.jsx", "0.9", "materialCube2", "Reserved material cube", "Prepared but page is WIP"],
];

// ============================================================
// SHEET 8: Dependencies — Backend
// ============================================================
const backendDepsData = [
    ["PACKAGE", "VERSION", "TYPE", "PURPOSE", "NOTES"],
    ["express", "^5.1.0", "Production", "Web framework", "Express 5 (latest major)"],
    ["cors", "^2.8.5", "Production", "Cross-origin resource sharing", "Wide open — all origins allowed"],
    ["dotenv", "^17.2.3", "Production", "Environment variable loading", "Loads .env file"],
    ["firebase-admin", "^13.5.0", "Production", "Server-side Firebase SDK", "Full Firestore admin privileges"],
    ["firebase", "^12.2.1", "Production", "Firebase client SDK", "⚠️ Installed but appears UNUSED"],
    ["multer", "^2.0.2", "Production", "Multipart file upload handling", "Memory storage mode"],
    ["xlsx", "^0.18.5", "Production", "Excel file parsing", "SheetJS library"],
];

// ============================================================
// SHEET 9: Dependencies — Frontend
// ============================================================
const frontendDepsData = [
    ["PACKAGE", "VERSION", "TYPE", "CATEGORY", "PURPOSE", "NOTES"],
    // Core
    ["react", "^19.1.0", "Production", "Core", "UI framework", "React 19 (latest)"],
    ["react-dom", "^19.1.0", "Production", "Core", "React DOM rendering", ""],
    ["react-router-dom", "^7.8.2", "Production", "Core", "Client-side routing", "BrowserRouter, Routes, Route, Link"],
    // Styling
    ["tailwindcss", "^4.1.13", "Production", "Styling", "CSS utility framework", "v4 with new config format"],
    ["@tailwindcss/vite", "^4.1.13", "Production", "Styling", "Vite integration for Tailwind", "Plugin-based setup"],
    ["tw-animate-css", "^1.3.8", "Dev", "Styling", "Animation utilities", "animate-in, fade-in, etc."],
    ["clsx", "^2.1.1", "Production", "Styling", "Conditional class names", "Used in cn() helper"],
    ["tailwind-merge", "^3.3.1", "Production", "Styling", "Merge Tailwind classes", "Used in cn() helper"],
    ["class-variance-authority", "^0.7.1", "Production", "Styling", "Component variants", "shadcn/ui pattern"],
    // Charting
    ["chart.js", "^4.5.0", "Production", "Charts", "Base chart engine", "Used by react-chartjs-2"],
    ["react-chartjs-2", "^5.3.0", "Production", "Charts", "React wrapper for Chart.js", "Pie, Bar, Line, Donut charts"],
    ["chartjs-adapter-date-fns", "^3.0.0", "Production", "Charts", "Date adapter for Chart.js", "Time-series support"],
    ["chartjs-plugin-zoom", "^2.2.0", "Production", "Charts", "Zoom/pan for Chart.js", "Interactive chart zoom"],
    ["highcharts", "^12.4.0", "Production", "Charts", "Advanced charting", "Used for World Map"],
    ["highcharts-react-official", "^3.2.3", "Production", "Charts", "React Highcharts wrapper", ""],
    ["@highcharts/map-collection", "^2.3.2", "Production", "Charts", "Map data for Highcharts", "World map GeoJSON"],
    ["recharts", "^3.3.0", "Production", "Charts", "Declarative React charts", "Alternative chart library"],
    ["plotly.js", "^3.1.0", "Production", "Charts", "Scientific charting", "Heavy library"],
    ["react-plotly.js", "^2.6.0", "Production", "Charts", "React Plotly wrapper", ""],
    // Animation
    ["gsap", "^3.13.0", "Production", "Animation", "Animation library", "ScrollTrigger, timeline animations"],
    ["@gsap/react", "^2.1.2", "Production", "Animation", "React GSAP integration", ""],
    ["@lottiefiles/dotlottie-react", "^0.17.8", "Production", "Animation", "Lottie player (dotLottie)", "Airplane loading animation"],
    ["lottie-react", "^2.4.1", "Production", "Animation", "Lottie player (JSON)", "Alternative Lottie player"],
    ["motion", "^12.23.24", "Production", "Animation", "Motion/Framer animations", ""],
    // 3D
    ["three", "^0.182.0", "Production", "3D", "3D rendering engine", "Three.js"],
    ["@react-three/fiber", "^9.5.0", "Production", "3D", "React Three.js wrapper", ""],
    ["@react-three/drei", "^10.7.7", "Production", "3D", "Three.js helpers", "Pre-built 3D components"],
    ["ogl", "^1.0.11", "Production", "3D", "WebGL abstraction", "Lightweight WebGL"],
    // Utility
    ["xlsx", "^0.18.5", "Production", "Utility", "Client-side Excel processing", "SheetJS"],
    ["i18n-iso-countries", "^7.14.0", "Production", "Utility", "Country code mapping", "ISO country codes/names"],
    ["lucide-react", "^0.543.0", "Production", "Icons", "Icon library", "Ruler, Gem, Globe, etc."],
    ["@studio-freight/lenis", "^1.0.42", "Production", "Scroll", "Smooth scrolling", "⚠️ Imported but COMMENTED OUT"],
    // Dev
    ["vite", "^7.0.4", "Dev", "Build", "Build tool & dev server", ""],
    ["@vitejs/plugin-react", "^4.6.0", "Dev", "Build", "React plugin for Vite", ""],
    ["eslint", "^9.30.1", "Dev", "Linting", "Code linter", ""],
    ["@eslint/js", "^9.30.1", "Dev", "Linting", "ESLint JS config", ""],
    ["eslint-plugin-react-hooks", "^5.2.0", "Dev", "Linting", "React hooks linting", ""],
    ["eslint-plugin-react-refresh", "^0.4.20", "Dev", "Linting", "React Refresh lint", ""],
    ["globals", "^16.3.0", "Dev", "Linting", "Global variable definitions", ""],
    ["@types/react", "^19.1.8", "Dev", "Types", "React type definitions", "For IDE support (no TS used)"],
    ["@types/react-dom", "^19.1.6", "Dev", "Types", "ReactDOM type definitions", "For IDE support (no TS used)"],
];

// ============================================================
// SHEET 10: Excel Column Mapping (Upload)
// ============================================================
const columnMappingData = [
    ["EXCEL COLUMN INDEX", "FIRESTORE FIELD", "DATA TYPE", "DESCRIPTION", "TRANSFORMATIONS APPLIED"],
    ["row[3]", "SupplierName", "string", "Supplier name", "Direct mapping"],
    ["row[4]", "Category", "string", "Material category", "Direct mapping"],
    ["row[5]", "PONo", "string/number", "Purchase order number", "Direct mapping"],
    ["row[8]", "ProjectCode", "string", "Project code", "String().trim()"],
    ["row[9]", "ItemCode", "string", "Item code", "String().trim()"],
    ["row[10]", "ItemShortDescription", "string", "Item description", "Direct mapping"],
    ["row[14]", "Date", "string", "Order date", "parseDate() → formatDateToDDMMMYYYY()"],
    ["row[15]", "PlannedReceiptDate", "string", "Planned receipt date", "parseDate() → formatDateToDDMMMYYYY()"],
    ["row[16]", "UOM", "string", "Unit of measure", "Direct mapping (also used for InventoryUOM)"],
    ["row[19]", "OrderedLineQuantity", "number", "Ordered quantity", "Number() || 0"],
    ["row[23]", "Currency", "string", "Currency code", "Blank = skip row entirely"],
    ["row[25]", "OrderLineValue", "number", "Order line value", "Number() || 0"],
    ["row[43]", "InventoryQuantity", "number", "On-hand inventory qty", "Number() || 0"],
    ["row[45]", "ReferenceB", "string", "Reference B", "Raw kept; also regex /\\d+/g for splitting"],
    ["row[46]", "Type (part 1)", "string", "Type code", "Concatenated with row[47] into Type"],
    ["row[47]", "Type (part 2)", "string", "Material code", "Concatenated with row[46] into Type"],
    ["row[49]", "CustomerName", "string", "Customer name", "Direct mapping"],
    ["row[50]", "City", "string", "City", "Direct mapping"],
    ["row[51]", "Country", "string", "Country", "Direct mapping"],
    ["(computed)", "UniqueCode", "string", "Unique identifier", "refNum + ProjectCode + ItemCode"],
    ["(computed)", "Delivery", "string", "Delivery date", "PlannedReceiptDate + 31 days"],
    ["(computed)", "InventoryValue", "number", "Inventory value", "(OrderLineValue / OrderedQty) × InventoryQty"],
];

// ============================================================
// SHEET 11: Data Flow & Joins
// ============================================================
const dataFlowData = [
    ["FLOW NAME", "DESCRIPTION", "SOURCE COLLECTION(S)", "JOIN TYPE", "JOIN KEY(S)", "OUTPUT FIELDS", "USED BY ENDPOINT"],
    ["Excel Upload", "Parse Excel → batch write to Firestore", "excelData (write)", "N/A", "N/A", "All excelData fields", "POST /upload-excel"],
    ["Merged Data", "excelData + IndentQuantity merged by ItemCode", "excelData, Indent_Quantity", "LEFT JOIN (excelData is primary)", "ItemCode ↔ ITEM_CODE", "All excelData fields + IndentQuantity, IndentUOM, IndentProject, IndentPlannedOrder", "GET /get-data"],
    ["Prism Join", "Group + join indent-to-excel by UniqueCode", "excelData, Indent_Quantity", "LEFT JOIN (Indent is primary)", "UniqueCode ↔ UNIQUE_CODE", "UNIQUE_CODE, ReferenceB, ProjectNo, ItemCode, Description, Category, Type, OrderedQty, RequiredQty, Difference, UOM, PlannedOrder", "GET /prism"],
    ["Orbit Flat", "Flat export with geographic fields", "excelData", "No join", "N/A", "17 fields including City, Country, CustomerName", "GET /orbit"],
    ["Analysis Rate", "Export with calculated unit rate", "excelData", "No join", "N/A", "All fields + Rate (value/qty)", "GET /analysis"],
    ["Raw Indent", "Direct Indent_Quantity dump", "Indent_Quantity", "No join", "N/A", "All Indent_Quantity fields", "GET /get-indent"],
];

// ============================================================
// SHEET 12: Navigation Structure
// ============================================================
const navData = [
    ["NAV ITEM", "TYPE", "PARENT", "ROUTE", "LABEL IN UI", "ICON", "ACTIVE CONDITION"],
    ["Home", "Link", "Top Level", "/", "Home", "—", "pathname === '/'"],
    ["Planer Checker", "Link", "Top Level", "/data2", "Planer Checker", "—", "pathname === '/data2'"],
    ["Prism", "Link", "Top Level", "/Module2Page1", "Prism", "—", "pathname === '/Module2Page1'"],
    ["Orbit", "Link", "Top Level", "/Module3Page1", "Orbit", "—", "pathname === '/Module3Page1'"],
    ["Analysis", "Dropdown", "Top Level", "—", "Analysis", "▼", "children routes match"],
    ["Analysis Page 1", "Link", "Analysis", "/Analysis1page", "Analysis Page 1", "—", "pathname === '/Analysis1page'"],
    ["Analysis Page 2", "Link", "Analysis", "/Analysis2page", "Analysis Page 2", "—", "pathname === '/Analysis2page'"],
    ["Menu", "Dropdown", "Top Level", "—", "Menu", "▼", "children routes match"],
    ["Main Chart", "Link", "Menu", "/data", "Main Chart", "📊", "pathname === '/data'"],
    ["PDF to JSON", "Link", "Menu", "/pdf-to-json", "PDF to JSON", "📄", "pathname === '/pdf-to-json'"],
];

// ============================================================
// SHEET 13: Security & Env Analysis
// ============================================================
const securityData = [
    ["CATEGORY", "ITEM", "STATUS", "RISK LEVEL", "DETAILS", "RECOMMENDATION"],
    ["Authentication", "API Authentication", "❌ Missing", "🔴 HIGH", "All API endpoints are publicly accessible with no auth", "Add JWT or API key authentication"],
    ["Authentication", "User Login", "❌ Missing", "🔴 HIGH", "No user management or login system", "Implement auth (Firebase Auth / NextAuth)"],
    ["Authorization", "Role-based access", "❌ Missing", "🟡 MEDIUM", "No role system — anyone with URL can access", "Add admin/viewer roles"],
    ["CORS", "Origin restriction", "❌ Missing", "🟡 MEDIUM", "app.use(cors()) allows ALL origins", "Restrict to known frontend origins"],
    ["Rate Limiting", "API throttling", "❌ Missing", "🟡 MEDIUM", "No rate limiting on any endpoint", "Add express-rate-limit"],
    ["Input Validation", "File type check", "⚠️ Partial", "🟡 MEDIUM", "Multer accepts any file, no MIME type validation", "Validate .xlsx/.xls MIME types"],
    ["Input Validation", "Data schema", "❌ Missing", "🟡 MEDIUM", "No validation of Excel column structure", "Add Joi/Zod schema validation"],
    ["Secrets", ".env file", "✅ Protected", "🟢 LOW", ".env is in .gitignore", "Keep as-is"],
    ["Secrets", "Firebase credentials", "✅ Env var", "🟢 LOW", "Service account JSON stored in env var", "Consider using Secret Manager in production"],
    ["Database", "Firestore rules", "⚠️ Unknown", "🟡 MEDIUM", "Using Admin SDK bypasses rules", "Review Firestore security rules for direct client access"],
    ["Dependencies", "Vulnerability scan", "⚠️ Unknown", "🟡 MEDIUM", "No evidence of npm audit runs", "Run npm audit regularly"],
    ["HTTPS", "Transport security", "⚠️ Dev only", "🟡 MEDIUM", "http://localhost in development", "Ensure HTTPS in production deployment"],
    ["Pagination", "DoS protection", "❌ Missing", "🟡 MEDIUM", "All endpoints fetch ALL Firestore documents", "Add limit/offset pagination"],
];

// ============================================================
// SHEET 14: Technical Debt & Issues
// ============================================================
const techDebtData = [
    ["#", "CATEGORY", "ISSUE", "SEVERITY", "FILE(S) AFFECTED", "DESCRIPTION", "SUGGESTED FIX"],
    [1, "Architecture", "Duplicate CSS theme files", "Low", "src/index.css, src/styles/globals.css", "Nearly identical theme variables defined in two separate files with slight differences (dark mode background)", "Consolidate into single index.css"],
    [2, "Naming", "Typos in filenames", "Low", "Uploadfrom2.jsx, SuppilerName.jsx", "'Uploadfrom' should be 'UploadForm', 'Suppiler' should be 'Supplier'", "Rename files (update all imports)"],
    [3, "Naming", "Module naming confusion", "Medium", "Module2Page1.jsx, Module3Page1.jsx", "Module2 = Prism, Module3 = Orbit — not intuitive from filenames", "Rename to PrismPage.jsx, OrbitPage.jsx"],
    [4, "Structure", "Components outside src/", "Low", "components/, pages/", "These directories are at frontend/ root, not inside src/", "Move into src/ for consistency"],
    [5, "Dead Code", "ThemeContext is locked", "Low", "ThemeContext.jsx, ThemeToggle.jsx", "Theme is hardcoded to dark; toggle does nothing", "Remove toggle UI or implement proper theme switching"],
    [6, "Dead Code", "Lenis scrolling commented out", "Low", "App.jsx", "Import and setup code for Lenis is fully commented out", "Remove or re-enable"],
    [7, "Unused Dep", "Firebase client SDK", "Low", "backend/package.json", "firebase ^12.2.1 installed but only firebase-admin is used", "Remove firebase package"],
    [8, "Performance", "4 charting libraries", "High", "package.json", "Chart.js + Highcharts + Recharts + Plotly.js all installed — massive bundle", "Standardize on 1-2 libraries"],
    [9, "Config", "Hardcoded API URL", "High", "All page files", "http://localhost:5000 hardcoded in fetch calls", "Use environment variable (VITE_API_URL)"],
    [10, "Robustness", "No error boundaries", "Medium", "App.jsx", "No React error boundaries implemented", "Add ErrorBoundary components"],
    [11, "Incomplete", "Analysis2page empty", "Low", "Analysis2page.jsx", "Just shows 'Work in progress' text", "Implement or remove from navigation"],
    [12, "TypeScript", "tsconfig but no TS", "Low", "tsconfig.json, all .jsx files", "TypeScript configured but not used — all files are .jsx", "Migrate to .tsx or remove tsconfig"],
    [13, "Data", "Fragile column mapping", "High", "routes/dataRoute.js", "Excel parsing uses hardcoded column indices (row[3], row[9], etc.)", "Use column headers for mapping"],
    [14, "Data", "ReferenceB splitting creates duplicates", "Medium", "routes/dataRoute.js", "All numbers extracted from ReferenceB, each creates a document", "Review if this is intentional"],
    [15, "Scalability", "No API pagination", "High", "routes/dataRoute.js", "All endpoints fetch entire collections at once", "Add limit/offset/cursor pagination"],
    [16, "Scalability", "No data caching", "Medium", "All page files", "Every route change re-fetches all data from backend", "Add React Query or SWR for caching"],
];

// ============================================================
// BUILD WORKBOOK
// ============================================================
const wb = XLSX.utils.book_new();

function addSheet(name, data, opts = {}) {
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Auto-width columns
    const colWidths = [];
    for (const row of data) {
        for (let i = 0; i < row.length; i++) {
            const cellLen = String(row[i] || "").length;
            colWidths[i] = Math.min(Math.max(colWidths[i] || 10, cellLen + 2), 60);
        }
    }
    ws["!cols"] = colWidths.map(w => ({ wch: w }));

    XLSX.utils.book_append_sheet(wb, ws, name);
}

addSheet("1. Overview", overviewData);
addSheet("2. Directory Structure", directoryData);
addSheet("3. API Endpoints", apiData);
addSheet("4. Schema - excelData", excelDataSchema);
addSheet("5. Schema - Indent", indentSchema);
addSheet("6. Routes & Pages", routesData);
addSheet("7. Components", componentsData);
addSheet("8. Deps - Backend", backendDepsData);
addSheet("9. Deps - Frontend", frontendDepsData);
addSheet("10. Excel Column Map", columnMappingData);
addSheet("11. Data Flows", dataFlowData);
addSheet("12. Navigation", navData);
addSheet("13. Security", securityData);
addSheet("14. Technical Debt", techDebtData);

// ============================================================
// WRITE FILE
// ============================================================
const outputPath = path.join(__dirname, "Aerozone_5O_ReverseEngineering.xlsx");
XLSX.writeFile(wb, outputPath);

console.log(`\n✅ Excel file generated successfully!`);
console.log(`📄 File: ${outputPath}`);
console.log(`📊 Sheets: ${wb.SheetNames.length}`);
wb.SheetNames.forEach((name, i) => console.log(`   ${i + 1}. ${name}`));
console.log(`\nDone!`);
