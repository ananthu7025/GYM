const { generateRandomPassword } = require("../helper/helper");
const Member = require("../models/Member");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { sendEmail } = require("../services/mailer");

// Create a new member
exports.createMember = async (req, res, next) => {
  const {
    name,
    gender,
    dateOfBirth,
    displayImage,
    address,
    city,
    state,
    zipCode,
    phone,
    email,
    emergencyContactName,
    emergencyContactPhone,
    weight,
    height,
    fat,
    arms,
    thigh,
    waist,
    chest,
    membershipId,
    firstPaymentDate,
    gymId,
  } = req.body;

  const randomPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(randomPassword, 10);
  
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role: 5, // Assuming role 5 is for members
    gym: gymId,
  });

  try {
    const savedUser = await newUser.save();
    const newMember = new Member({
      name,
      gender,
      dateOfBirth,
      displayImage,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      emergencyContactName,
      emergencyContactPhone,
      weight,
      height,
      fat,
      arms,
      thigh,
      waist,
      chest,
      membershipId,
      firstPaymentDate,
      gym: gymId,
      user: savedUser._id,
    });
    const savedMember = await newMember.save();

    res.status(201).json({
      message: "Member created successfully",
      member: savedMember,
      saveStatus: true,
    });

    const subject = "Welcome to the Gym!";
    const text = `Hi ${name},\n\nYour account has been created successfully. Your login details are as follows:\nEmail: ${email}\nPassword: ${randomPassword}\n\nThank you for joining!`;
    await sendEmail(email, subject, text);
  } catch (error) {
    next(error);
  }
};

// Get all members
exports.getMembers = async (req, res, next) => {
  try {
    const members = await Member.find().populate("gym");
    res.status(200).json(members);
  } catch (error) {
    next(error);
  }
};

// Get a member by ID
exports.getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id).populate("gym");
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.status(200).json(member);
  } catch (error) {
    next(error);
  }
};

// Update a member
exports.updateMember = async (req, res, next) => {
  const {
    name,
    gender,
    dateOfBirth,
    displayImage,
    address,
    city,
    state,
    zipCode,
    phone,
    email,
    emergencyContactName,
    emergencyContactPhone,
    weight,
    height,
    fat,
    arms,
    thigh,
    waist,
    chest,
    membershipId,
    firstPaymentDate,
    gymId,
  } = req.body;

  try {
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      {
        name,
        gender,
        dateOfBirth,
        displayImage,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
        emergencyContactName,
        emergencyContactPhone,
        weight,
        height,
        fat,
        arms,
        thigh,
        waist,
        chest,
        membershipId,
        firstPaymentDate,
        gym: gymId,
      },
      { new: true }
    );

    if (!updatedMember) return res.status(404).json({ message: "Member not found" });

    res.status(200).json({
      message: "Member updated successfully",
      member: updatedMember,
      saveStatus: true,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a member
exports.deleteMember = async (req, res, next) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    if (!deletedMember) return res.status(404).json({ message: "Member not found" });
    res.status(200).json({ message: "Member deleted successfully", saveStatus: true });
  } catch (error) {
    next(error);
  }
};
