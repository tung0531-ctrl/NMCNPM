import { Op } from 'sequelize';
import { sequelize } from '../libs/db.js';
import Bill from '../models/Bill.js';
import FeeType from '../models/FeeType.js';
import Household from '../models/Household.js';
import User from '../models/User.js';

// Thống kê theo loại phí
export const getStatisticsByFeeType = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        // Nếu không có startDate và endDate, tự động lấy 12 tháng gần nhất
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = now.toISOString();
            const twelveMonthsAgo = new Date(now);
            twelveMonthsAgo.setMonth(now.getMonth() - 12);
            startDate = twelveMonthsAgo.toISOString();
        }

        const whereCondition = {
            billingPeriod: {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            },
        };

        const statistics = await Bill.findAll({
            attributes: [
                'feeTypeId',
                [sequelize.fn('COUNT', sequelize.col('Bill.bill_id')), 'totalBills'],
                [sequelize.fn('SUM', sequelize.col('Bill.total_amount')), 'totalRevenue'],
                [sequelize.fn('SUM', sequelize.col('Bill.paid_amount')), 'totalPaid'],
            ],
            where: whereCondition,
            include: [
                {
                    model: FeeType,
                    attributes: ['feeTypeId', 'feeName'],
                },
            ],
            group: ['Bill.fee_type_id', 'FeeType.fee_type_id', 'FeeType.fee_name'],
            raw: false,
        });

        const formattedStats = statistics.map(stat => ({
            feeTypeId: stat.feeTypeId,
            feeTypeName: stat.FeeType?.feeName || 'Unknown',
            totalBills: parseInt(stat.dataValues.totalBills || 0),
            totalRevenue: parseFloat(stat.dataValues.totalRevenue || 0),
            totalPaid: parseFloat(stat.dataValues.totalPaid || 0),
            unpaidAmount: parseFloat((stat.dataValues.totalRevenue || 0) - (stat.dataValues.totalPaid || 0)),
        }));

        res.json({
            success: true,
            data: formattedStats,
        });
    } catch (error) {
        console.error('Error getting statistics by fee type:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics by fee type',
            error: error.message,
        });
    }
};

// Thống kê theo hộ gia đình 
export const getStatisticsByHousehold = async (req, res) => {
    try {
        let { startDate, endDate, limit = 10 } = req.query;

        // Nếu không có startDate và endDate, tự động lấy 12 tháng gần nhất
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = now.toISOString();
            const twelveMonthsAgo = new Date(now);
            twelveMonthsAgo.setMonth(now.getMonth() - 12);
            startDate = twelveMonthsAgo.toISOString();
        }

        const whereCondition = {
            billingPeriod: {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            },
        };

        const statistics = await Bill.findAll({
            attributes: [
                'householdId',
                [sequelize.fn('COUNT', sequelize.col('Bill.bill_id')), 'totalBills'],
                [sequelize.fn('SUM', sequelize.col('Bill.total_amount')), 'totalRevenue'],
                [sequelize.fn('SUM', sequelize.col('Bill.paid_amount')), 'totalPaid'],
            ],
            where: whereCondition,
            include: [
                {
                    model: Household,
                    as: 'household_bill',
                    attributes: [],
                },
            ],
            group: ['Bill.household_id'],
            order: [[sequelize.literal('totalRevenue'), 'DESC']],
            limit: parseInt(limit),
            subQuery: false,
            raw: true,
        });

        // Sau đó lấy thêm thông tin household riêng
        const householdIds = statistics.map(stat => stat.householdId);
        const households = await Household.findAll({
            where: { householdId: householdIds },
            attributes: ['householdId', 'ownerName'],
            raw: true,
        });
        
        const householdMap = {};
        households.forEach(h => {
            householdMap[h.householdId] = h.ownerName;
        });

        const formattedStats = statistics.map(stat => ({
            householdId: stat.householdId,
            householdName: householdMap[stat.householdId] || 'Unknown',
            totalBills: parseInt(stat.totalBills || 0),
            totalRevenue: parseFloat(stat.totalRevenue || 0),
            totalPaid: parseFloat(stat.totalPaid || 0),
            unpaidAmount: parseFloat((stat.totalRevenue || 0) - (stat.totalPaid || 0)),
        }));

        res.json({
            success: true,
            data: formattedStats,
        });
    } catch (error) {
        console.error('Error getting statistics by household:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics by household',
            error: error.message,
        });
    }
};

// Thống kê theo người thu
export const getStatisticsByCollector = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        // Nếu không có startDate và endDate, tự động lấy 12 tháng gần nhất
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = now.toISOString();
            const twelveMonthsAgo = new Date(now);
            twelveMonthsAgo.setMonth(now.getMonth() - 12);
            startDate = twelveMonthsAgo.toISOString();
        }

        const whereCondition = {
            collectorId: { [Op.not]: null },
            billingPeriod: {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            },
        };

        const statistics = await Bill.findAll({
            attributes: [
                'collectorId',
                [sequelize.fn('COUNT', sequelize.col('Bill.bill_id')), 'totalBills'],
                [sequelize.fn('SUM', sequelize.col('Bill.total_amount')), 'totalRevenue'],
                [sequelize.fn('SUM', sequelize.col('Bill.paid_amount')), 'totalPaid'],
            ],
            where: whereCondition,
            include: [
                {
                    model: User,
                    as: 'Collector',
                    attributes: ['userId', 'username', 'fullName'],
                },
            ],
            group: ['Bill.collector_id', 'Collector.user_id', 'Collector.username', 'Collector.full_name'],
            raw: false,
        });

        const formattedStats = statistics.map(stat => ({
            collectorId: stat.collectorId,
            collectorName: stat.Collector?.fullName || stat.Collector?.username || 'Unknown',
            totalBills: parseInt(stat.dataValues.totalBills || 0),
            totalRevenue: parseFloat(stat.dataValues.totalRevenue || 0),
            totalPaid: parseFloat(stat.dataValues.totalPaid || 0),
            unpaidAmount: parseFloat((stat.dataValues.totalRevenue || 0) - (stat.dataValues.totalPaid || 0)),
        }));

        res.json({
            success: true,
            data: formattedStats,
        });
    } catch (error) {
        console.error('Error getting statistics by collector:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics by collector',
            error: error.message,
        });
    }
};

// Thống kê theo trạng thái thanh toán
export const getStatisticsByPaymentStatus = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        // Nếu không có startDate và endDate, tự động lấy 12 tháng gần nhất
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = now.toISOString();
            const twelveMonthsAgo = new Date(now);
            twelveMonthsAgo.setMonth(now.getMonth() - 12);
            startDate = twelveMonthsAgo.toISOString();
        }

        const whereCondition = {
            billingPeriod: {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            },
        };

        const statistics = await Bill.findAll({
            attributes: [
                'paymentStatus',
                [sequelize.fn('COUNT', sequelize.col('Bill.bill_id')), 'totalBills'],
                [sequelize.fn('SUM', sequelize.col('Bill.total_amount')), 'totalRevenue'],
                [sequelize.fn('SUM', sequelize.col('Bill.paid_amount')), 'totalPaid'],
            ],
            where: whereCondition,
            group: ['Bill.payment_status'],
            raw: true,
        });

        const formattedStats = statistics.map(stat => ({
            paymentStatus: stat.paymentStatus,
            totalBills: parseInt(stat.totalBills || 0),
            totalRevenue: parseFloat(stat.totalRevenue || 0),
            totalPaid: parseFloat(stat.totalPaid || 0),
            unpaidAmount: parseFloat((stat.totalRevenue || 0) - (stat.totalPaid || 0)),
        }));

        res.json({
            success: true,
            data: formattedStats,
        });
    } catch (error) {
        console.error('Error getting statistics by payment status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics by payment status',
            error: error.message,
        });
    }
};

// Thống kê theo kỳ thu (billing period)
export const getStatisticsByPeriod = async (req, res) => {
    try {
        let { startDate, endDate, groupBy = 'month' } = req.query;

        // Nếu không có startDate và endDate, tự động lấy 12 tháng gần nhất
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = now.toISOString();
            const twelveMonthsAgo = new Date(now);
            twelveMonthsAgo.setMonth(now.getMonth() - 12);
            startDate = twelveMonthsAgo.toISOString();
        }

        const whereCondition = {
            billingPeriod: {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            },
        };

        // Tạo format theo groupBy
        let dateFormat;
        if (groupBy === 'year') {
            dateFormat = sequelize.fn('DATE_FORMAT', sequelize.col('Bill.billing_period'), '%Y');
        } else if (groupBy === 'month') {
            dateFormat = sequelize.fn('DATE_FORMAT', sequelize.col('Bill.billing_period'), '%Y-%m');
        } else {
            dateFormat = sequelize.fn('DATE_FORMAT', sequelize.col('Bill.billing_period'), '%Y-%m-%d');
        }

        const statistics = await Bill.findAll({
            attributes: [
                [dateFormat, 'period'],
                [sequelize.fn('COUNT', sequelize.col('Bill.bill_id')), 'totalBills'],
                [sequelize.fn('SUM', sequelize.col('Bill.total_amount')), 'totalRevenue'],
                [sequelize.fn('SUM', sequelize.col('Bill.paid_amount')), 'totalPaid'],
            ],
            where: whereCondition,
            group: [sequelize.literal('period')],
            order: [[sequelize.literal('period'), 'ASC']],
            raw: true,
        });

        const formattedStats = statistics.map(stat => ({
            period: stat.period,
            totalBills: parseInt(stat.totalBills || 0),
            totalRevenue: parseFloat(stat.totalRevenue || 0),
            totalPaid: parseFloat(stat.totalPaid || 0),
            unpaidAmount: parseFloat((stat.totalRevenue || 0) - (stat.totalPaid || 0)),
        }));

        res.json({
            success: true,
            data: formattedStats,
        });
    } catch (error) {
        console.error('Error getting statistics by period:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get statistics by period',
            error: error.message,
        });
    }
};

// Tổng quan thống kê
export const getOverallStatistics = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        // Nếu không có startDate và endDate, tự động lấy 12 tháng gần nhất
        if (!startDate || !endDate) {
            const now = new Date();
            endDate = now.toISOString();
            const twelveMonthsAgo = new Date(now);
            twelveMonthsAgo.setMonth(now.getMonth() - 12);
            startDate = twelveMonthsAgo.toISOString();
        }

        const whereCondition = {
            billingPeriod: {
                [Op.between]: [new Date(startDate), new Date(endDate)],
            },
        };

        const overall = await Bill.findOne({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('Bill.bill_id')), 'totalBills'],
                [sequelize.fn('SUM', sequelize.col('Bill.total_amount')), 'totalRevenue'],
                [sequelize.fn('SUM', sequelize.col('Bill.paid_amount')), 'totalPaid'],
                [sequelize.fn('COUNT', sequelize.literal("CASE WHEN payment_status = 'PAID' THEN 1 END")), 'paidBills'],
                [sequelize.fn('COUNT', sequelize.literal("CASE WHEN payment_status = 'UNPAID' THEN 1 END")), 'unpaidBills'],
                [sequelize.fn('COUNT', sequelize.literal("CASE WHEN payment_status = 'PARTIAL' THEN 1 END")), 'partialBills'],
            ],
            where: whereCondition,
            raw: true,
        });

        const formattedOverall = {
            totalBills: parseInt(overall.totalBills || 0),
            totalRevenue: parseFloat(overall.totalRevenue || 0),
            totalPaid: parseFloat(overall.totalPaid || 0),
            unpaidAmount: parseFloat((overall.totalRevenue || 0) - (overall.totalPaid || 0)),
            paidBills: parseInt(overall.paidBills || 0),
            unpaidBills: parseInt(overall.unpaidBills || 0),
            partialBills: parseInt(overall.partialBills || 0),
        };

        res.json({
            success: true,
            data: formattedOverall,
        });
    } catch (error) {
        console.error('Error getting overall statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get overall statistics',
            error: error.message,
        });
    }
};
