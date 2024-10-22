const mongoose = require("mongoose");
const { FrSubscriptionDuration, FrSubStatus } = require("../enums/commonEnum");

const franchiseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  franchiseAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  zipCode: { type: String },
  country: { type: String },
  phone: { type: String },
  email: { type: String },
  website: { type: String },
  establishedYear: { type: Number },
  numberOfGyms: { type: Number, default: 0 },
  description: { type: String },
  membershipPlans: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Membership" },
  ],
  logo: { type: String },
  
  // Subscription Fields
  subscriptionAmount: { type: Number, required: true },
  subscriptionDuration: {
    type: Number,
    enum: Object.values(FrSubscriptionDuration),
    required: true,
  },
  nextPaymentDate: { type: Date, required: true },
  lastPaymentDate: { type: Date },
  subscriptionStatus: {
    type: Number,
    enum: Object.values(FrSubStatus),
    default: FrSubStatus.ACTIVE,
  },

  status: { type: Number, enum: Object.values(FrSubStatus), default: FrSubStatus.ACTIVE }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Franchise", franchiseSchema);
