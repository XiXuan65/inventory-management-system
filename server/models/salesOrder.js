const mongoose = require("mongoose");

const salesOrderSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    sellingPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
});

const SalesOrder = mongoose.model("SalesOrder", salesOrderSchema);

module.exports = SalesOrder;
