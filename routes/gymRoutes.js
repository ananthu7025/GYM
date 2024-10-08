// routes/gym.js
const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gymController');
const { verifyToken } = require('../middleware/authMiddleware'); // Import the verifyToken middleware

// Create gym (protected route)
router.post('/create', verifyToken, gymController.createGym);

// Get all gyms (public or protected)
router.get('/', verifyToken, gymController.getGyms); // Apply middleware if needed

module.exports = router;
