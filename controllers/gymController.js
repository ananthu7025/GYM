const Gym = require('../models/Gym');
const User = require('../models/User');
const { sendEmail } = require('../services/mailer');
const { GymStatus } = require('../enums/commonEnum'); // Import GymStatus enum
const Franchise = require('../models/Franchise');

// Create gym with gymAdmin
exports.createGym = async (req, res, next) => {
    const { 
        name, 
        gymAdminData, 
        franchiseId, 
        openingHours, 
        closingHours, 
        address, 
        city, 
        state, 
        zipCode, 
        country,
        logo
    } = req.body;

    // Create a new user for gym admin
    const gymAdmin = new User({
        name: gymAdminData.name,
        email: gymAdminData.email,
        password: gymAdminData.password,
        role: 3 // Gym Admin role
    });

    try {
        // Save the gym admin user
        await gymAdmin.save();
        // Initialize gym details
        let gymName = name; // Default name from request
        let gymLogo = logo; // Default logo from request

        // If a franchiseId is provided, fetch the franchise details
        if (franchiseId) {
            const franchise = await Franchise.findById(franchiseId).select('name logo'); // Select only necessary fields

            if (franchise) {
                gymName = franchise.name; // Use franchise name
                gymLogo = franchise.logo; // Use franchise logo
            }
        }

        // Create and save the gym
        const newGym = new Gym({
            name: gymName,
            gymAdmin: gymAdmin._id,
            franchise: franchiseId || null, // Handle optional franchise
            openingHours,
            closingHours,
            address,
            city,
            state,
            zipCode,
            country,
            logo: gymLogo, // Save the selected logo
            status: GymStatus.ACTIVE // Set default status
        });
        await newGym.save();

        res.status(201).json({ 
            message: 'Gym and Gym Admin created successfully', 
            gym: newGym, 
            saveStatus: true 
        });

        // Send email to the gym admin
        const subject = 'Gym Admin Account Created';
        const text = `Hi ${gymAdminData.name},\n\nYour gym admin account has been created successfully. Your login details are as follows:\nEmail: ${gymAdminData.email}\nPassword: ${gymAdminData.password}\n\nThank you for joining!`;
        await sendEmail(gymAdminData.email, subject, text);
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};


// Get all gyms
exports.getGyms = async (req, res, next) => {
    try {
        const gyms = await Gym.find()
            .populate('gymAdmin')
            .populate('franchise')
            .populate('membershipPlans'); // Populate membershipPlans

        res.status(200).json(gyms);
    } catch (error) {
        next(error); // Pass error to error handling middleware
    }
};

