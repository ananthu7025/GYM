const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    gym: { type: mongoose.Schema.Types.ObjectId, ref: 'Gym', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Trainer', trainerSchema);