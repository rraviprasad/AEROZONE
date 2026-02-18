# 🛩️ AEROZONE 5.O — Complete Reverse Engineering Document

> **Generated:** 2026-02-11  
> **Project:** Aerozone 5.O — Aviation Materials Management & Analytics Platform  
> **Stack:** React 19 + Vite 7 + TailwindCSS 4 + Node.js/Express 5 + Firebase Firestore

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#1-executive-summary)
2. [High-Level Architecture](#2-high-level-architecture)
3. [Project Directory Structure](#3-project-directory-structure)
4. [Backend Deep Dive](#4-backend-deep-dive)
5. [Frontend Deep Dive](#5-frontend-deep-dive)
6. [Data Model & Database Schema](#6-data-model--database-schema)
7. [API Contracts](#7-api-contracts)
8. [Routing & Navigation Map](#8-routing--navigation-map)
9. [Module Breakdown](#9-module-breakdown)
10. [Component Inventory](#10-component-inventory)
11. [Data Flow Diagrams](#11-data-flow-diagrams)
12. [Design System & Theming](#12-design-system--theming)
13. [Third-Party Dependencies](#13-third-party-dependencies)
14. [Security & Environment Variables](#14-security--environment-variables)
15. [Known Issues & Technical Debt](#15-known-issues--technical-debt)

---

## 1. EXECUTIVE SUMMARY

**Aerozone 5.O** is a **full-stack aerospace materials management and analytics platform** built for aviation companies. It enables:

- 📊 **Uploading Excel spreadsheets** of procurement/inventory data into Firebase Firestore
- 📈 **Visualizing data** through interactive charts (bar, pie, donut, line, combo, world map, 3D cylinders)
- 🔍 **Filtering & searching** across multiple dimensions (project code, item code, supplier, category, reference numbers)
- 📄 **PDF-to-JSON conversion** for technical documents
- 🌐 **Multi-module dashboards** each providing a different analytical perspective on the same underlying data

### The 6 Modules:

| # | Module Name | Route | Purpose |
|---|-------------|-------|---------|
| 1 | **Main Chart** | `/data` | Primary data table + charts (Pie, Line, Bar) with Excel upload |
| 2 | **Planer Checker** | `/data2` | Enhanced dashboard with donut charts, bar charts, receipt analysis |
| 3 | **Prism** | `/Module2Page1` | Indent vs. ordered comparison, material matrix, order status |
| 4 | **Orbit** | `/Module3Page1` | Geographic distribution, world map, type analysis, project cylinders |
| 5 | **Analysis** | `/Analysis1page` | Rate analysis, combo charts, trading-view style charts |
| 6 | **PDF to JSON** | `/pdf-to-json` | Document conversion tool |

---

## 2. HIGH-LEVEL ARCHITECTURE

```
┌──────────────────────────────────────────────────────────┐
│                      BROWSER (Client)                     │
│                                                           │
│  React 19 + Vite 7 + TailwindCSS 4 + GSAP + Chart.js    │
│  + Highcharts + Recharts + Plotly.js + Three.js          │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  Home Page   │  │  Module 1-5 │  │  PDF→JSON   │      │
│  │  (Landing)   │  │ (Dashboards)│  │  (Converter)│      │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘      │
│         │                │                                │
│         └────────┬───────┘                                │
│                  │                                        │
│          fetch() to Backend API                           │
└──────────────────┬───────────────────────────────────────┘
                   │ HTTP (REST)
                   ▼
┌──────────────────────────────────────────────────────────┐
│                   BACKEND (Node.js)                       │
│                                                           │
│  Express 5 + CORS + Multer (file upload) + XLSX parser   │
│                                                           │
│  Endpoints:                                               │
│  POST /api/data/upload-excel   ← Upload + parse Excel    │
│  GET  /api/data/get-data       ← Merged excel+indent     │
│  GET  /api/data/get-indent     ← Raw indent data         │
│  GET  /api/data/prism          ← Grouped + joined data   │
│  GET  /api/data/orbit          ← Flat excel w/ location  │
│  GET  /api/data/analysis       ← Rate-calculated data    │
│                                                           │
└──────────────────┬───────────────────────────────────────┘
                   │ Firebase Admin SDK
                   ▼
┌──────────────────────────────────────────────────────────┐
│              FIREBASE FIRESTORE (Database)                │
│                                                           │
│  Collections:                                             │
│  ├── excelData     (uploaded procurement/inventory rows)  │
│  └── Indent_Quantity (required quantities/planned orders) │
└──────────────────────────────────────────────────────────┘
```

---

## 3. PROJECT DIRECTORY STRUCTURE

```
Aerozone_5.O/
├── README.md
├── backend/
│   ├── .gitignore
│   ├── package.json              # Express 5, Firebase Admin, Multer, XLSX
│   ├── package-lock.json
│   ├── server.js                 # Entry point — starts Express on PORT 5000
│   ├── src/
│   │   └── app.js                # Express app setup (CORS, JSON, routes)
│   ├── config/
│   │   └── firebase.js           # Firebase Admin SDK init via env var
│   └── routes/
│       ├── dataRoute.js          # ALL API endpoints (350 lines)
│       ├── old_route.txt         # Archive of previous route version
│       ├── pdf-excel.txt         # Archive/reference for PDF→Excel logic
│       └── pdf-json.txt          # Archive/reference for PDF→JSON logic
│
└── frontend/
    ├── .gitignore
    ├── README.md
    ├── package.json              # React 19, Vite 7, TailwindCSS 4, Chart libs
    ├── package-lock.json
    ├── index.html                # SPA entry — dark mode by default
    ├── vite.config.js            # Vite + React + TailwindCSS plugins
    ├── components.json           # shadcn/ui configuration
    ├── eslint.config.js
    ├── jsconfig.json
    ├── tsconfig.json
    │
    ├── public/                   # Static assets
    │   ├── logo-new.png          # Brand logo (favicon + navbar)
    │   ├── logo.jpg
    │   ├── logo.png
    │   └── vite.svg
    │
    ├── src/                      # Core source files
    │   ├── main.jsx              # React root + BrowserRouter
    │   ├── App.jsx               # App shell: routes, loader, navbar
    │   ├── App.css               # Text outline + scrollbar hide utilities
    │   ├── index.css             # MASTER theme (light/dark CSS vars, animations)
    │   │
    │   ├── context/
    │   │   └── ThemeContext.jsx   # Theme provider (LOCKED to dark mode)
    │   │
    │   ├── components/
    │   │   ├── GlobalLoader.jsx      # Full-screen Lottie airplane loader
    │   │   ├── PlaneLoader.jsx       # SVG spinning planes loader
    │   │   ├── PageTransitionLoader.jsx  # Backdrop + PlaneLoader
    │   │   └── ThemeToggle.jsx       # Sun/Moon toggle (non-functional, dark-locked)
    │   │
    │   ├── lib/
    │   │   └── utils.js          # cn() helper (clsx + tailwind-merge)
    │   │
    │   ├── styles/
    │   │   └── globals.css       # Duplicate theme vars (shadcn/ui generated)
    │   │
    │   └── assets/               # Images used in Home page
    │       ├── airplane_hero.png
    │       ├── astronaut.png
    │       ├── earth.png
    │       ├── engine_detail.png
    │       ├── materials_bg.png
    │       ├── planer_checker.png
    │       ├── prism.png
    │       ├── Orbit.png
    │       ├── Analysis.png
    │       ├── Main Chart.png
    │       ├── PDF to JSON.png
    │       ├── loading-plane.json    # Lottie animation data
    │       └── react.svg
    │
    ├── pages/                    # Page-level components
    │   ├── Home.jsx              # Landing page with GSAP animations
    │   ├── DataPage.jsx          # Module 1: Main Chart dashboard
    │   ├── DataPage2.jsx         # Module 2: Planer Checker dashboard
    │   ├── PdfJson.jsx           # Module 6: PDF to JSON converter
    │   ├── Module2Page1.jsx      # Module 3: Prism dashboard
    │   ├── Module3Page1.jsx      # Module 4: Orbit dashboard
    │   ├── Analysis1page.jsx     # Module 5: Analysis dashboard
    │   └── Analysis2page.jsx     # Placeholder — "Work in progress"
    │
    └── components/               # Module-specific components
        ├── module1/              # Used by DataPage.jsx & DataPage2.jsx
        │   ├── Navbar.jsx            # Global navigation bar
        │   ├── Navbar2.jsx           # Alternative navbar (unused in routing)
        │   ├── DataTable.jsx         # Sortable data table (Module 1)
        │   ├── DataTable2.jsx        # Extended data table
        │   ├── Filter.jsx            # Filter panel (Module 1)
        │   ├── Filter2.jsx           # Enhanced filter panel (Module 2)
        │   ├── UploadForm.jsx        # Excel upload form
        │   ├── Uploadfrom2.jsx       # Alternative upload form
        │   ├── PieChart.jsx          # Pie chart (by project/category)
        │   ├── DonutChart.jsx        # Donut chart variant 1
        │   ├── DonutChart2.jsx       # Donut chart variant 2
        │   ├── BarChart.jsx          # Bar chart component
        │   ├── LineChart.jsx         # Line chart component
        │   ├── ReciptBarchart.jsx    # Receipt analysis bar chart
        │   ├── ItemInsightsPopup.jsx # Detailed item popup modal
        │   ├── ProjectNumber.jsx     # Project number selector/display
        │   ├── ReferenceBList.jsx    # Reference B list display
        │   ├── SuppilerName.jsx      # Supplier name display
        │   ├── Rawmaterial.jsx       # Raw material category widget
        │   ├── Baught.jsx            # Bought-out material widget
        │   ├── RMSupplier.jsx        # RM supplier widget
        │   ├── BOISupplier.jsx       # BOI supplier widget
        │   ├── Pinicon.jsx           # Pin/map icon component
        │   ├── Preloader.jsx         # Section preloader
        │   └── Yashgraph.jsx         # Custom graph component
        │
        ├── module2/              # Used by Module2Page1.jsx (Prism)
        │   ├── Datatable.jsx         # Prism-specific data table
        │   ├── Filter22.jsx          # Prism filter panel
        │   ├── ItemInsightsPopup.jsx # Prism item insights
        │   ├── Navbar22.jsx          # Module-specific navbar
        │   ├── ProjectNumber1.jsx    # Project number widget
        │   ├── ReferenceBList1.jsx   # Reference list widget
        │   ├── Rawmaterial1.jsx      # Raw material widget
        │   ├── Baught1.jsx           # Bought-out widget
        │   ├── RMSupplier1.jsx       # RM supplier widget
        │   ├── BOISupplier1.jsx      # BOI supplier widget
        │   ├── MaterialMatrix.jsx    # Material type matrix visualization
        │   ├── OrderStatusDonut.jsx  # Order status donut chart
        │   ├── PlannedOrderDonut.jsx # Planned order donut chart
        │   └── UnifiedStatsBoard.jsx # Stats summary board
        │
        ├── module3/              # Used by Module3Page1.jsx (Orbit)
        │   ├── Datatable.jsx         # Orbit data table
        │   ├── Filter22.jsx          # Orbit filter panel
        │   ├── ReciptBarchart.jsx    # Receipt bar chart
        │   ├── ReferenceBList1.jsx   # Reference list
        │   ├── Rawmaterial1.jsx      # Raw material widget
        │   ├── Baught1.jsx           # Bought-out widget
        │   ├── AmountTable.jsx       # Amount summary table
        │   ├── CustomerName.jsx      # Customer name widget
        │   ├── ProjectCylinder.jsx   # 3D cylinder chart (project distribution)
        │   ├── WorldMap.jsx          # Highcharts world map
        │   ├── Typecubescence.jsx    # Type category cube visualization
        │   └── materialCube2.jsx     # Material cube helper
        │
        ├── module4/              # Used by Analysis1page.jsx
        │   ├── DataTable.jsx          # Analysis data table
        │   ├── Filter22.jsx           # Analysis filter panel
        │   ├── AnalysisComboChart.jsx # Combo chart (bar + line)
        │   └── TradingViewChart.jsx   # Trading-view style chart
        │
        └── module5/              # Reserved for Analysis2page
            ├── DataTable.jsx          # (prepared but page is WIP)
            ├── Filter22.jsx
            ├── Typecubescence.jsx
            └── materialCube2.jsx
```

---

## 4. BACKEND DEEP DIVE

### 4.1 Entry Point: `server.js`

```javascript
const app = require("./src/app");
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
```

- Listens on **port 5000** locally, or `process.env.PORT` for cloud deployment (Render)

### 4.2 App Setup: `src/app.js`

```javascript
const express = require("express");
const cors = require("cors");
const dataRoute = require("../routes/dataRoute");

const app = express();
app.use(cors());           // Allow all origins
app.use(express.json());   // Parse JSON bodies
app.use("/api/data", dataRoute);  // Mount all routes under /api/data

module.exports = app;
```

- **CORS:** Wide open (all origins)
- **Module system:** CommonJS (`require`)
- **Single route file:** All endpoints in `dataRoute.js`

### 4.3 Firebase Config: `config/firebase.js`

```javascript
require("dotenv").config();
const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
// Fix escaped newlines in private_key
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
module.exports = { db };
```

- Uses **Firebase Admin SDK** (server-side, full privileges)
- Service account credentials stored as **JSON string in `.env`**
- Private key newline fix for env var serialization
- Exports the Firestore `db` instance

### 4.4 Routes: `routes/dataRoute.js` (350 lines)

This is the **brain of the backend**. It has 6 endpoints:

#### 4.4.1 `POST /api/data/upload-excel`
**Purpose:** Upload an Excel file, parse it, and batch-write rows to Firestore.

**Flow:**
1. Receives file via Multer (memory storage)
2. Parses with `xlsx` library (raw array mode)
3. Skips header row
4. For each data row:
   - Pads row to 50+ columns
   - Parses dates (Excel serial → JS Date → "DD-MMM-YYYY")
   - Calculates `deliveryDate` = PlannedReceiptDate + 31 days
   - Extracts `ReferenceB` numbers using regex (`/\d+/g`)
   - Creates a document per reference number with a **UniqueCode** = `refNum + projectCode + itemCode`
   - Skips rows with blank Currency
   - Calculates `InventoryValue` = (OrderLineValue / OrderedQty) × OnHand
5. Batch commits to Firestore `excelData` collection

**Column Mapping (Excel → Firestore field):**

| Excel Index | Firestore Field | Description |
|-------------|----------------|-------------|
| row[3] | SupplierName | Supplier |
| row[4] | Category | Material category |
| row[5] | PONo | Purchase order number |
| row[8] | ProjectCode | Project code |
| row[9] | ItemCode | Item code |
| row[10] | ItemShortDescription | Description |
| row[14] | Date | Formatted date (DD-MMM-YYYY) |
| row[15] | PlannedReceiptDate | Raw planned receipt date |
| row[16] | UOM / InventoryUOM | Unit of measure |
| row[19] | OrderedLineQuantity | Ordered quantity |
| row[23] | Currency | Currency code |
| row[25] | OrderLineValue | Order line value |
| row[43] | InventoryQuantity | On-hand inventory |
| row[45] | ReferenceB | Reference B (raw) |
| row[46] | Type | Material type code |
| row[47] | Material | Material code |
| row[49] | CustomerName | Customer |
| row[50] | City | City |
| row[51] | Country | Country |

#### 4.4.2 `GET /api/data/get-data`
**Purpose:** Fetch all `excelData` merged with `Indent_Quantity` by `ItemCode`.

**Join Logic:**
- LEFT JOIN `excelData` → `Indent_Quantity` on `ItemCode === ITEM_CODE`
- Adds: IndentQuantity, IndentUOM, IndentProject, IndentPlannedOrder (or "NA")

**Used by:** DataPage.jsx (Main Chart), DataPage2.jsx (Planer Checker)

#### 4.4.3 `GET /api/data/get-indent`
**Purpose:** Fetch raw `Indent_Quantity` collection.

**Used by:** Direct indent data access

#### 4.4.4 `GET /api/data/prism`
**Purpose:** Group + LEFT JOIN indent-to-excel for Prism module.

**Join Logic:**
1. Group `excelData` by `UniqueCode` → sum `OrderedQty`
2. Group `Indent_Quantity` by `UNIQUE_CODE` → sum `RequiredQty`
3. LEFT JOIN (indent is primary) → Calculate `Difference = RequiredQty - OrderedQty`

**Result fields:** UNIQUE_CODE, ReferenceB, ProjectNo, ItemCode, Description, Category, Type, OrderedQty, RequiredQty, Difference, UOM, PlannedOrder

**Used by:** Module2Page1.jsx (Prism)

#### 4.4.5 `GET /api/data/orbit`
**Purpose:** Flat export of `excelData` with geographic fields.

**Fields:** Currency, Date, ItemCode, ItemShortDescription, OrderLineValue, OrderedLineQuantity, PONo, PlannedReceiptDate, ProjectCode, SupplierName, UOM, Category, CustomerName, Type, City, Country, ReferenceB

**Used by:** Module3Page1.jsx (Orbit)

#### 4.4.6 `GET /api/data/analysis`
**Purpose:** Export `excelData` with calculated **Rate per unit**.

**Calculation:** `Rate = OrderLineValue / OrderedLineQuantity` (3 decimal places)

**Fields:** Currency, ReferenceB, ItemCode, ItemShortDescription, ProjectCode, SupplierName, PONo, OrderLineValue, OrderedLineQuantity, UOM, PlannedReceiptDate, Rate

**Used by:** Analysis1page.jsx

---

## 5. FRONTEND DEEP DIVE

### 5.1 Build System

| Tool | Version | Purpose |
|------|---------|---------|
| **Vite** | 7.0.4 | Build tool & dev server |
| **React** | 19.1.0 | UI framework |
| **TailwindCSS** | 4.1.13 | Utility-first CSS (via `@tailwindcss/vite` plugin) |
| **tw-animate-css** | 1.3.8 | Tailwind animation utilities |
| **shadcn/ui** | (configured) | Component library pattern (components.json) |

### 5.2 Entry Flow

```
index.html
  └── src/main.jsx
       └── <BrowserRouter>
            └── <App />
                 ├── <GlobalLoader />      (shows on every route change, 3s)
                 ├── <Navbar />            (global, fixed top)
                 └── <Routes>
                      ├── / → <Home />
                      ├── /data → <DataPage />
                      ├── /pdf-to-json → <PdfJson />
                      ├── /data2 → <DataPage2 />
                      ├── /Module2Page1 → <Module2Page1 />
                      ├── /Module3Page1 → <Module3Page1 />
                      ├── /Analysis1page → <Analysis1page />
                      └── /Analysis2page → <Analysis2page />
```

### 5.3 Theme System

The app is **locked to dark mode**:
- `index.html` has `class="dark"` on `<html>`
- `ThemeContext.jsx` always sets `dark` class, `toggleTheme()` is a no-op
- Two CSS variable sets defined in `index.css` (`:root` for light, `.dark` for dark)
- Uses **oklch color space** for precise color control
- Design tokens follow shadcn/ui patterns: `--background`, `--foreground`, `--primary`, `--card`, `--muted`, `--accent`, `--border`, etc.

### 5.4 Loading System

Three-layer loading architecture:

1. **GlobalLoader** — Full-screen Lottie airplane animation, triggers on every route change (3 second duration)
2. **PlaneLoader** — Two SVG planes orbiting, used as a fallback/component loader
3. **PageTransitionLoader** — Backdrop blur + PlaneLoader overlay

### 5.5 Global Navbar (`components/module1/Navbar.jsx`)

**Navigation Structure:**
```
AEROZONE [logo]
├── Home           → /
├── Planer Checker → /data2
├── Prism          → /Module2Page1
├── Orbit          → /Module3Page1
├── Analysis ▼
│   ├── Analysis Page 1 → /Analysis1page
│   └── Analysis Page 2 → /Analysis2page
└── Menu ▼
    ├── 📊 Main Chart  → /data
    └── 📄 PDF to JSON → /pdf-to-json
```

- Fixed `top-0`, `z-50`, blur background on non-home pages
- Desktop: horizontal nav with dropdown menus
- Mobile: slide-in drawer from right with hamburger toggle
- Active state: cyan highlight on current route

---

## 6. DATA MODEL & DATABASE SCHEMA

### 6.1 Collection: `excelData`

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| UniqueCode | string | `refNum + projectCode + itemCode` | Computed |
| ReferenceB | string | Reference B (raw string with numbers) | Excel row[45] |
| ProjectCode | string | Project identifier | Excel row[8] |
| ItemCode | string | Material item code | Excel row[9] |
| ItemShortDescription | string | Item description | Excel row[10] |
| Category | string | Material category | Excel row[4] |
| SupplierName | string | Supplier name | Excel row[3] |
| PONo | string/number | Purchase order number | Excel row[5] |
| Date | string | "DD-MMM-YYYY" formatted | Excel row[14] |
| OrderedLineQuantity | number | Quantity ordered | Excel row[19] |
| UOM | string | Unit of measure | Excel row[16] |
| OrderLineValue | number | Monetary value | Excel row[25] |
| Currency | string | Currency code (e.g., "INR", "USD") | Excel row[23] |
| PlannedReceiptDate | string | "DD-MMM-YYYY" formatted | Excel row[15] |
| Delivery | string | Date + 31 days | Computed |
| InventoryQuantity | number | On-hand stock | Excel row[43] |
| InventoryUOM | string | Same as UOM | Excel row[16] |
| InventoryValue | number | (value/qty) × onHand | Computed |
| Type | string | Concatenation of Type + Material codes | Excel rows[46]+[47] |
| CustomerName | string | Customer | Excel row[49] |
| City | string | City | Excel row[50] |
| Country | string | Country | Excel row[51] |

### 6.2 Collection: `Indent_Quantity`

| Field | Type | Description |
|-------|------|-------------|
| UNIQUE_CODE | string | Same format as UniqueCode above |
| ITEM_CODE | string | Item code (joins to excelData.ItemCode) |
| ITEM_DESCRIPTION | string | Item description |
| CATEGORY | string | Material category |
| PROJECT_NO | string | Project number |
| REQUIRED_QTY | number | Required quantity |
| UOM | string | Unit of measure |
| PLANNED_ORDER | string | Planned order reference |
| TYPE | string | Material type (e.g., "SHEETS", "BarIN") |
| ReferenceB | string | Reference B value |

---

## 7. API CONTRACTS

### Base URL: `http://localhost:5000/api/data`

| Method | Endpoint | Request | Response | Module(s) |
|--------|----------|---------|----------|-----------|
| POST | `/upload-excel` | `multipart/form-data` (field: `file`) | `{ message, saved, deleted, rowsProcessed }` | DataPage, DataPage2 |
| GET | `/get-data` | — | `Array<ExcelRow & IndentFields>` | DataPage (Main Chart), DataPage2 (Planer Checker) |
| GET | `/get-indent` | — | `Array<IndentRow>` | Direct access |
| GET | `/prism` | — | `Array<PrismRow>` | Module2Page1 (Prism) |
| GET | `/orbit` | — | `Array<OrbitRow>` | Module3Page1 (Orbit) |
| GET | `/analysis` | — | `Array<AnalysisRow>` | Analysis1page |

---

## 8. ROUTING & NAVIGATION MAP

```
/                    → Home.jsx           (Landing page)
/data                → DataPage.jsx       (Main Chart — Module 1)
/data2               → DataPage2.jsx      (Planer Checker — Module 1b)
/Module2Page1        → Module2Page1.jsx   (Prism — Module 2)
/Module3Page1        → Module3Page1.jsx   (Orbit — Module 3)
/Analysis1page       → Analysis1page.jsx  (Analysis — Module 4)
/Analysis2page       → Analysis2page.jsx  (WIP placeholder)
/pdf-to-json         → PdfJson.jsx        (PDF to JSON converter)
```

---

## 9. MODULE BREAKDOWN

### 9.1 Module 1: Main Chart (`/data` — DataPage.jsx)

**API:** `GET /api/data/get-data`

**Components used:**
- `UploadForm` — Excel file upload modal
- `DataTable` — Sortable/scrollable data table
- `PieChart` — Category/project distribution
- `LineChart` — Trend over time
- `BarChart` — Bar chart comparisons
- `Filter` — Multi-field filter panel

**Features:**
- Excel upload → Firestore
- Search, filter by Project Code, Item Code, Description
- Exact-match filtering with normalization (trim + lowercase + remove spaces)
- Data displayed in interactive table with charts

### 9.2 Module 1b: Planer Checker (`/data2` — DataPage2.jsx)

**API:** `GET /api/data/get-data` + `GET /api/data/prism`

**Components used:**
- `Filter2` — Enhanced multi-field filters
- `DonutChart`, `DonutChart2` — Donut charts for category breakdown
- `BarChart` — Bar chart
- `ReciptBarchart` — Receipt analysis timeline
- `DataTable2` — Extended data table
- `ItemInsightsPopup` — Modal popup for item details
- `ProjectNumber` — Project selector
- `ReferenceBList` — Reference number list
- `SuppilerName` — Supplier name display
- `Rawmaterial`, `Baught` — Category indicator widgets
- `RMSupplier`, `BOISupplier` — Supplier category widgets
- `Uploadfrom2` — Upload form variant

**Features:**
- Dual data source (excelData + prism endpoint)
- Zoomable chart components (click to fullscreen)
- Reference number extraction and display
- Client-side Excel processing with SheetJS
- Complex filtering with regex support

### 9.3 Module 2: Prism (`/Module2Page1` — Module2Page1.jsx)

**API:** `GET /api/data/prism`

**Components used:**
- `module2/Filter22` — Prism-specific filters
- `module2/Datatable` — Prism data table
- `module2/ItemInsightsPopup` — Item insights
- `module2/MaterialMatrix` — Material type matrix visualization
- `module2/OrderStatusDonut` — Order status distribution
- `module2/PlannedOrderDonut` — Planned order distribution
- `module2/UnifiedStatsBoard` — Stats summary board
- `module2/ProjectNumber1`, `ReferenceBList1` — Selector widgets
- `module2/Rawmaterial1`, `Baught1`, `RMSupplier1`, `BOISupplier1` — Category widgets

**Features:**
- **Indent vs. Ordered comparison** — Shows Required Qty, Ordered Qty, and Difference
- Order status calculation (Fully Ordered / Partially Ordered / Not Ordered)
- Material type normalization and filtering
- Zoomable component panels

### 9.4 Module 3: Orbit (`/Module3Page1` — Module3Page1.jsx)

**API:** `GET /api/data/orbit`

**Components used:**
- `module3/Filter22` — Orbit filters
- `module3/Datatable` — Orbit data table
- `module3/ReciptBarchart` — Receipt bar chart
- `module3/ReferenceBList1` — Reference list
- `module3/Rawmaterial1`, `Baught1` — Category widgets
- `module3/AmountTable` — Amount summary table
- `module3/CustomerName` — Customer name display
- `module3/ProjectCylinder` — **3D cylinder chart** for project distribution
- `module3/WorldMap` — **Highcharts world map** visualization
- `module3/Typecubescence` — Type category cube visualization
- `module3/materialCube2` — Material cube helper

**Features:**
- **Geographic analysis** — World map showing supplier/customer distribution by country
- 3D project distribution cylinders
- Type-based material analysis
- Amount/value summary tables

### 9.5 Module 4: Analysis (`/Analysis1page` — Analysis1page.jsx)

**API:** `GET /api/data/analysis`

**Components used:**
- `module4/Filter22` — Analysis filters
- `module4/DataTable` — Analysis data table
- `module4/AnalysisComboChart` — Combo chart (bar + line overlay)
- `module4/TradingViewChart` — Trading-view style chart

**Features:**
- **Rate analysis** — Unit rate = OrderLineValue / OrderedLineQuantity
- Combo charts showing value and quantity together
- Trading-view inspired chart interface
- Zoomable components

### 9.6 Module 5: Analysis Page 2 (`/Analysis2page`)

**Status:** 🚧 Work in Progress — placeholder page only

### 9.7 PDF to JSON (`/pdf-to-json` — PdfJson.jsx)

**No backend API used** — Client-side only

**Features:**
- Upload PDF files
- Parse PDF content into structured JSON
- Download result as JSON file
- Download result as Excel file
- Uses dynamically loaded `xlsx` script for Excel generation

---

## 10. COMPONENT INVENTORY

### Shared/Global Components (in `src/components/`)

| Component | File | Purpose |
|-----------|------|---------|
| GlobalLoader | `GlobalLoader.jsx` | Full-screen Lottie airplane animation |
| PlaneLoader | `PlaneLoader.jsx` | Dual SVG planes orbiting |
| PageTransitionLoader | `PageTransitionLoader.jsx` | Backdrop + PlaneLoader overlay |
| ThemeToggle | `ThemeToggle.jsx` | Theme switch button (non-functional) |

### Module 1 Components (25 files)

| Component | Purpose |
|-----------|---------|
| Navbar | Global navigation bar (used across all pages) |
| DataTable / DataTable2 | Sortable data tables |
| Filter / Filter2 | Multi-field filter panels |
| UploadForm / Uploadfrom2 | Excel upload modals |
| PieChart | Pie chart (project/category distribution) |
| DonutChart / DonutChart2 | Donut chart variants |
| BarChart | Bar chart (comparisons) |
| LineChart | Line chart (trends) |
| ReciptBarchart | Receipt analysis timeline |
| ItemInsightsPopup | Item detail modal (17,991 bytes — complex!) |
| ProjectNumber | Project number selector |
| ReferenceBList | Reference number list |
| SuppilerName | Supplier display |
| Rawmaterial / Baught | Category indicator widgets |
| RMSupplier / BOISupplier | Supplier category widgets |
| Pinicon | Pin/map icon |
| Preloader | Section-level preloader |
| Yashgraph | Custom graph component |

### Module 2 Components (14 files)

| Component | Purpose |
|-----------|---------|
| MaterialMatrix | Material type matrix |
| OrderStatusDonut | Order fulfillment status pie |
| PlannedOrderDonut | Planned vs. actual orders |
| UnifiedStatsBoard | KPI summary board |
| Navbar22 | Module-specific nav (18KB — feature-rich) |

### Module 3 Components (12 files)

| Component | Purpose |
|-----------|---------|
| WorldMap | Highcharts geographic visualization |
| ProjectCylinder | 3D cylinder chart (project distribution) |
| Typecubescence | Type category cube visual |
| AmountTable | Value summary table |
| CustomerName | Customer display + filter |

### Module 4 Components (4 files)

| Component | Purpose |
|-----------|---------|
| AnalysisComboChart | Dual-axis combo chart |
| TradingViewChart | Financial-style chart |

---

## 11. DATA FLOW DIAGRAMS

### 11.1 Excel Upload Flow

```
User → [Select Excel File]
  → Browser FormData with file
    → POST /api/data/upload-excel
      → Multer (memory buffer)
        → XLSX.read(buffer)
          → Extract rows (skip header)
            → For each row:
              │ Parse dates → DD-MMM-YYYY
              │ Calculate delivery date (+31 days)
              │ Calculate inventory value
              │ Extract reference numbers from ReferenceB
              │ Generate UniqueCode
              │ Skip if Currency blank
              └─→ Firestore batch.set(excelData/auto-id, docData)
          → batch.commit()
    ← { saved: N, deleted: M, rowsProcessed: R }
  ← Success toast / error message
```

### 11.2 Dashboard Data Flow (e.g., Planer Checker)

```
DataPage2 component mounts
  → useEffect calls fetchData()
    → fetch("http://localhost:5000/api/data/get-data")
    → fetch("http://localhost:5000/api/data/prism")
      ← JSON arrays received
    → setData(mergedData)
    → setPrismData(prismData)
  
User types in filter / selects dropdown
  → useEffect calls applyFilters()
    → Normalize search terms
    → For each row: apply AND logic across all filters
    → setFilteredData(matching rows)
    
filteredData flows to:
  → DataTable2 (table view)
  → DonutChart (category breakdown)
  → BarChart (comparisons)
  → ReciptBarchart (timeline)
  → ProjectNumber (project counts)
  → etc.
```

### 11.3 Filter Logic Pattern

All modules follow the same filtering pattern:
```
1. Normalize input: trim + lowercase + remove spaces
2. For each filter dimension (search, project, supplier, etc.):
   a. If filter is empty → skip (match all)
   b. If filter has value → exact substring match on normalized row value
3. AND logic: row must pass ALL active filters
4. Return filtered dataset
```

---

## 12. DESIGN SYSTEM & THEMING

### 12.1 Color Palette (Dark Mode — Active)

| Token | oklch Value | Approximate Color |
|-------|-------------|-------------------|
| `--background` | `oklch(0.20 0.02 260)` | Dark slate blue |
| `--foreground` | `oklch(0.93 0.00 228)` | Near white |
| `--primary` | `oklch(0.67 0.16 245)` | Bright blue |
| `--card` | `oklch(0.21 0.01 274)` | Dark purple-blue |
| `--muted` | `oklch(0.21 0 0)` | Dark gray |
| `--accent` | `oklch(0.19 0.03 242)` | Deep blue |
| `--border` | `oklch(0.27 0.00 248)` | Dark gray-blue |
| `--destructive` | `oklch(0.62 0.24 25)` | Red |

### 12.2 Typography

- **Font family:** Open Sans (sans-serif)
- **Mono font:** Menlo
- **Serif font:** Georgia

### 12.3 Component Design Patterns

- **Cards:** `bg-card/50 backdrop-blur-sm border border-border rounded-2xl`
- **Buttons:** `bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl`
- **Glassmorphism:** Used throughout with `backdrop-blur` + transparent backgrounds
- **Animations:** GSAP for scroll-triggered and entry animations
- **Hover effects:** `scale-105` + `shadow-2xl` + opacity transitions
- **Border radius:** Base `1.3rem` with sm/md/lg/xl variants

### 12.4 Animation Library

| Library | Usage |
|---------|-------|
| **GSAP** + ScrollTrigger | Home page hero fly-in, card reveal |
| **Lottie** (`@lottiefiles/dotlottie-react`) | Airplane loading animation |
| **CSS animations** | Pulse, fade, slide, bounce |
| **TailwindCSS animate** | Utility-based animations |

---

## 13. THIRD-PARTY DEPENDENCIES

### Backend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | 5.1.0 | Web framework |
| cors | 2.8.5 | Cross-origin resource sharing |
| dotenv | 17.2.3 | Environment variable loading |
| firebase-admin | 13.5.0 | Server-side Firebase SDK |
| firebase | 12.2.1 | Firebase client SDK (unused?) |
| multer | 2.0.2 | Multipart file upload handling |
| xlsx | 0.18.5 | Excel file parsing |

### Frontend Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 19.1.0 | UI framework |
| react-dom | 19.1.0 | React DOM rendering |
| react-router-dom | 7.8.2 | Client-side routing |
| tailwindcss | 4.1.13 | CSS utility framework |
| @tailwindcss/vite | 4.1.13 | Vite integration for Tailwind |
| chart.js | 4.5.0 | Chart rendering engine |
| react-chartjs-2 | 5.3.0 | React wrapper for Chart.js |
| chartjs-adapter-date-fns | 3.0.0 | Date adapter for Chart.js |
| chartjs-plugin-zoom | 2.2.0 | Zoom/pan plugin for Chart.js |
| highcharts | 12.4.0 | Advanced charting (maps) |
| highcharts-react-official | 3.2.3 | React wrapper for Highcharts |
| @highcharts/map-collection | 2.3.2 | World map data for Highcharts |
| recharts | 3.3.0 | Declarative React charts |
| plotly.js | 3.1.0 | Scientific charting |
| react-plotly.js | 2.6.0 | React wrapper for Plotly |
| gsap | 3.13.0 | Animation library |
| @gsap/react | 2.1.2 | React integration for GSAP |
| three | 0.182.0 | 3D rendering engine |
| @react-three/fiber | 9.5.0 | React wrapper for Three.js |
| @react-three/drei | 10.7.7 | Helpers for React Three Fiber |
| lucide-react | 0.543.0 | Icon library |
| @lottiefiles/dotlottie-react | 0.17.8 | Lottie animation player |
| lottie-react | 2.4.1 | Alternative Lottie player |
| motion | 12.23.24 | Motion animation (Framer Motion) |
| xlsx | 0.18.5 | Client-side Excel processing |
| i18n-iso-countries | 7.14.0 | Country code/name mapping |
| ogl | 1.0.11 | WebGL abstraction layer |
| @studio-freight/lenis | 1.0.42 | Smooth scrolling (commented out) |
| clsx | 2.1.1 | Conditional class names |
| tailwind-merge | 3.3.1 | Merge Tailwind classes |
| class-variance-authority | 0.7.1 | Variant management |
| tw-animate-css | 1.3.8 | Tailwind animation utilities |

---

## 14. SECURITY & ENVIRONMENT VARIABLES

### Required `.env` (Backend)

```env
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
PORT=5000
```

### Security Notes

- ⚠️ **CORS is wide open** — `app.use(cors())` with no origin restrictions
- ⚠️ **No authentication** — All API endpoints are publicly accessible
- ⚠️ **No rate limiting** — APIs can be called without throttling
- ⚠️ **No input validation** — File uploads are not type-checked beyond Multer
- ⚠️ **Firebase Admin SDK** used with full privileges (service account)
- ✅ `.env` is in `.gitignore` — credentials not committed
- ✅ Private key newlines properly handled

---

## 15. KNOWN ISSUES & TECHNICAL DEBT

### Architectural Issues

1. **Duplicate CSS theme files** — `src/index.css` and `src/styles/globals.css` contain nearly identical theme variables (slight differences in dark mode background: `oklch(0.20...)` vs `oklch(0 0 0)`)
2. **Inconsistent file naming** — `Uploadfrom2.jsx` (typo), `SuppilerName.jsx` (typo), `Rawmaterial.jsx` vs `Rawmaterial1.jsx`
3. **Module naming confusion** — "Module2" in code is actually the "Prism" module, "Module3" is "Orbit"
4. **Components outside `src/`** — The `components/` and `pages/` directories are at `frontend/` root, not inside `src/`
5. **ThemeContext exists but is locked** — Theme toggle UI exists but does nothing
6. **Commented-out Lenis smooth scrolling** — Was planned but disabled
7. **Firebase client SDK installed but unused** — Only `firebase-admin` is used
8. **4 charting libraries** — Chart.js + Highcharts + Recharts + Plotly.js all installed (heavy bundle)
9. **Hardcoded API URL** — Backend URL (`localhost:5000`) is hardcoded in fetch calls across pages
10. **No error boundaries** — React error boundaries not implemented
11. **Analysis2page is empty** — Just a "Work in progress" placeholder
12. **No TypeScript** — `tsconfig.json` exists but all files are `.jsx` (JavaScript)

### Data Issues

1. **Column mapping by index** — Excel parsing uses hardcoded column indices (fragile if Excel format changes)
2. **ReferenceB splitting** — Extracts ALL numbers from ReferenceB, which may create duplicate documents
3. **No data validation** — No schema validation for uploaded Excel files
4. **No pagination** — `get-data`, `orbit`, `analysis` endpoints fetch ALL documents at once

---

## SUMMARY

**Aerozone 5.O** is a sophisticated aerospace materials management platform with:

- **6 analytical modules** each providing unique perspectives on the same procurement/inventory data
- **Firebase Firestore** backend with Excel-powered data ingestion
- **Rich visualization** using 4 different charting libraries + 3D (Three.js) + Maps (Highcharts)
- **Modern dark theme** with glassmorphism, GSAP animations, and Lottie loaders
- **React 19 + Vite 7** frontend with TailwindCSS 4 styling

The app is designed for an aerospace materials company to track procurement orders, inventory quantities, supplier relationships, and geographical distribution of their supply chain.
