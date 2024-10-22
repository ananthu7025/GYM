const Gym = require("../models/Gym");
const User = require("../models/User");
const { sendEmail } = require("../services/mailer");
const { GymStatus } = require("../enums/commonEnum");
const Franchise = require("../models/Franchise");
const Roles = require("../enums/rolesEnum");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

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
    phone,
    website,
    email,
    logo,
  } = req.body;
  const hashedPassword = await bcrypt.hash(gymAdminData.password, 10);
  const gymAdmin = new User({
    name: gymAdminData.name,
    email: gymAdminData.email,
    password: hashedPassword,
    role: 3,
  });
  try {
    await gymAdmin.save();
    let gymName = name;
    let gymLogo = logo;
    let gymWebsite = website;
    if (franchiseId) {
      const franchise = await Franchise.findById(franchiseId).select(
        "name logo website"
      );
      if (franchise) {
        gymName = franchise.name;
        gymLogo = franchise.logo;
        gymWebsite = franchise.website;
      }
    }
    const newGym = new Gym({
      name: gymName,
      gymAdmin: gymAdmin._id,
      franchise: franchiseId || null,
      openingHours,
      closingHours,
      phone,
      address,
      city,
      state,
      zipCode,
      country,
      website: gymWebsite || website,
      email,
      logo: gymLogo || logo,
      status: GymStatus.ACTIVE,
    });
    await newGym.save();
    res.status(201).json({
      message: "Gym and Gym Admin created successfully",
      gym: newGym,
      saveStatus: true,
    });
    const subject = "Gym Admin Account Created";
    const text = `Hi ${gymAdminData.name},\n\nYour gym admin account has been created successfully. Your login details are as follows:\nEmail: ${gymAdminData.email}\nPassword: ${gymAdminData.password}\n\nThank you for joining!`;
    await sendEmail(gymAdminData.email, subject, text);
  } catch (error) {
    next(error);
  }
};

exports.getGyms = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const userRole = decodedToken.role;
    const userId = decodedToken.id;
    let gyms;
    if (userRole === Roles.FRANCHISE_ADMIN) {
      const franchise = await Franchise.findOne({ franchiseAdmin: userId });
      if (!franchise) {
        return res.status(404).json({ message: "Franchise not found." });
      }
      gyms = await Gym.find({ franchise: franchise._id })
        .populate("gymAdmin")
        .populate("franchise")
        .populate("membershipPlans");
    } else {
      gyms = await Gym.find()
        .populate("gymAdmin")
        .populate("franchise")
        .populate("membershipPlans");
    }

    res.status(200).json(gyms);
  } catch (error) {
    next(error);
  }
};

// Get gym by ID
exports.getGymById = async (req, res, next) => {
  const { gymId } = req.params;

  try {
    const gym = await Gym.findById(gymId)
      .populate("gymAdmin")
      .populate("franchise")
      .populate("membershipPlans");

    if (!gym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    res.status(200).json(gym);
  } catch (error) {
    next(error);
  }
};

// Update gym
exports.updateGym = async (req, res, next) => {
  const { gymId } = req.params;
  const updateData = req.body;

  try {
    const updatedGym = await Gym.findByIdAndUpdate(gymId, updateData, {
      new: true,
    })
      .populate("gymAdmin")
      .populate("franchise")
      .populate("membershipPlans");

    if (!updatedGym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    res.status(200).json({
      message: "Gym updated successfully",
      gym: updatedGym,
      saveStatus: true,
    });
  } catch (error) {
    next(error);
  }
};

// Delete gym
exports.deleteGym = async (req, res, next) => {
  const { gymId } = req.params;

  try {
    const deletedGym = await Gym.findByIdAndDelete(gymId);

    if (!deletedGym) {
      return res.status(404).json({ message: "Gym not found" });
    }

    res
      .status(200)
      .json({ message: "Gym deleted successfully", saveStatus: true });
  } catch (error) {
    next(error);
  }
};
