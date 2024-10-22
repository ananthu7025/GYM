const { generateRandomPassword } = require("../helper/helper");
const Member = require("../models/Member");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { sendEmail } = require("../services/mailer");
const jwt = require("jsonwebtoken");
const Gym = require("../models/Gym");
const Roles = require("../enums/rolesEnum");
const Franchise = require("../models/Franchise");
const Log = require("../models/Logs");
const Membership = require("../models/Membership");
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
    memberId,
  } = req.body;

  const randomPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  // Create user account
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role: 5, // Assuming role 5 is for members
    gym: gymId,
  });

  try {
    // Save user in the database
    const savedUser = await newUser.save();

    // Fetch the membership details
    const membership = await Membership.findById(membershipId);

    if (!membership) {
      return res.status(400).json({ message: "Invalid membership ID" });
    }

    // Calculate the next payment date based on the membership period
    const membershipPeriodMonths = parseInt(membership.period); // Membership period in months
    const firstPayment = new Date(firstPaymentDate); // Convert firstPaymentDate to a Date object

    // Calculate the next payment date by adding membership period (in months) to the first payment date
    const nextPaymentDate = new Date(firstPayment);
    nextPaymentDate.setMonth(
      nextPaymentDate.getMonth() + membershipPeriodMonths
    );

    // Create new member record
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
      memberId,
      firstPaymentDate,
      nextPaymentDate, // Add calculated nextPaymentDate
      gym: gymId,
      user: savedUser._id,
    });

    // Save the member in the database
    const savedMember = await newMember.save();

    res.status(201).json({
      message: "Member created successfully",
      member: savedMember,
      saveStatus: true,
    });

    // Send a welcome email to the user
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
      const members = await Member.find({ gym: gym._id });

      res.status(200).json({
        members,
        totalMembers: members.length,
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
      const members = await Member.find({ gym: { $in: gymIds } });

      return res.status(200).json({
        members,
        totalMembers: members.length,
      });
    } else {
      const members = await Member.find().populate("gym");
      return res.status(200).json({
        members,
        totalMembers: members.length,
      });
    }
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
    memberId,
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
        memberId,
      },
      { new: true }
    );

    if (!updatedMember)
      return res.status(404).json({ message: "Member not found" });

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
    if (!deletedMember)
      return res.status(404).json({ message: "Member not found" });
    res
      .status(200)
      .json({ message: "Member deleted successfully", saveStatus: true });
  } catch (error) {
    next(error);
  }
};
// Check-In/Check-Out API
exports.checkInCheckOut = async (req, res, next) => {
  const { memberId, gymId } = req.body;
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const todayLogs = await Log.find({
      member: memberId,
      gym: gymId,
      logTime: { $gte: startOfDay },
    }).sort({ logTime: 1 });
    let logType;
    if (todayLogs.length === 0) {
      logType = "CheckIn";
    } else {
      const lastLog = todayLogs[todayLogs.length - 1]; // Get the last log
      logType = lastLog.type === "CheckIn" ? "CheckOut" : "CheckIn";
    }
    const newLog = new Log({
      member: memberId,
      gym: gymId,
      type: logType,
      logTime: new Date(),
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
  const { memberId, gymId, date } = req.params;
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    const logs = await Log.find({
      member: memberId,
      gym: gymId,
      logTime: { $gte: startOfDay, $lt: endOfDay },
    }).sort({ logTime: 1 });
    let totalLogTime = 0;
    if (logs.length > 0) {
      const firstCheckIn = logs[0].logTime;
      const currentTime = new Date();
      totalLogTime = currentTime - firstCheckIn; // Total time in milliseconds
    }
    const totalHours = Math.floor(totalLogTime / (1000 * 60 * 60)); // Total hours
    const totalMinutes = Math.floor(
      (totalLogTime % (1000 * 60 * 60)) / (1000 * 60)
    );
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
exports.getMembersWithDuePayments = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const membersWithDuePayments = await Member.find({
      isPaymentDue: true,
      nextPaymentDate: { $lte: currentDate },
    })
      .populate("membershipId")
      .select("name nextPaymentDate membershipId");
    if (!membersWithDuePayments.length) {
      return res
        .status(200)
        .json({ message: "No members with due payments found." });
    }
    res.status(200).json({
      message: "Members with due payments retrieved successfully.",
      members: membersWithDuePayments,
    });
  } catch (error) {
    console.error("Error retrieving members with due payments:", error);
    next(error);
  }
};

// API to mark payment and optionally change membership
exports.markPayment = async (req, res, next) => {
  const { memberId, paymentDate, newMembershipId } = req.body;
  try {
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }
    let updatedMembership = null;
    if (newMembershipId && newMembershipId !== member.membershipId) {
      const newMembership = await Membership.findById(newMembershipId);
      if (!newMembership) {
        return res.status(400).json({ message: "Invalid new membership ID" });
      }
      member.membershipId = newMembershipId;
      const newMembershipPeriodMonths = parseInt(newMembership.period);
      const paymentDateObj = new Date(paymentDate);
      const nextPaymentDate = new Date(paymentDateObj);
      nextPaymentDate.setMonth(
        nextPaymentDate.getMonth() + newMembershipPeriodMonths
      );
      member.nextPaymentDate = nextPaymentDate;
      member.isPaymentDue = false; // Mark as payment completed
      updatedMembership = newMembership;
    } else {
      const currentMembership = await Membership.findById(member.membershipId);
      if (!currentMembership) {
        return res
          .status(400)
          .json({ message: "Current membership not found" });
      }
      const currentMembershipPeriodMonths = parseInt(currentMembership.period);
      const paymentDateObj = new Date(paymentDate);
      const nextPaymentDate = new Date(paymentDateObj);
      nextPaymentDate.setMonth(
        nextPaymentDate.getMonth() + currentMembershipPeriodMonths
      );
      member.nextPaymentDate = nextPaymentDate;
      member.isPaymentDue = false; // Mark as payment completed
    }
    // Save the updated member data
    const updatedMember = await member.save();
    res.status(200).json({
      message: "Payment marked successfully",
      member: updatedMember,
      updatedMembership: updatedMembership
        ? updatedMembership
        : "No membership change",
    });
  } catch (error) {
    console.error("Error marking payment:", error); // Log error for debugging
    next(error);
  }
};
