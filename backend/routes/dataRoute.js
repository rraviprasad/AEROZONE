const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const ExcelData = require("../models/ExcelData");
const IndentQuantity = require("../models/IndentQuantity");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Helpers
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

// ✅ Upload Excel → MongoDB Atlas
router.post("/upload-excel", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // raw array
    const rows = data.slice(1); // skip header row

    let savedCount = 0;
    let deletedCount = 0;
    const docsToInsert = [];

    rows.forEach((row) => {
      while (row.length < 52) row.push(""); // make sure all indexes exist

      // ✅ Parse and format Date
      const parsedDate = parseDate(row[14]);
      const formattedDate = parsedDate ? formatDateToDDMMMYYYY(parsedDate) : "";

      // ✅ Delivery date = PlannedReceiptDate + 31
      let deliveryDate = "";
      if (parsedDate) {
        const d = new Date(parsedDate);
        d.setDate(d.getDate() + 31);
        deliveryDate = formatDateToDDMMMYYYY(d);
      }

      // ✅ PlannedReceiptDate raw date
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

      // Extract ALL numbers from ReferenceB (supports +, &, /, -, spaces)
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

        // Skip blank Currency rows
        if (!docData.Currency || String(docData.Currency).trim() === "") {
          deletedCount++;
          return;
        }

        docsToInsert.push(docData);
        savedCount++;
      });
    });

    // ✅ Bulk insert into MongoDB
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

// ✅ Fetch merged excelData + Indent_Quantity
router.get("/get-data", async (req, res) => {
  try {
    // 1️⃣ Fetch excelData
    const excelData = await ExcelData.find().lean();

    // 2️⃣ Fetch Indent_Quantity
    const indentData = await IndentQuantity.find().lean();

    // 3️⃣ Merge by ItemCode ↔ ITEM_CODE
    const mergedData = excelData.map((excelRow) => {
      const match = indentData.find(
        (indent) => indent.ITEM_CODE === excelRow.ItemCode
      );

      return {
        ...excelRow,
        id: excelRow._id, // keep compatibility with frontend expecting 'id'
        IndentQuantity: match ? match.REQUIRED_QTY : "NA",
        IndentUOM: match ? match.UOM : "NA",
        IndentProject: match ? match.PROJECT_NO : "NA",
        IndentPlannedOrder: match ? match.PLANNED_ORDER : "NA",
      };
    });

    res.json(mergedData);
  } catch (err) {
    console.error("🔥 Error fetching merged data:", err);
    res.status(500).send("Error fetching data");
  }
});

// ✅ Fetch Indent_Quantity collection
router.get("/get-indent", async (req, res) => {
  try {
    const data = await IndentQuantity.find().lean();
    // Add 'id' field for frontend compatibility
    const result = data.map((doc) => ({ id: doc._id, ...doc }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching indent data");
  }
});

// ✅ Prism endpoint
router.get("/prism", async (req, res) => {
  try {
    const excelData = await ExcelData.find().lean();
    const indentData = await IndentQuantity.find().lean();

    // ---------- Group excelData ----------
    const excelGrouped = {};
    excelData.forEach(row => {
      const key = row.UniqueCode;
      if (!excelGrouped[key]) {
        excelGrouped[key] = {
          ProjectCode: row.ProjectCode || "",
          ItemCode: row.ItemCode || "",
          OrderedQty: Number(row.OrderedLineQuantity) || 0,
        };
      } else {
        excelGrouped[key].OrderedQty += Number(row.OrderedLineQuantity) || 0;
      }
    });

    // ---------- Group indentData ----------
    const indentGrouped = {};
    indentData.forEach(row => {
      const key = row.UNIQUE_CODE;
      if (!indentGrouped[key]) {
        indentGrouped[key] = {
          ReferenceB: row.ReferenceB || "",
          ProjectNo: row.PROJECT_NO || "",
          ItemCode: row.ITEM_CODE || "",
          Description: row.ITEM_DESCRIPTION || "",
          Category: row.CATEGORY || "",
          RequiredQty: Number(row.REQUIRED_QTY) || 0,
          UOM: row.UOM || "",
          PlannedOrder: row.PLANNED_ORDER || "",
          Type: row.TYPE || "",
        };
      } else {
        indentGrouped[key].RequiredQty += Number(row.REQUIRED_QTY) || 0;
      }
    });

    // ---------- LEFT JOIN (Indent primary) ----------
    const result = Object.keys(indentGrouped).map(key => {
      const indent = indentGrouped[key];
      const excel = excelGrouped[key] || {};

      const ordered = excel.OrderedQty || 0;

      return {
        UNIQUE_CODE: key,
        ReferenceB: indent.ReferenceB,
        ProjectNo: indent.ProjectNo,
        ItemCode: indent.ItemCode,
        Description: indent.Description,
        Category: indent.Category,
        Type: indent.Type || "",
        OrderedQty: ordered,
        RequiredQty: indent.RequiredQty,
        Difference: indent.RequiredQty - ordered,
        UOM: indent.UOM,
        PlannedOrder: indent.PlannedOrder
      };
    });

    res.json(result);
  } catch (err) {
    console.error("🔥 Error fetching merged data:", err);
    res.status(500).send("Error fetching data");
  }
});

// ✅ Orbit endpoint
router.get("/orbit", async (req, res) => {
  try {
    const excelRawData = await ExcelData.find().lean();

    const excelData = excelRawData.map(doc => {
      return {
        Currency: doc.Currency ?? null,
        Date: doc.Date ?? null,
        ItemCode: doc.ItemCode ?? null,
        ItemShortDescription: doc.ItemShortDescription ?? null,
        OrderLineValue: doc.OrderLineValue ?? null,
        OrderedLineQuantity: doc.OrderedLineQuantity ?? null,
        PONo: doc.PONo ?? null,
        PlannedReceiptDate: doc.PlannedReceiptDate ?? null,
        ProjectCode: doc.ProjectCode ?? null,
        SupplierName: doc.SupplierName ?? null,
        UOM: doc.UOM ?? null,
        Category: doc.Category ?? null,
        CustomerName: doc.CustomerName ?? null,
        Type: doc.Type ?? null,
        City: doc.City ?? null,
        Country: doc.Country ?? null,
        ReferenceB:
          doc.ReferenceB ??
          doc["Reference B"] ??
          doc.REFB ??
          doc.REF_B ??
          doc.Reference ??
          null,
      };
    });

    res.status(200).json(excelData);
  } catch (err) {
    console.error("🔥 Error fetching Orbit data:", err);
    res.status(500).send("Error fetching data");
  }
});

// ✅ Analysis endpoint
router.get("/analysis", async (req, res) => {
  try {
    const excelRawData = await ExcelData.find().lean();

    const excelData = excelRawData.map(doc => {
      const orderValue = Number(doc.OrderLineValue) || 0;
      const orderQty = Number(doc.OrderedLineQuantity) || 0;

      const Rate = orderQty !== 0 ? ((orderValue / orderQty).toFixed(3)) : null;

      return {
        Currency: doc.Currency ?? null,
        ReferenceB: doc.ReferenceB ?? null,
        ItemCode: doc.ItemCode ?? null,
        ItemShortDescription: doc.ItemShortDescription ?? null,
        ProjectCode: doc.ProjectCode ?? null,
        SupplierName: doc.SupplierName ?? null,
        PONo: doc.PONo ?? null,
        OrderLineValue: orderValue,
        OrderedLineQuantity: orderQty,
        UOM: doc.UOM ?? null,
        PlannedReceiptDate: doc.PlannedReceiptDate ?? null,
        Rate,
      };
    });

    res.status(200).json(excelData);
  } catch (err) {
    console.error("Error fetching data:", err);
    res.status(500).send("Error fetching data");
  }
});

module.exports = router;
