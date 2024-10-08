// models/Membership.js
const mongoose = require('mongoose');

const MembershipSchema = new mongoose.Schema({
    name: { type: String, required: true },
    period: { type: String, required: true }, // e.g., '1 Month', '6 Months', '1 Year'
    amount: { type: Number, required: true },
    signupFee: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String }, // URL to the membership image
    franchise: { type: mongoose.Schema.Types.ObjectId, ref: 'Franchise', required: false }, // Reference to Franchise,
    gymId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Membership', MembershipSchema);
