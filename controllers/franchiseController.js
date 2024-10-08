const Franchise = require('../models/Franchise');
const User = require('../models/User');
const { sendEmail } = require('../services/mailer');

// Create franchise with franchiseAdmin
exports.createFranchise = async (req, res, next) => {
    const { name, address, city, state, zipCode, country, phone, email, website, establishedYear, description, logo, franchiseAdminData } = req.body;

    // Validate input data
    if (!name || !franchiseAdminData || !franchiseAdminData.email || !franchiseAdminData.password) {
        return res.status(400).json({ message: 'Name, franchise admin email, and password are required.' });
    }

    // Create a new user for franchise admin
    const franchiseAdmin = new User({ 
        name: franchiseAdminData.name, 
        email: franchiseAdminData.email, 
        password: franchiseAdminData.password, 
        role: 2 // Franchise Admin role
    });

    try {
        // Save the franchise admin user
        await franchiseAdmin.save();

        // Create and save the franchise
        const newFranchise = new Franchise({ 
            name, 
            address, 
            city, 
            state, 
            zipCode, 
            country, 
            phone, 
            email, 
            website, 
            establishedYear, 
            description, 
            logo, 
            franchiseAdmin: franchiseAdmin._id 
        });
        await newFranchise.save();

        // Send email to the franchise admin
        const subject = 'Franchise Admin Account Created';
        const text = `Hi ${franchiseAdminData.name},\n\nYour franchise admin account has been created successfully. Your login details are as follows:\nEmail: ${franchiseAdminData.email}\nPassword: ${franchiseAdminData.password}\n\nThank you for joining!`;
        await sendEmail(franchiseAdminData.email, subject, text);
        
        res.status(201).json({ message: 'Franchise and Franchise Admin created successfully', franchise: newFranchise, saveStatus: true });
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

// Get all franchises
exports.getFranchises = async (req, res, next) => {
    try {
        const franchises = await Franchise.find().populate('franchiseAdmin');
        res.status(200).json(franchises);
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

// Get franchise by ID
exports.getFranchiseById = async (req, res, next) => {
    const { id } = req.params;
    try {
        const franchise = await Franchise.findById(id).populate('franchiseAdmin');
        if (!franchise) {
            return res.status(404).json({ message: 'Franchise not found.' });
        }
        res.status(200).json(franchise);
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

// Update franchise by ID
exports.updateFranchise = async (req, res, next) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const updatedFranchise = await Franchise.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedFranchise) {
            return res.status(404).json({ message: 'Franchise not found.' });
        }
        res.status(200).json({ message: 'Franchise updated successfully', franchise: updatedFranchise });
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

// Delete franchise by ID
exports.deleteFranchise = async (req, res, next) => {
    const { id } = req.params;

    try {
        const deletedFranchise = await Franchise.findByIdAndDelete(id);
        if (!deletedFranchise) {
            return res.status(404).json({ message: 'Franchise not found.' });
        }
        res.status(200).json({ message: 'Franchise deleted successfully' });
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};
