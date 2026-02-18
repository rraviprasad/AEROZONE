const mongoose = require("mongoose");

const excelDataSchema = new mongoose.Schema(
    {
        UniqueCode: { type: String, index: true },
        ReferenceB: { type: String, default: "" },
        ProjectCode: { type: String, default: "", index: true },
        ItemCode: { type: String, default: "", index: true },
        ItemShortDescription: { type: String, default: "" },
        Category: { type: String, default: "" },
        SupplierName: { type: String, default: "" },
        PONo: { type: mongoose.Schema.Types.Mixed, default: "" },
        Date: { type: String, default: "" },
        OrderedLineQuantity: { type: Number, default: 0 },
        UOM: { type: String, default: "" },
        OrderLineValue: { type: Number, default: 0 },
        Currency: { type: String, default: "" },
        PlannedReceiptDate: { type: String, default: "" },
        Delivery: { type: String, default: "" },
        InventoryQuantity: { type: Number, default: 0 },
        InventoryUOM: { type: String, default: "" },
        InventoryValue: { type: mongoose.Schema.Types.Mixed, default: 0 },
        Type: { type: String, default: "" },
        CustomerName: { type: String, default: "" },
        City: { type: String, default: "" },
        Country: { type: String, default: "" },
    },
    {
        timestamps: true,
        collection: "excelData", // Explicit collection name
    }
);

module.exports = mongoose.model("ExcelData", excelDataSchema);
