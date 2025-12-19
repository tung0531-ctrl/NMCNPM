import express from 'express';
import { getAllHouseholds } from '../controllers/householdController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all households (protected route)
router.get('/', protectedRoute, getAllHouseholds);

export default router;
