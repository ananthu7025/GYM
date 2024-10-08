const { generateRandomPassword } = require('../helper/helper');
const Member = require('../models/Member');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendEmail } = require('../services/mailer');

// Create a new member
exports.createMember = async (req, res,next) => {
    const { name, email, phone, gymId } = req.body;

    // Generate a random password for the member
    const randomPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create a new user for the member
    const newUser = new User({
        name,
        email,
        password: hashedPassword,
        role: 1, // Member role
        gym: gymId
    });

    try {
        // Save the user in the User table
        const savedUser = await newUser.save();

        // Save the member details in the Member table
        const newMember = new Member({
            name,
            email,
            phone,
            gym: gymId,
            user: savedUser._id,  // Link the user with the Member
        });

        const savedMember = await newMember.save();

        res.status(201).json({
            message: 'Member created successfully',
            member: savedMember,
            saveStatus: true
        });
         // Send email to the new member
         const subject = 'Welcome to the Gym!';
         const text = `Hi ${name},\n\nYour account has been created successfully. Your login details are as follows:\nEmail: ${email}\nPassword: ${randomPassword}\n\nThank you for joining!`;
         await sendEmail(email, subject, text);
    } catch (error) {
        next(error); // Pass error to error handling middleware

    }
};


// Get all members
exports.getMembers = async (req, res,next) => {
    try {
        const members = await Member.find().populate('gym');
        res.status(200).json(members);
    } catch (error) {
        next(error); // Pass error to error handling middleware

    }
};

// Get a member by ID
exports.getMemberById = async (req, res,next) => {
    try {
        const member = await Member.findById(req.params.id).populate('gym');
        if (!member) return res.status(404).json({ message: 'Member not found' });
        res.status(200).json(member);
    } catch (error) {
        next(error); // Pass error to error handling middleware

    }
};

// Update a member
exports.updateMember = async (req, res,next) => {
    const { name, email, phone, gymId } = req.body;

    try {
        const updatedMember = await Member.findByIdAndUpdate(req.params.id, { name, email, phone, gym: gymId }, { new: true });
        if (!updatedMember) return res.status(404).json({ message: 'Member not found' });
        res.status(200).json({ message: 'Member updated successfully', member: updatedMember,saveStatus: true });
    } catch (error) {
        next(error); // Pass error to error handling middleware

    }
};

// Delete a member
exports.deleteMember = async (req, res,next) => {
    try {
        const deletedMember = await Member.findByIdAndDelete(req.params.id);
        if (!deletedMember) return res.status(404).json({ message: 'Member not found' });
        res.status(200).json({ message: 'Member deleted successfully',saveStatus: true });
    } catch (error) {
        next(error); // Pass error to error handling middleware

    }
};