// routes/trainer.js
const express = require('express');
const router = express.Router();
const trainerController = require('../controllers/trainerController');
const { verifyToken } = require('../middleware/authMiddleware'); // Import the verifyToken middleware

// Create trainer (protected route)
router.post('/create', verifyToken, trainerController.createTrainer);

// Get all trainers (protected route)
router.get('/', verifyToken, trainerController.getTrainers);

// Get trainer by ID (protected route)
router.get('/:id', verifyToken, trainerController.getTrainerById);

// Update trainer (protected route)
router.put('/:id', verifyToken, trainerController.updateTrainer);

// Delete trainer (protected route)
router.delete('/:id', verifyToken, trainerController.deleteTrainer);
router.post("/checkincheckout", trainerController.checkInCheckOut);
router.get("/loggedtime/:memberId/:gymId/:date", trainerController.getLoggedTime);
module.exports = router;
