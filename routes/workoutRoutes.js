const express = require("express");
const router = express.Router();
const workoutController = require("../controllers/workoutController"); // Ensure this path is correct

// Route to create a new workout plan
router.post("/create", workoutController.createWeeklyWorkoutPlan);

// Route to get all workout plans
router.get("/", workoutController.getWeeklyWorkoutPlans);
router.get("/:id", workoutController.getWeeklyWorkoutPlanById);

// Route to delete a workout plan by ID
router.delete("/:id", workoutController.deleteWeeklyWorkoutPlan);

// Route to update a workout plan by ID
router.put("/:id", workoutController.updateWeeklyWorkoutPlan);

router.post("/assign-plan", workoutController.assignWorkoutPlanToMember);
module.exports = router;
