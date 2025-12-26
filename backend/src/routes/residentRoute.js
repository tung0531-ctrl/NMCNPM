import express from 'express';
import {
    getResidentsForCurrentHousehold,
    getAllResidentsForAdmin,
    getResidentById,
    createResident,
    updateResident,
    deleteResident
} from '../controllers/residentController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/adminMiddleware.js';
import { residentOnly } from '../middlewares/residentMiddleware.js';

const router = express.Router();

// Resident self-scope
router.get('/my', residentOnly, getResidentsForCurrentHousehold);

// Admin-only routes
router.get('/', adminOnly, getAllResidentsForAdmin);

// Get resident by ID
router.get('/:id', adminOnly, getResidentById);

// Create resident
router.post('/', adminOnly, createResident);

// Update resident
router.put('/:id', adminOnly, updateResident);

// Delete resident
router.delete('/:id', adminOnly, deleteResident);

export default router;