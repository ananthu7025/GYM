const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
// Register user
exports.register = async (req, res, next) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });
        await newUser.save();
        res.status(201).json({ 
            message: 'User registered successfully',
            saveStatus: true // Indicating successful save
        });
    } catch (error) {
        console.error('Error during registration:', error.message);
        next(error); // Pass error to error handling middleware
    }
};

// Login user
exports.login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ 
            token,
            saveStatus: true // Indicating successful login
        });
    } catch (error) {
        console.error('Error during login:', error.message);
        next(error); // Pass error to error handling middleware
    }
};

exports.getUserDetails = async (req, res,next) => {
    // Extract token from the authorization header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        const userRole = decoded.role;

        // Fetch user details from the User model
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch additional details based on user role
        let additionalDetails = null;
        if (userRole === 1) { // Member
            additionalDetails = await Member.findOne({ email: user.email }).populate('gym');
        } else if (userRole === 2) { // Trainer
            additionalDetails = await Trainer.findOne({ email: user.email }).populate('gym');
        }

        // Return user details along with additional details
        res.status(200).json({
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            additionalDetails,
        });
    } catch (error) {
        console.error('Error fetching user details:', error.message);
        next(error); // Pass error to error handling middleware
    }
};