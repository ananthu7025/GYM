// controllers/membershipController.js
const Membership = require('../models/Membership');
const Gym = require('../models/Gym');

// Create a new membership
exports.createMembership = async (req, res, next) => {
    const { name, period, amount, signupFee, description, image, gymId } = req.body; // Include gymId

    try {
        const newMembership = new Membership({ name, period, amount, signupFee, description, image, gymId }); // Add gymId to the membership
        // Update the corresponding gym's membershipPlans
        await Gym.findByIdAndUpdate(gymId, { $push: { membershipPlans: newMembership._id } });
        await newMembership.save();
        
        res.status(201).json({ message: 'Membership created successfully', membership: newMembership, saveStatus: true });
    } catch (error) {
        console.error('Error creating membership:', error.message);
        next(error); // Pass error to error handling middleware
    }
};


// Get all memberships
// Get all memberships
exports.getMemberships = async (req, res, next) => {
    try {
        const memberships = await Membership.find().populate('gymId'); // Populate gymId to get gym details
        res.status(200).json(memberships);
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};


// Get a membership by ID
exports.getMembershipById = async (req, res, next) => {
    try {
        const membership = await Membership.findById(req.params.id);
        if (!membership) return res.status(404).json({ message: 'Membership not found' });
        res.status(200).json(membership);
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

// Update a membership
exports.updateMembership = async (req, res, next) => {
    const { name, period, amount, signupFee, description, image,gymId } = req.body;

    try {
        const updatedMembership = await Membership.findByIdAndUpdate(req.params.id, { name, period, amount, signupFee, description, image,gymId }, { new: true });
        if (!updatedMembership) return res.status(404).json({ message: 'Membership not found' });
        res.status(200).json({ message: 'Membership updated successfully', membership: updatedMembership, saveStatus: true });
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

// Delete a membership
exports.deleteMembership = async (req, res, next) => {
    try {
        const deletedMembership = await Membership.findByIdAndDelete(req.params.id);
        if (!deletedMembership) return res.status(404).json({ message: 'Membership not found' });
        res.status(200).json({ message: 'Membership deleted successfully', saveStatus: true });
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};
