import mongoose from "mongoose";

const indentQuantitySchema = new mongoose.Schema(
    {
        UNIQUE_CODE: { type: String, index: true },
        ITEM_CODE: { type: String, default: "", index: true },
        ITEM_DESCRIPTION: { type: String, default: "" },
        CATEGORY: { type: String, default: "" },
        PROJECT_NO: { type: String, default: "" },
        REQUIRED_QTY: { type: Number, default: 0 },
        UOM: { type: String, default: "" },
        PLANNED_ORDER: { type: String, default: "" },
        TYPE: { type: String, default: "" },
        ReferenceB: { type: String, default: "" },
    },
    {
        timestamps: true,
        collection: "Indent_Quantity",
    }
);

export default mongoose.models.IndentQuantity || mongoose.model("IndentQuantity", indentQuantitySchema);
