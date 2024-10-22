const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  memberId: { type: String, required: true, unique: true }, // Unique member ID
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true }, // Gender field
  dateOfBirth: { type: Date, required: true }, // Date of birth
  displayImage: { type: String }, // URL or path for display image

  // Contact Information
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true }, // Zip code
  phone: { type: String, required: true, unique: true }, // Unique phone number
  email: { type: String, required: true, unique: true }, // Unique email
  emergencyContactName: { type: String, required: true }, // Emergency contact name
  emergencyContactPhone: { type: String, required: true }, // Emergency contact phone

  // Physical Information
  weight: { type: Number, required: true }, // Weight in kg
  height: { type: Number, required: true }, // Height in cm
  fat: { type: Number }, // Body fat percentage
  arms: { type: Number }, // Arms measurement
  thigh: { type: Number }, // Thigh measurement
  waist: { type: Number }, // Waist measurement
  chest: { type: Number }, // Chest measurement

  // More Information
  membershipId: { type: String, required: true }, // Membership ID
  firstPaymentDate: { type: Date }, // First payment date
  assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: "Trainer" }, // Reference to assigned trainer
  assignedWorkoutPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WeeklyWorkoutPlan", // Reference to the WeeklyWorkoutPlan schema
  },
  assignedDietPlan: { type: mongoose.Schema.Types.ObjectId, ref: "DietPlan" }, // New field
  nextPaymentDate: { type: Date }, // Derived from the firstPaymentDate and membership period
  isPaymentDue: { type: Boolean, default: false },
  // Additional fields
  gym: { type: mongoose.Schema.Types.ObjectId, ref: "Gym", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Member", memberSchema);
