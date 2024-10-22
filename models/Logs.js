// models/log.js
const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
  logTime: { type: Date, default: Date.now },
  type: { type: String, enum: ["CheckIn", "CheckOut"], required: true },
});

module.exports = mongoose.model("Log", logSchema);
