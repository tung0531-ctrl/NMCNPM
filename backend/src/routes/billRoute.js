import express from 'express';
import { getAllBills } from '../controllers/billController.js';

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Bill route is working!' });
});

// Route to get all bills
router.get('/', getAllBills);

export default router;