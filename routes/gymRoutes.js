const express = require('express');
const router = express.Router();
const gymController = require('../controllers/gymController');
const { verifyToken } = require('../middleware/authMiddleware');

// Create gym (protected route)
router.post('/create', verifyToken, gymController.createGym);

// Get all gyms (protected)
router.get('/', verifyToken, gymController.getGyms);

// Get gym by ID (protected)
router.get('/:gymId', verifyToken, gymController.getGymById);

// Update gym by ID (protected)
router.put('/:gymId', verifyToken, gymController.updateGym);

// Delete gym by ID (protected)
router.delete('/:gymId', verifyToken, gymController.deleteGym);

module.exports = router;
