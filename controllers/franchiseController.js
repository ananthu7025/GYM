const { FrSubStatus, FrSubscriptionDuration } = require("../enums/commonEnum");
const Franchise = require("../models/Franchise");
const User = require("../models/User");
const { sendEmail } = require("../services/mailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const FranchisePayment = require("../models/FranchisePayment");

exports.createFranchise = async (req, res, next) => {
  const {
    name,
    address,
    city,
    state,
    zipCode,
    country,
    phone,
    email,
    website,
    establishedYear,
    description,
    logo,
    franchiseAdminData,
    subscriptionAmount,
    subscriptionDuration,
    lastPaymentDate,
  } = req.body;

  if (
    !name ||
    !franchiseAdminData ||
    !franchiseAdminData.email ||
    !franchiseAdminData.password ||
    !subscriptionAmount ||
    !subscriptionDuration
  ) {
    return res.status(400).json({
      message:
        "Name, franchise admin email, password, subscription amount, and duration are required.",
    });
  }

  const hashedPassword = await bcrypt.hash(franchiseAdminData.password, 10);
  const franchiseAdmin = new User({
    name: franchiseAdminData.name,
    email: franchiseAdminData.email,
    password: hashedPassword,
    role: 2,
  });

  // Calculate next payment date based on the duration
  const nextPaymentDate = calculateNextPaymentDate(subscriptionDuration);

  try {
    await franchiseAdmin.save();
    const newFranchise = new Franchise({
      name,
      address,
      city,
      state,
      zipCode,
      country,
      phone,
      email,
      website,
      establishedYear,
      description,
      logo,
      franchiseAdmin: franchiseAdmin._id,
      subscriptionAmount,
      subscriptionDuration,
      nextPaymentDate,
      subscriptionStatus: FrSubStatus.ACTIVE,
      lastPaymentDate: Date.now(),
    });

    await newFranchise.save();
    await updateFranchiseSubscriptionStatus(newFranchise);
    const subject = "Franchise Admin Account Created";
    const text = `Hi ${
      franchiseAdminData.name
    },\n\nYour franchise admin account has been created successfully. Your login details are as follows:\nEmail: ${
      franchiseAdminData.email
    }\nPassword: ${
      franchiseAdminData.password
    }\n\nSubscription Amount: ${subscriptionAmount}\nDuration: ${subscriptionDuration}\nNext Payment Due: ${nextPaymentDate.toDateString()}\n\nThank you for joining!`;

    await sendEmail(franchiseAdminData.email, subject, text);

    res.status(201).json({
      message: "Franchise and Franchise Admin created successfully",
      franchise: newFranchise,
      saveStatus: true,
    });
  } catch (error) {
    next(error);
  }
};
async function updateFranchiseSubscriptionStatus(franchise) {
  const now = new Date();
  if (franchise.nextPaymentDate < now) {
    franchise.subscriptionStatus = FrSubStatus.DUE; // Update status to DUE
    await franchise.save();
  }
}
// Helper function to calculate next payment date based on duration
function calculateNextPaymentDate(duration) {
  const now = new Date();
  switch (duration) {
    case FrSubscriptionDuration.MONTHLY:
      return new Date(now.setMonth(now.getMonth() + 1));
    case FrSubscriptionDuration.THREE_MONTHS:
      return new Date(now.setMonth(now.getMonth() + 3));
    case FrSubscriptionDuration.SIX_MONTHS:
      return new Date(now.setMonth(now.getMonth() + 6));
    case FrSubscriptionDuration.TWELVE_MONTHS:
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      return now;
  }
}

// Get all franchises
exports.getFranchises = async (req, res, next) => {
  try {
    // Fetch all franchises
    const franchises = await Franchise.find().populate("franchiseAdmin");
    // Current date for comparison
    const now = new Date();

    // Update status of franchises with unpaid subscriptions
    const updatePromises = franchises.map(async (franchise) => {
      if (
        franchise.nextPaymentDate < now &&
        franchise.subscriptionStatus === FrSubStatus.ACTIVE
      ) {
        // Update the subscription status to DUE
        franchise.subscriptionStatus = FrSubStatus.DUE;
        await franchise.save(); // Save the updated franchise
      }
    });

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    // Return the updated list of franchises
    res.status(200).json(franchises);
  } catch (error) {
    console.log("Querying franchises with parameters:")

    next(error);
  }
};

// Get franchise by ID
exports.getFranchiseById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const franchise = await Franchise.findById(id).populate("franchiseAdmin");
    if (!franchise) {
      return res.status(404).json({ message: "Franchise not found." });
    }
    res.status(200).json(franchise);
  } catch (error) {
    next(error);
  }
};

// Update franchise by ID
exports.updateFranchise = async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedFranchise = await Franchise.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedFranchise) {
      return res.status(404).json({ message: "Franchise not found." });
    }
    res.status(200).json({
      message: "Franchise updated successfully",
      franchise: updatedFranchise,
      saveStatus: true,
    });
  } catch (error) {
    next(error);
  }
};

// Delete franchise by ID
exports.deleteFranchise = async (req, res, next) => {
  const { id } = req.params;

  try {
    const deletedFranchise = await Franchise.findByIdAndDelete(id);
    if (!deletedFranchise) {
      return res.status(404).json({ message: "Franchise not found." });
    }
    res.status(200).json({ message: "Franchise deleted successfully" });
  } catch (error) {
    next(error);
  }
};
// Get franchises with due subscriptions
exports.getFranchisesWithDueSubscriptions = async (req, res, next) => {
  const now = new Date(); // Current date
  console.log(now);
  try {
    // Fetch all franchises
    const franchises = await Franchise.find().populate("franchiseAdmin");

    // Filter franchises with due subscriptions
    const dueFranchises = franchises.filter(franchise => 
      franchise.nextPaymentDate < now && 
      franchise.subscriptionStatus === FrSubStatus.ACTIVE
    );

    res.status(200).json(dueFranchises);
  } catch (error) {
    console.error("Error fetching due franchises:", error);
    next(error);
  }
};



// In the franchisePaymentsController.js

exports.recordPayment = async (req, res, next) => {
  const { franchiseId, amount } = req.body;

  if (!franchiseId || !amount) {
    return res
      .status(400)
      .json({ message: "Franchise ID and amount are required." });
  }

  try {
    const payment = new FranchisePayment({
      franchise: franchiseId,
      amount,
    });

    await payment.save();

    // Update the franchise status
    const franchise = await Franchise.findById(franchiseId);
    franchise.lastPaymentDate = new Date();
    franchise.nextPaymentDate = calculateNextPaymentDate(
      franchise.subscriptionDuration
    );
    franchise.subscriptionStatus = FrSubStatus.ACTIVE; // Reset status to ACTIVE
    await franchise.save();

    res.status(201).json({ message: "Payment recorded successfully", payment });
  } catch (error) {
    next(error);
  }
};
