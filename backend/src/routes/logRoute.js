import express from "express";
import { getLogs, getLogStats } from "../controllers/logController.js";
import { adminOnly } from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Admin only routes for logs
router.get('/', adminOnly, getLogs);
router.get('/stats', adminOnly, getLogStats);

export default router;
