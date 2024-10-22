// models/Membership.js
const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    period: { type: String, required: true },
    amount: { type: Number, required: true },
    signupFee: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String },
    franchiseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
    },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Membership", MembershipSchema);
