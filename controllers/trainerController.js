const { generateRandomPassword } = require("../helper/helper");
const Trainer = require("../models/Trainer");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { sendEmail } = require("../services/mailer");
const Roles = require("../enums/rolesEnum");
const Gym = require("../models/Gym");
const Franchise = require("../models/Franchise");
const jwt = require("jsonwebtoken");

// Create a new trainer
exports.createTrainer = async (req, res, next) => {
  const { name, email, phone, gymId, qualifications, specialization, experience, availability, salary,img } = req.body;
  const randomPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(randomPassword, 10);
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role: 4, // Assuming '2' is the role for trainer
    gym: gymId,
  });

  try {
    const savedUser = await newUser.save();
    const newTrainer = new Trainer({
      name,
      email,
      phone,
      gym: gymId,
      user: savedUser._id,
      qualifications,
      specialization,
      experience,
      availability,
      salary,
      img
    });
    const savedTrainer = await newTrainer.save();

    res.status(201).json({
      message: "Trainer created successfully",
      trainer: savedTrainer,
      saveStatus: true,
    });

    const subject = "Trainer Account Created";
    const text = `Hi ${name},\n\nYour trainer account has been created successfully. Your login details are as follows:\nEmail: ${email}\nPassword: ${randomPassword}\n\nThank you for joining the team!`;
    await sendEmail(email, subject, text);
  } catch (error) {
    next(error);
  }
};

// Get all trainers
exports.getTrainers = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const UserId = decodedToken.id;
    const userRole = decodedToken.role;
    if (userRole === Roles.GYM_ADMIN) {
      // Assuming the gymAdmin is associated with a specific gym
      const gym = await Gym.findOne({ gymAdmin: UserId });
      if (!gym) {
        return res
          .status(404)
          .json({ message: "Gym not found for this admin" });
      }

      // Find all members linked to this gym
      const tariners = await Trainer.find({ gym: gym._id });

      res.status(200).json({
        tariners,
        totalTrainers: tariners.length,
      });
    } else if (userRole === Roles.FRANCHISE_ADMIN) {
      // Find all gyms linked to this franchise admin
      const franchise = await Franchise.findOne({ franchiseAdmin: UserId });
      if (!franchise) {
        return res
          .status(404)
          .json({ message: "Franchise not found for this admin" });
      }

      // Get all gyms under this franchise
      const gyms = await Gym.find({ franchise: franchise._id });
      const gymIds = gyms.map((gym) => gym._id);

      // Find all members linked to the gyms under this franchise
      const trainers = await Trainer.find({ gym: { $in: gymIds } });

      return res.status(200).json({
        trainers,
        totalTrainers: trainers.length,
      });
    } else {
      const trainers = await Trainer.find().populate("gym");
      return res.status(200).json({
        trainers,
        totalTrainers: trainers.length,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Get a trainer by ID
exports.getTrainerById = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id).populate("gym").populate("user");
    if (!trainer) return res.status(404).json({ message: "Trainer not found" });
    res.status(200).json(trainer);
  } catch (error) {
    next(error);
  }
};

// Update a trainer
exports.updateTrainer = async (req, res, next) => {
  const { name, email, phone, gymId, qualifications, specialization, experience, availability, salary } = req.body;

  try {
    const updatedTrainer = await Trainer.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, gym: gymId, qualifications, specialization, experience, availability, salary },
      { new: true }
    );
    if (!updatedTrainer)
      return res.status(404).json({ message: "Trainer not found" });

    res.status(200).json({
      message: "Trainer updated successfully",
      trainer: updatedTrainer,
      saveStatus: true,

    });
  } catch (error) {
    next(error);
  }
};

// Delete a trainer
exports.deleteTrainer = async (req, res, next) => {
  try {
    const deletedTrainer = await Trainer.findByIdAndDelete(req.params.id);
    if (!deletedTrainer)
      return res.status(404).json({ message: "Trainer not found" });
    res.status(200).json({ message: "Trainer deleted successfully",
      saveStatus: true,

     });
  } catch (error) {
    next(error);
  }
};
// Check-In/Check-Out API
exports.checkInCheckOut = async (req, res, next) => {
  const { tarinerId, gymId } = req.body;

  try {
    // Get the current date, set time to 00:00:00 to find all logs for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Check if the member has logged today
    const todayLogs = await Log.find({
      member: tarinerId,
      gym: gymId,
      logTime: { $gte: startOfDay },
    }).sort({ logTime: 1 }); // Sort logs by time (ascending)

    let logType;

    if (todayLogs.length === 0) {
      // First log of the day is a check-in
      logType = "CheckIn";
    } else {
      // Determine the type based on the last log
      const lastLog = todayLogs[todayLogs.length - 1]; // Get the last log

      // If the last log is a check-in, the new log should be a check-out, and vice versa
      logType = lastLog.type === "CheckIn" ? "CheckOut" : "CheckIn";
    }

    // Create the new log
    const newLog = new Log({
      member: tarinerId,
      gym: gymId,
      type: logType,
      logTime: new Date(), // Record the current time
    });

    await newLog.save();

    res.status(201).json({
      message: `${logType} successful`,
      log: newLog,
      saveStatus: true,
    });
  } catch (error) {
    next(error);
  }
};

// Fetch logged times and calculate total log time
exports.getLoggedTime = async (req, res, next) => {
  const { tarinerId, gymId, date } = req.params; // Accept date as a parameter

  try {
    // Parse date and set start and end of the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch logs for the specified day
    const logs = await Log.find({
      member: tarinerId,
      gym: gymId,
      logTime: { $gte: startOfDay, $lt: endOfDay },
    }).sort({ logTime: 1 });

    // Calculate total log time based on first check-in and current time
    let totalLogTime = 0;

    if (logs.length > 0) {
      // Get the first check-in time
      const firstCheckIn = logs[0].logTime; // First log (check-in)

      // Get the current time
      const currentTime = new Date();

      // Calculate total log time from first check-in to current time
      totalLogTime = currentTime - firstCheckIn; // Total time in milliseconds
    }

    // Convert total log time from milliseconds to hours and minutes
    const totalHours = Math.floor(totalLogTime / (1000 * 60 * 60)); // Total hours
    const totalMinutes = Math.floor(
      (totalLogTime % (1000 * 60 * 60)) / (1000 * 60)
    ); // Remaining minutes

    res.status(200).json({
      logs,
      totalLogTime: {
        hours: totalHours,
        minutes: totalMinutes,
      },
    });
  } catch (error) {
    next(error);
  }
};