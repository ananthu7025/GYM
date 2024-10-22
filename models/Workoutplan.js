const mongoose = require("mongoose");

// Define a schema for individual workouts
const WorkoutSchema = new mongoose.Schema({
  workoutName: {
    type: String,
    required: true,
  },
  sets: {
    type: Number, // Number of sets
    required: true,
  },
  reps: {
    type: Number, // Number of reps
    required: true,
  },
  kg: {
    type: Number, // Weight in kilograms
  },
  restTime: {
    type: String, // Rest time between sets
  },
});

// Define a schema for the workout plan per day
const DailyWorkoutSchema = new mongoose.Schema({
  day: {
    type: String, // Example: "Monday", "Tuesday", etc.
    required: true,
  },
  workouts: {
    type: [WorkoutSchema], // Array of workouts for the day
    required: true,
  },
});

// Define a schema for the entire weekly workout plan with a dynamic category field
const WeeklyWorkoutPlanSchema = new mongoose.Schema({
  workoutTemplateName: {
    type: String,
    required: true,
  },
  weeklyPlan: {
    type: [DailyWorkoutSchema], // Array of daily workouts
    required: true,
  },
  category: {
    type: String, // Category like "Weight Loss", "Strength Training", etc.
    required: true,
  },
  gym: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gym", // Reference to the Gym model
    required: true, // Ensure that a gym is associated with the workout plan
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const WeeklyWorkoutPlan = mongoose.model("WeeklyWorkoutPlan", WeeklyWorkoutPlanSchema);

module.exports = WeeklyWorkoutPlan;
