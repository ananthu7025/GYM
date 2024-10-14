const mongoose = require("mongoose");
const Roles = require("../enums/rolesEnum");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: Number, enum: Object.values(Roles), required: true },
  gym: { type: mongoose.Schema.Types.ObjectId, ref: "Gym" },
});

module.exports = mongoose.model("User", userSchema);
