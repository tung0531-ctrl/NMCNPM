import express from 'express';
import { getAllBills, getBillsForResident, createBill, updateBill, deleteBill } from '../controllers/billController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/adminMiddleware.js';
import { residentOnly } from '../middlewares/residentMiddleware.js';

const router = express.Router();

// Apply authentication to all bill routes
router.use(protectedRoute);

// Resident scope
router.get('/my', residentOnly, getBillsForResident);

// Admin scope
router.get('/', adminOnly, getAllBills);
router.post('/', adminOnly, createBill);
router.put('/:id', adminOnly, updateBill);
router.delete('/:id', adminOnly, deleteBill);

export default router;