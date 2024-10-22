const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  img: { type: String },
  qualifications: { type: String },
  specialization: { type: String },
  experience: { type: Number, default: 0 },
  availability: {
    days: [{ type: String }],
    timeSlots: [{ type: String }],
  },
  salary: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Trainer", trainerSchema);
