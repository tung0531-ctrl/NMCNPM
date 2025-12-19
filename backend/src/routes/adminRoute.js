import express from 'express';
import { getAllAdmins } from '../controllers/adminController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all admin users (protected route)
router.get('/', protectedRoute, getAllAdmins);

export default router;
