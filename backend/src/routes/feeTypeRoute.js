import express from 'express';
import { getAllFeeTypes, getActiveFeeTypes, createFeeType, updateFeeType, deleteFeeType } from '../controllers/feeTypeController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Get active fee types (for dropdown selection)
router.get('/active', protectedRoute, getActiveFeeTypes);

// Get all fee types with filtering (for management page)
router.get('/', protectedRoute, getAllFeeTypes);

// Create new fee type (admin only)
router.post('/', protectedRoute, adminOnly, createFeeType);

// Update fee type (admin only)
router.put('/:id', protectedRoute, adminOnly, updateFeeType);

// Delete fee type (admin only)
router.delete('/:id', protectedRoute, adminOnly, deleteFeeType);

export default router;
