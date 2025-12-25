import express from 'express';
import {
    getAllResidentsForAdmin,
    getResidentById,
    createResident,
    updateResident,
    deleteResident
} from '../controllers/residentController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Apply adminOnly middleware to all routes (protectedRoute is applied at server level)
router.use(adminOnly);

// Get all residents with filtering
router.get('/', getAllResidentsForAdmin);

// Get resident by ID
router.get('/:id', getResidentById);

// Create resident
router.post('/', createResident);

// Update resident
router.put('/:id', updateResident);

// Delete resident
router.delete('/:id', deleteResident);

export default router;