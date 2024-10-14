// models/gym.js
const mongoose = require("mongoose");
const { GymStatus } = require("../enums/commonEnum");

const gymSchema = new mongoose.Schema({
  name: { type: String, required: true },
  franchise: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Franchise",
    required: false,
  },
  gymAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  email: { type: String },
  website: { type: String },
  phone: { type: String },
  openingHours: { type: String },
  closingHours: { type: String },
  membershipPlans: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Membership" },
  ],
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String },
  logo: { type: String },
  status: {
    type: String,
    enum: Object.values(GymStatus),
    default: GymStatus.ACTIVE,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Gym", gymSchema);
