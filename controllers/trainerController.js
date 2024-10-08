const { generateRandomPassword } = require('../helper/helper');
const Trainer = require('../models/Trainer');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendEmail } = require('../services/mailer');

// Create a new trainer
exports.createTrainer = async (req, res,next) => {
    const { name, email, phone, gymId } = req.body;

    // Generate a random password for the trainer
    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create a new user for the trainer
    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 2, // Trainer role
        gym: gymId
    });

    try {
        // Save the user in the User table
        const savedUser = await newUser.save();

        // Save the trainer details in the Trainer table
        const newTrainer = new Trainer({
            name,
            email,
            phone,
            gym: gymId,
            user: savedUser._id,  // Link the user with the Trainer
        });

        const savedTrainer = await newTrainer.save();

        res.status(201).json({
            message: 'Trainer created successfully',
            trainer: savedTrainer,
            saveStatus: true
        });
        // Send email to the new trainer
        const subject = 'Trainer Account Created';
        const text = `Hi ${name},\n\nYour trainer account has been created successfully. Your login details are as follows:\nEmail: ${email}\nPassword: ${randomPassword}\n\nThank you for joining the team!`;
        await sendEmail(email, subject, text);
    } catch (error) {
        next(error); // Pass error to error handling middleware

    }
};

// Get all trainers
exports.getTrainers = async (req, res,next) => {
    try {
        const trainers = await Trainer.find().populate('gym');
        res.status(200).json(trainers);
    } catch (error) {
             next(error); // Pass error to error handling middleware

    }
};

// Get a trainer by ID
exports.getTrainerById = async (req, res,next) => {
    try {
        const trainer = await Trainer.findById(req.params.id).populate('gym');
        if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
        res.status(200).json(trainer);
    } catch (error) {
             next(error); // Pass error to error handling middleware

    }
};

// Update a trainer
exports.updateTrainer = async (req, res,next) => {
    const { name, email, phone, gymId } = req.body;

    try {
        const updatedTrainer = await Trainer.findByIdAndUpdate(req.params.id, { name, email, phone, gym: gymId }, { new: true });
        if (!updatedTrainer) return res.status(404).json({ message: 'Trainer not found' });
        res.status(200).json({ message: 'Trainer updated successfully', trainer: updatedTrainer });
    } catch (error) {
        next(error); // Pass error to error handling middleware

    }
};

// Delete a trainer
exports.deleteTrainer = async (req, res,next) => {
    try {
        const deletedTrainer = await Trainer.findByIdAndDelete(req.params.id);
        if (!deletedTrainer) return res.status(404).json({ message: 'Trainer not found' });
        res.status(200).json({ message: 'Trainer deleted successfully' });
    } catch (error) {
             next(error); // Pass error to error handling middleware

    }
};

