// routes/member.js
const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');
const { verifyToken } = require('../middleware/authMiddleware'); // Import the verifyToken middleware

// Create member (protected route)
router.post('/create', verifyToken, memberController.createMember);

// Get all members (protected route)
router.get('/', verifyToken, memberController.getMembers);

// Get member by ID (protected route)
router.get('/:id', verifyToken, memberController.getMemberById);

// Update member (protected route)
router.put('/:id', verifyToken, memberController.updateMember);

// Delete member (protected route)
router.delete('/:id', verifyToken, memberController.deleteMember);

module.exports = router;
