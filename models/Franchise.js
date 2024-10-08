// models/franchise.js

const mongoose = require('mongoose');
const { Status } = require('../enums/commonEnum');

const franchiseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    franchiseAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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
    logo: { type: String },
    status: { type: Number, enum: Object.values(Status), default: Status.ACTIVE }, // Use the Status enum
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Export the Franchise model
module.exports = mongoose.model('Franchise', franchiseSchema);
