import express from 'express';
import { getAllHouseholds, getAllHouseholdsForAdmin, createHouseholdForAdmin, updateHouseholdForAdmin, deleteHouseholdForAdmin } from '../controllers/householdController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Get all households (for user dropdown)
router.get('/', protectedRoute, getAllHouseholds);

// Get all households with filtering (admin)
router.get('/admin', protectedRoute, adminOnly, getAllHouseholdsForAdmin);

// Create new household
router.post('/admin', protectedRoute, adminOnly, createHouseholdForAdmin);

// Update household
router.put('/admin/:householdId', protectedRoute, adminOnly, updateHouseholdForAdmin);

// Delete household
router.delete('/admin/:householdId', protectedRoute, adminOnly, deleteHouseholdForAdmin);

export default router;
