import { Op, QueryTypes } from 'sequelize';
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

        const feeSql = `
            SELECT
                fee_type_id AS feeTypeId,
                COUNT(*) AS totalBills,
                COALESCE(SUM(total_amount), 0) AS totalRevenue,
                COALESCE(SUM(paid_amount), 0) AS totalPaid
            FROM bills
            WHERE billing_period BETWEEN :start AND :end
            GROUP BY fee_type_id
            ORDER BY totalRevenue DESC
        `;

        const statistics = await sequelize.query(feeSql, {
            type: QueryTypes.SELECT,
            replacements: { start: new Date(startDate), end: new Date(endDate) },
        });

        const feeTypeIds = statistics.map(s => s.feeTypeId).filter(id => id != null);
        const feeTypes = feeTypeIds.length
            ? await FeeType.findAll({ where: { feeTypeId: feeTypeIds }, attributes: ['feeTypeId', 'feeName'], raw: true })
            : [];
        const feeMap = {};
        feeTypes.forEach(f => { feeMap[f.feeTypeId] = f.feeName; });

        const formattedStats = statistics.map(stat => ({
            feeTypeId: stat.feeTypeId,
            feeTypeName: feeMap[stat.feeTypeId] || 'Unknown',
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

        const householdSql = `
            SELECT
                household_id AS householdId,
                COUNT(*) AS totalBills,
                COALESCE(SUM(total_amount), 0) AS totalRevenue,
                COALESCE(SUM(paid_amount), 0) AS totalPaid
            FROM bills
            WHERE billing_period BETWEEN :start AND :end
            GROUP BY household_id
            ORDER BY totalRevenue DESC
            LIMIT :limit
        `;

        const statistics = await sequelize.query(householdSql, {
            type: QueryTypes.SELECT,
            replacements: { start: new Date(startDate), end: new Date(endDate), limit: parseInt(limit) },
        });

        const householdIds = statistics.map(s => s.householdId).filter(id => id != null);
        const households = householdIds.length
            ? await Household.findAll({ where: { householdId: householdIds }, attributes: ['householdId', 'ownerName'], raw: true })
            : [];
        const householdMap = {};
        households.forEach(h => { householdMap[h.householdId] = h.ownerName; });

        const formattedStats = statistics.map(stat => ({
            householdId: stat.householdId,
            householdName: stat.householdId == null ? '-' : (householdMap[stat.householdId] || 'Unknown'),
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

        const collectorSql = `
            SELECT
                collector_id AS collectorId,
                COUNT(*) AS totalBills,
                COALESCE(SUM(total_amount), 0) AS totalRevenue,
                COALESCE(SUM(paid_amount), 0) AS totalPaid
            FROM bills
            WHERE collector_id IS NOT NULL
              AND billing_period BETWEEN :start AND :end
            GROUP BY collector_id
            ORDER BY totalRevenue DESC
        `;

        const statistics = await sequelize.query(collectorSql, {
            type: QueryTypes.SELECT,
            replacements: { start: new Date(startDate), end: new Date(endDate) },
        });

        const collectorIds = statistics.map(s => s.collectorId).filter(id => id != null);
        const collectors = collectorIds.length
            ? await User.findAll({ where: { userId: collectorIds }, attributes: ['userId', 'username', 'fullName'], raw: true })
            : [];
        const collectorMap = {};
        collectors.forEach(c => { collectorMap[c.userId] = c.fullName || c.username; });

        const formattedStats = statistics.map(stat => ({
            collectorId: stat.collectorId,
            collectorName: collectorMap[stat.collectorId] || 'Unknown',
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

        const paymentSql = `
            SELECT
                payment_status AS paymentStatus,
                COUNT(*) AS totalBills,
                COALESCE(SUM(total_amount), 0) AS totalRevenue,
                COALESCE(SUM(paid_amount), 0) AS totalPaid
            FROM bills
            WHERE billing_period BETWEEN :start AND :end
            GROUP BY payment_status
        `;

        const statistics = await sequelize.query(paymentSql, {
            type: QueryTypes.SELECT,
            replacements: { start: new Date(startDate), end: new Date(endDate) },
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

        // Build the SQL date format depending on groupBy
        let fmt = '%Y-%m-%d';
        if (groupBy === 'month') fmt = '%Y-%m';
        if (groupBy === 'year') fmt = '%Y';

        const periodSql = `
            SELECT
                DATE_FORMAT(billing_period, '${fmt}') AS period,
                COUNT(*) AS totalBills,
                COALESCE(SUM(total_amount), 0) AS totalRevenue,
                COALESCE(SUM(paid_amount), 0) AS totalPaid
            FROM bills
            WHERE billing_period BETWEEN :start AND :end
            GROUP BY period
            ORDER BY period ASC
        `;

        const statistics = await sequelize.query(periodSql, {
            type: QueryTypes.SELECT,
            replacements: { start: new Date(startDate), end: new Date(endDate) },
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

        const overallSql = `
            SELECT
                COUNT(*) AS totalBills,
                COALESCE(SUM(total_amount), 0) AS totalRevenue,
                COALESCE(SUM(paid_amount), 0) AS totalPaid,
                SUM(CASE WHEN payment_status = 'PAID' THEN 1 ELSE 0 END) AS paidBills,
                SUM(CASE WHEN payment_status = 'UNPAID' THEN 1 ELSE 0 END) AS unpaidBills,
                SUM(CASE WHEN payment_status = 'PARTIAL' THEN 1 ELSE 0 END) AS partialBills
            FROM bills
            WHERE billing_period BETWEEN :start AND :end
        `;

        const [overall] = await sequelize.query(overallSql, {
            type: QueryTypes.SELECT,
            replacements: { start: new Date(startDate), end: new Date(endDate) },
        });

        const totalBills = parseInt(overall.totalBills || 0);
        const paidBills = parseInt(overall.paidBills || 0);
        const unpaidBills = parseInt(overall.unpaidBills || 0);
        const partialBills = parseInt(overall.partialBills || 0);
        const otherBills = totalBills - (paidBills + unpaidBills + partialBills);

        const formattedOverall = {
            totalBills,
            totalRevenue: parseFloat(overall.totalRevenue || 0),
            totalPaid: parseFloat(overall.totalPaid || 0),
            unpaidAmount: parseFloat((overall.totalRevenue || 0) - (overall.totalPaid || 0)),
            paidBills,
            unpaidBills,
            partialBills,
            otherBills: otherBills < 0 ? 0 : otherBills,
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
