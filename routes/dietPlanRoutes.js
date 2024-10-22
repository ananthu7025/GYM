const express = require('express');
const router = express.Router();
const dietPlanController = require('../controllers/dietPlanController');

// Route to create a new diet plan
router.post('/dietplans', dietPlanController.createDietPlan);

// Route to get all diet plans
router.get('/dietplans', dietPlanController.getDietPlans);

// Route to get a single diet plan by ID
router.get('/dietplans/:id', dietPlanController.getDietPlanById);

// Route to update a diet plan by ID
router.put('/dietplans/:id', dietPlanController.updateDietPlan);

// Route to delete a diet plan by ID
router.delete('/dietplans/:id', dietPlanController.deleteDietPlan);
router.post('/assign-diet-plan', dietPlanController.assignDietPlanToMember);
module.exports = router;
