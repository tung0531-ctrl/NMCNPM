import express from 'express';
import { getActiveFeeTypes } from '../controllers/feeTypeController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all active fee types (protected route)
router.get('/', protectedRoute, getActiveFeeTypes);

export default router;
