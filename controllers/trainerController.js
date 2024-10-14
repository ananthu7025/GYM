const { generateRandomPassword } = require("../helper/helper");
const Trainer = require("../models/Trainer");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { sendEmail } = require("../services/mailer");

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
    const trainers = await Trainer.find().populate("gym").populate("user");
    res.status(200).json(trainers);
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
