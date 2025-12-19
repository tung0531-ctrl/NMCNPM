import express from 'express';
import { getAllBills, updateBill, deleteBill } from '../controllers/billController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// Apply authentication and admin check to all bill routes
router.use(protectedRoute);
router.use(adminOnly);

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Bill route is working!' });
});

// Route to get all bills
router.get('/', getAllBills);

// Route to update a bill
router.put('/:id', updateBill);

// Route to delete a bill
router.delete('/:id', deleteBill);

export default router;