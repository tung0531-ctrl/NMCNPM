import express from 'express';
import { getAllHouseholds, getAllHouseholdsForAdmin, createHouseholdForAdmin, updateHouseholdForAdmin, deleteHouseholdForAdmin } from '../controllers/householdController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Get all households (for user dropdown) - no additional middleware needed since protectedRoute is applied at server level
router.get('/', getAllHouseholds);

// Get all households with filtering (admin) - only need adminOnly since protectedRoute is applied at server level
router.get('/admin', adminOnly, getAllHouseholdsForAdmin);

// Create new household - only need adminOnly since protectedRoute is applied at server level
router.post('/admin', adminOnly, createHouseholdForAdmin);

// Update household - only need adminOnly since protectedRoute is applied at server level
router.put('/admin/:householdId', adminOnly, updateHouseholdForAdmin);

// Delete household - only need adminOnly since protectedRoute is applied at server level
router.delete('/admin/:householdId', adminOnly, deleteHouseholdForAdmin);

export default router;
