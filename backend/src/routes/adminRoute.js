import express from 'express';
import { getAllAdmins, getAllHouseholdsForAdmin, createHouseholdForAdmin } from '../controllers/adminController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Get all admin users (protected route)
router.get('/', protectedRoute, getAllAdmins);

// Get all households with filtering (admin only)
router.get('/households', protectedRoute, adminOnly, getAllHouseholdsForAdmin);

// Create new household (admin only)
router.post('/households', protectedRoute, adminOnly, createHouseholdForAdmin);

export default router;
