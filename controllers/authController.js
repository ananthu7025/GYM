const User = require("../models/User");
const Franchise = require("../models/Franchise");
const Gym = require("../models/Gym");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Member = require("../models/Member");
const Trainer = require("../models/Trainer");
const Roles = require("../enums/rolesEnum");

// Register user
exports.register = async (req, res, next) => {
  const { name, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({
      message: "User registered successfully",
      saveStatus: true,
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    console.log(user)
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });
    console.log(isMatch)

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );
    res.status(200).json({
      token,
      saveStatus: true,
    });
  } catch (error) {
    console.log(error)
    console.error("Error during login:", error.message);
    next(error);
  }
};

// get userdetails
exports.getUserDetails = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const userRole = decoded.role;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let additionalDetails = null;
    if (userRole === Roles.SUPER_ADMIN) {
      additionalDetails = { message: "Super Admin has no additional details" };
    } else if (userRole === Roles.FRANCHISE_ADMIN) {
      const franchiseDetails = await Franchise.findOne({
        franchiseAdmin: userId,
      });
      if (franchiseDetails) {
        const associatedGyms = await Gym.find({
          franchise: franchiseDetails._id,
        });
        additionalDetails = {
          franchiseDetails,
          associatedGyms,
        };
      }
    } else if (userRole === Roles.GYM_ADMIN) {
      additionalDetails = await Gym.findOne({ gymAdmin: userId });
    } else if (userRole === Roles.TRAINER) {
      additionalDetails = await Trainer.findOne({ user: userId }).populate(
        "gym"
      );
    } else if (userRole === Roles.MEMBER) {
      additionalDetails = await Member.findOne({ user: userId }).populate(
        "gym"
      );
    }
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
    console.error("Error fetching user details:", error.message);
    next(error);
  }
};
