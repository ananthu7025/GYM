// controllers/membershipController.js
const Membership = require('../models/Membership');
const Gym = require('../models/Gym');
const Franchise = require('../models/Franchise');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Create a new membership
exports.createMembership = async (req, res, next) => {
    const { name, period, amount, signupFee, description, image, gymId, franchiseId } = req.body; // Include gymId and franchiseId

    try {
        const newMembership = new Membership({ name, period, amount, signupFee, description, image, gymId, franchiseId });
        await newMembership.save();
        if(gymId){
        await Gym.findByIdAndUpdate(gymId, { $push: { membershipPlans: newMembership._id } });
        }
        if (franchiseId) {
            await Franchise.findByIdAndUpdate(franchiseId, { $push: { membershipPlans: newMembership._id } });
        }
        res.status(201).json({ 
            message: 'Membership created successfully', 
            membership: newMembership, 
            saveStatus: true 
        });

    } catch (error) {
        console.error('Error creating membership:', error.message);
        next(error); 
    }
};


exports.getMemberships = async (req, res, next) => {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decodedToken.id;

    try {
        // Find the gym associated with the user (gym admin)
        const gym = await Gym.findOne({ gymAdmin: userId });

        if (!gym) {
            return res.status(404).json({ message: "Gym not found for this admin." });
        }

        // Check if the gym has a franchise
        const franchiseId = gym?.franchise;

        // First, try to find memberships for the gym
        let memberships = await Membership.find({ gymId: gym._id });

        // Check if any memberships were found for the gym
        if (memberships && memberships.length > 0) {
            return res.status(200).json(memberships);
        }

        // If no memberships found for the gym, check for franchise memberships
        if (franchiseId) {
            const franchiseMemberships = await Membership.find({ franchiseId: franchiseId });

            if (franchiseMemberships && franchiseMemberships.length > 0) {
                return res.status(200).json({
                    message: "No gym memberships found. Here are some franchise memberships as suggestions.",
                    suggestions: franchiseMemberships
                });
            }
        }

        // If no memberships found at all
        return res.status(404).json({ message: "No memberships found." });

    } catch (error) {
        console.error("Error fetching memberships:", error);
        next(error);
    }
};


// Get a membership by ID
exports.getMembershipById = async (req, res, next) => {
    try {
        const membership = await Membership.findById(req.params.id);
        if (!membership) return res.status(404).json({ message: 'Membership not found' });
        res.status(200).json(membership);
    } catch (error) {
        next(error); 
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
        next(error); 
    }
};
// controllers/membershipController.js

// Bulk import memberships
exports.bulkImportMemberships = async (req, res, next) => {
    const membershipsData = req.body; // Expecting an array of membership objects

    if (!Array.isArray(membershipsData) || membershipsData.length === 0) {
        return res.status(400).json({ message: 'Invalid input. Please provide an array of memberships.' });
    }

    try {
        const createdMemberships = []; // To store successfully created memberships
        const gymUpdates = {}; // To track gym updates
        const franchiseUpdates = {}; // To track franchise updates

        // Process each membership data
        for (const membershipData of membershipsData) {
            const { name, period, amount, signupFee, description, image, gymId, franchiseId } = membershipData;

            const newMembership = new Membership({ name, period, amount, signupFee, description, image, gymId, franchiseId });
            await newMembership.save();
            createdMemberships.push(newMembership);

            // Update gym memberships
            if (gymId) {
                gymUpdates[gymId] = (gymUpdates[gymId] || []).concat(newMembership._id);
            }

            // Update franchise memberships
            if (franchiseId) {
                franchiseUpdates[franchiseId] = (franchiseUpdates[franchiseId] || []).concat(newMembership._id);
            }
        }

        // Update gyms with new memberships
        for (const [gymId, membershipIds] of Object.entries(gymUpdates)) {
            await Gym.findByIdAndUpdate(gymId, { $push: { membershipPlans: { $each: membershipIds } } });
        }

        // Update franchises with new memberships
        for (const [franchiseId, membershipIds] of Object.entries(franchiseUpdates)) {
            await Franchise.findByIdAndUpdate(franchiseId, { $push: { membershipPlans: { $each: membershipIds } } });
        }

        res.status(201).json({ 
            message: 'Memberships created successfully', 
            memberships: createdMemberships, 
            saveStatus: true 
        });

    } catch (error) {
        console.error('Error importing memberships:', error.message);
        next(error);
    }
};

// Delete a membership
exports.deleteMembership = async (req, res, next) => {
    try {
        const deletedMembership = await Membership.findByIdAndDelete(req.params.id);
        if (!deletedMembership) return res.status(404).json({ message: 'Membership not found' });
        res.status(200).json({ message: 'Membership deleted successfully', saveStatus: true });
    } catch (error) {
        next(error); 
    }
};
