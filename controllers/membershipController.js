// controllers/membershipController.js
const Membership = require('../models/Membership');
const Gym = require('../models/Gym');
const Franchise = require('../models/Franchise');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Roles = require('../enums/rolesEnum');

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
    try {
        // Check if authorization token exists
        if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization token missing or invalid." });
        }

        // Extract and decode the token
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decodedToken.id;
        const userRole = decodedToken.role;

        // Find the gym associated with the gym admin (user)
        const gym = await Gym.findOne({ gymAdmin: userId });

        if (gym) {
            // If gym exists, check for gym memberships
            const gymMemberships = await Membership.find({ gymId: gym._id });

            // If gym has memberships, return them
            if (gymMemberships && gymMemberships.length > 0) {
                return res.status(200).json(gymMemberships);
            }

            // If no memberships found for the gym, check if the gym has a franchise
            if (gym.franchise) {
                console.log("No gym memberships found, checking franchise memberships...");

                const franchiseMemberships = await Membership.find({ franchiseId: gym.franchise });

                // If franchise memberships are found, return them as suggestions for gym admins
                if (franchiseMemberships && franchiseMemberships.length > 0) {
                    if (userRole === Roles.GYM_ADMIN) {
                        return res.status(200).json({
                            message: "No gym memberships found. Here are some franchise memberships as suggestions.",
                            suggestions: franchiseMemberships
                        });
                    }
                    return res.status(200).json(franchiseMemberships);
                }
            }
        }

       if(userRole === Roles.FRANCHISE_ADMIN){
         // If gym is not found, or no memberships found, check for franchise memberships as a fallback
         const franchiseMemberships = await Membership.find({ franchiseId: { $exists: true } });
         return res.status(200).json(franchiseMemberships);
       }

        // If no memberships found at all
        return res.status(200).json({
            memberships: []
        });

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
