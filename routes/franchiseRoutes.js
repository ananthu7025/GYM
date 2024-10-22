const express = require('express');
const router = express.Router();
const franchiseController = require('../controllers/franchiseController');
const { verifyToken } = require('../middleware/authMiddleware'); // Import the verifyToken middleware

// Create franchise (protected route)
router.post('/create', verifyToken, franchiseController.createFranchise);

// Get all franchises (protected route)
router.get('/', verifyToken, franchiseController.getFranchises);

// Get franchise by ID (protected route)
router.get('/:id', verifyToken, franchiseController.getFranchiseById);

// Update franchise by ID (protected route)
router.put('/:id', verifyToken, franchiseController.updateFranchise);

// Delete franchise by ID (protected route)
router.delete('/:id', verifyToken, franchiseController.deleteFranchise);
router.get("/duesubscriptions/:id", franchiseController.getFranchisesWithDueSubscriptions);
router.post("/payments", franchiseController.recordPayment);

module.exports = router;
