import express from 'express';
import * as statisticsController from '../controllers/statisticsController.js';
import { protectedRoute } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Tất cả các route đều yêu cầu xác thực
router.use(protectedRoute);

// Thống kê tổng quan
router.get('/overall', statisticsController.getOverallStatistics);

// Thống kê theo loại phí
router.get('/by-fee-type', statisticsController.getStatisticsByFeeType);

// Thống kê theo hộ gia đình
router.get('/by-household', statisticsController.getStatisticsByHousehold);

// Thống kê theo người thu
router.get('/by-collector', statisticsController.getStatisticsByCollector);

// Thống kê theo trạng thái thanh toán
router.get('/by-payment-status', statisticsController.getStatisticsByPaymentStatus);

// Thống kê theo kỳ thu
router.get('/by-period', statisticsController.getStatisticsByPeriod);

export default router;
