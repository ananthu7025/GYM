// models/FranchisePayment.js
const mongoose = require("mongoose");

const franchisePaymentSchema = new mongoose.Schema({
  franchise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Franchise",
    required: true,
  },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ["PAID", "DUE"], default: "DUE" },
});

module.exports = mongoose.model("FranchisePayment", franchisePaymentSchema);
