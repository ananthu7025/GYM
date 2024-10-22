// routes/membershipRoutes.js
const express = require('express');
const router = express.Router();
const membershipController = require('../controllers/membershipController');

// Create a new membership
router.post('/', membershipController.createMembership);

// Get all memberships
router.get('/', membershipController.getMemberships);

// Get a membership by ID
router.get('/:id', membershipController.getMembershipById);

// Update a membership
router.put('/:id', membershipController.updateMembership);

// Delete a membership
router.delete('/:id', membershipController.deleteMembership);
router.post('/bulk-import', membershipController.bulkImportMemberships);

module.exports = router;
