import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import connectDB from "./db.js";
import ExcelData from "./models/ExcelData.js";
import IndentQuantity from "./models/IndentQuantity.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helpers
const parseDate = (dateValue) => {
    if (!dateValue) return null;
    if (typeof dateValue === "number") return new Date((dateValue - 25569) * 86400 * 1000);
    if (typeof dateValue === "string") return new Date(dateValue);
    if (dateValue instanceof Date) return dateValue;
    return null;
};

const formatDateToDDMMMYYYY = (date) => {
    if (!date) return "";
    const day = date.getDate().toString().padStart(2, "0");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
};

const calculateInventoryValue = (orderLineValue, orderedQty, onHand) => {
    orderLineValue = Number(orderLineValue) || 0;
    orderedQty = Number(orderedQty) || 0;
    onHand = Number(onHand) || 0;
    return orderedQty > 0 ? ((orderLineValue / orderedQty) * onHand).toFixed(2) : 0;
};

// Routes
router.post("/upload-excel", upload.single("file"), async (req, res) => {
    try {
        await connectDB();
        if (!req.file) return res.status(400).send("No file uploaded");

        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const rows = data.slice(1);

        let savedCount = 0;
        let deletedCount = 0;
        const docsToInsert = [];

        rows.forEach((row) => {
            while (row.length < 52) row.push("");
            const parsedDate = parseDate(row[14]);
            const formattedDate = parsedDate ? formatDateToDDMMMYYYY(parsedDate) : "";

            let deliveryDate = "";
            if (parsedDate) {
                const d = new Date(parsedDate);
                d.setDate(d.getDate() + 31);
                deliveryDate = formatDateToDDMMMYYYY(d);
            }

            const rawdate = row[15];
            let rawformattedDate = "";
            if (rawdate) {
                const rawparsedDate = parseDate(rawdate);
                rawformattedDate = rawparsedDate ? formatDateToDDMMMYYYY(rawparsedDate) : "";
            }

            const rawRef = String(row[45] || "").trim();
            const projectCode = String(row[8] || "").trim();
            const itemCode = String(row[9] || "").trim();
            const Type = String(row[46] || "0").trim();
            const Material = String(row[47] || "0").trim();

            const refNumbers = rawRef.match(/\d+/g) || [];
            refNumbers.forEach(refNum => {
                const uniqueCode = `${refNum}${projectCode}${itemCode}`;
                const typeMaterial = `${Type}${Material}`;
                const docData = {
                    UniqueCode: uniqueCode,
                    ReferenceB: rawRef,
                    ProjectCode: projectCode,
                    ItemCode: itemCode,
                    ItemShortDescription: row[10] || "",
                    Category: row[4] || "",
                    SupplierName: row[3] || "",
                    PONo: row[5] || "",
                    Date: formattedDate,
                    OrderedLineQuantity: Number(row[19]) || 0,
                    UOM: row[16] || "",
                    OrderLineValue: Number(row[25]) || 0,
                    Currency: row[23] || "",
                    PlannedReceiptDate: rawformattedDate,
                    Delivery: deliveryDate,
                    InventoryQuantity: Number(row[43]) || 0,
                    InventoryUOM: row[16] || "",
                    InventoryValue: calculateInventoryValue(row[25], row[19], row[43]),
                    Type: typeMaterial,
                    CustomerName: row[49] || "",
                    City: row[50] || "",
                    Country: row[51] || "",
                };

                if (!docData.Currency || String(docData.Currency).trim() === "") {
                    deletedCount++;
                    return;
                }
                docsToInsert.push(docData);
                savedCount++;
            });
        });

        if (docsToInsert.length > 0) {
            await ExcelData.insertMany(docsToInsert);
        }

        res.status(200).json({
            message: "Upload finished",
            saved: savedCount,
            deleted: deletedCount,
            rowsProcessed: rows.length,
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error processing file");
    }
});

router.get("/get-data", async (req, res) => {
    try {
        await connectDB();
        const excelData = await ExcelData.find().lean();
        const indentData = await IndentQuantity.find().lean();
        const mergedData = excelData.map((excelRow) => {
            const match = indentData.find(doc => doc.ITEM_CODE === excelRow.ItemCode);
            return {
                ...excelRow,
                id: excelRow._id,
                IndentQuantity: match ? match.REQUIRED_QTY : "NA",
                IndentUOM: match ? match.UOM : "NA",
                IndentProject: match ? match.PROJECT_NO : "NA",
                IndentPlannedOrder: match ? match.PLANNED_ORDER : "NA",
            };
        });
        res.json(mergedData);
    } catch (err) {
        res.status(500).send("Error fetching data");
    }
});

router.get("/get-indent", async (req, res) => {
    try {
        await connectDB();
        const data = await IndentQuantity.find().lean();
        res.json(data.map(doc => ({ id: doc._id, ...doc })));
    } catch (err) {
        res.status(500).send("Error fetching indent data");
    }
});

router.get("/prism", async (req, res) => {
    try {
        await connectDB();
        const excelData = await ExcelData.find().lean();
        const indentData = await IndentQuantity.find().lean();

        const excelGrouped = {};
        excelData.forEach(row => {
            const key = row.UniqueCode;
            if (!excelGrouped[key]) {
                excelGrouped[key] = { ProjectCode: row.ProjectCode, ItemCode: row.ItemCode, OrderedQty: Number(row.OrderedLineQuantity) || 0 };
            } else {
                excelGrouped[key].OrderedQty += Number(row.OrderedLineQuantity) || 0;
            }
        });

        const indentGrouped = {};
        indentData.forEach(row => {
            const key = row.UNIQUE_CODE;
            if (!indentGrouped[key]) {
                indentGrouped[key] = {
                    ReferenceB: row.ReferenceB, ProjectNo: row.PROJECT_NO, ItemCode: row.ITEM_CODE,
                    Description: row.ITEM_DESCRIPTION, Category: row.CATEGORY, RequiredQty: Number(row.REQUIRED_QTY) || 0,
                    UOM: row.UOM, PlannedOrder: row.PLANNED_ORDER, Type: row.TYPE
                };
            } else {
                indentGrouped[key].RequiredQty += Number(row.REQUIRED_QTY) || 0;
            }
        });

        const result = Object.keys(indentGrouped).map(key => {
            const indent = indentGrouped[key];
            const excel = excelGrouped[key] || {};
            const ordered = excel.OrderedQty || 0;
            return {
                UNIQUE_CODE: key, ReferenceB: indent.ReferenceB, ProjectNo: indent.ProjectNo,
                ItemCode: indent.ItemCode, Description: indent.Description, Category: indent.Category,
                Type: indent.Type || "", OrderedQty: ordered, RequiredQty: indent.RequiredQty,
                Difference: indent.RequiredQty - ordered, UOM: indent.UOM, PlannedOrder: indent.PlannedOrder
            };
        });
        res.json(result);
    } catch (err) {
        res.status(500).send("Error fetching data");
    }
});

router.get("/orbit", async (req, res) => {
    try {
        await connectDB();
        const excelRawData = await ExcelData.find().lean();
        res.status(200).json(excelRawData.map(doc => ({
            ...doc,
            ReferenceB: doc.ReferenceB ?? doc["Reference B"] ?? doc.REFB ?? doc.REF_B ?? doc.Reference ?? null
        })));
    } catch (err) {
        res.status(500).send("Error fetching data");
    }
});

router.get("/analysis", async (req, res) => {
    try {
        await connectDB();
        const excelRawData = await ExcelData.find().lean();
        res.status(200).json(excelRawData.map(doc => {
            const orderValue = Number(doc.OrderLineValue) || 0;
            const orderQty = Number(doc.OrderedLineQuantity) || 0;
            return { ...doc, Rate: orderQty !== 0 ? (orderValue / orderQty).toFixed(3) : null };
        }));
    } catch (err) {
        res.status(500).send("Error fetching data");
    }
});

// Create mini-express app to export
const app = express();
app.use(cors());
app.use(express.json());
app.use("/", router);

export default app;
