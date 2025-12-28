import { Op, QueryTypes } from 'sequelize';
import { sequelize } from '../libs/db.js';
import Bill from '../models/Bill.js';
import FeeType from '../models/FeeType.js';
import Household from '../models/Household.js';
import User from '../models/User.js';

// Helper to format a Date to local YYYY-MM-DD string to avoid TZ shifts when comparing with DATE column
const toLocalDateStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Thống kê theo loại phí
export const getStatisticsByFeeType = async (req, res) => {
    try {
        let { startDate, endDate } = req.query;

        // Normalize to local YYYY-MM-DD strings to avoid timezone conversion issues
        const now = new Date();
        const defaultEnd = toLocalDateStr(now);
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(now.getMonth() - 12);
        const defaultStart = toLocalDateStr(twelveMonthsAgo);

        const startStr = startDate ? toLocalDateStr(new Date(startDate)) : defaultStart;
        const endStr = endDate ? toLocalDateStr(new Date(endDate)) : defaultEnd;

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
            replacements: { start: startStr, end: endStr },
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

        const now = new Date();
        const defaultEnd = toLocalDateStr(now);
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(now.getMonth() - 12);
        const defaultStart = toLocalDateStr(twelveMonthsAgo);

        const startStr = startDate ? toLocalDateStr(new Date(startDate)) : defaultStart;
        const endStr = endDate ? toLocalDateStr(new Date(endDate)) : defaultEnd;

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
            replacements: { start: startStr, end: endStr, limit: parseInt(limit) },
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
        const now = new Date();
        const defaultEnd = toLocalDateStr(now);
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(now.getMonth() - 12);
        const defaultStart = toLocalDateStr(twelveMonthsAgo);

        const startStr = startDate ? toLocalDateStr(new Date(startDate)) : defaultStart;
        const endStr = endDate ? toLocalDateStr(new Date(endDate)) : defaultEnd;

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
            replacements: { start: startStr, end: endStr },
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

        // Normalize dates to local strings
        const now = new Date();
        const defaultEnd = toLocalDateStr(now);
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(now.getMonth() - 12);
        const defaultStart = toLocalDateStr(twelveMonthsAgo);

        const startStr = startDate ? toLocalDateStr(new Date(startDate)) : defaultStart;
        const endStr = endDate ? toLocalDateStr(new Date(endDate)) : defaultEnd;

        const todayStr = toLocalDateStr(new Date());

        // Derive payment status from amounts; group overdue together with unpaid so frontend shows correct "Chưa thanh toán"
        const paymentSql = `
            SELECT
                CASE
                    WHEN paid_amount >= total_amount AND total_amount > 0 THEN 'PAID'
                    WHEN paid_amount > 0 AND paid_amount < total_amount THEN 'PARTIAL'
                    WHEN paid_amount = 0 THEN 'UNPAID'
                    ELSE 'UNKNOWN'
                END AS paymentStatus,
                COUNT(*) AS totalBills,
                COALESCE(SUM(total_amount), 0) AS totalRevenue,
                COALESCE(SUM(paid_amount), 0) AS totalPaid
            FROM bills
            WHERE billing_period BETWEEN :start AND :end
            GROUP BY paymentStatus
        `;

        const statistics = await sequelize.query(paymentSql, {
            type: QueryTypes.SELECT,
            replacements: { start: startStr, end: endStr, today: todayStr },
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

        const now = new Date();
        const defaultEnd = toLocalDateStr(now);
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(now.getMonth() - 12);
        const defaultStart = toLocalDateStr(twelveMonthsAgo);

        const startStr = startDate ? toLocalDateStr(new Date(startDate)) : defaultStart;
        const endStr = endDate ? toLocalDateStr(new Date(endDate)) : defaultEnd;

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
            replacements: { start: startStr, end: endStr },
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
        const now = new Date();
        const defaultEnd = toLocalDateStr(now);
        const twelveMonthsAgo = new Date(now);
        twelveMonthsAgo.setMonth(now.getMonth() - 12);
        const defaultStart = toLocalDateStr(twelveMonthsAgo);

        const startStr = startDate ? toLocalDateStr(new Date(startDate)) : defaultStart;
        const endStr = endDate ? toLocalDateStr(new Date(endDate)) : defaultEnd;

        const todayStr = toLocalDateStr(new Date());

        const overallSql = `
            SELECT
                COALESCE(SUM(total_amount), 0) AS totalRevenue,
                COALESCE(SUM(paid_amount), 0) AS totalPaid,
                SUM(CASE WHEN paid_amount >= total_amount AND total_amount > 0 THEN 1 ELSE 0 END) AS paidBills,
                SUM(CASE WHEN paid_amount > 0 AND paid_amount < total_amount THEN 1 ELSE 0 END) AS partialBills,
                SUM(CASE WHEN paid_amount = 0 AND billing_period < :today THEN 1 ELSE 0 END) AS overdueBills,
                SUM(CASE WHEN paid_amount = 0 AND billing_period >= :today THEN 1 ELSE 0 END) AS unpaidBills
            FROM bills
            WHERE billing_period BETWEEN :start AND :end
        `;

        const [overall] = await sequelize.query(overallSql, {
            type: QueryTypes.SELECT,
            replacements: { start: startStr, end: endStr, today: todayStr },
        });

        const paidBills = parseInt(overall.paidBills || 0);
        const partialBills = parseInt(overall.partialBills || 0);
        const overdueBills = parseInt(overall.overdueBills || 0);
        const unpaidNonOverdue = parseInt(overall.unpaidBills || 0);
        // Combine overdue into unpaid so `overall.unpaidBills` represents all unpaid bills
        const unpaidBills = overdueBills + unpaidNonOverdue;
        const totalBills = paidBills + partialBills + unpaidBills;

        const formattedOverall = {
            totalBills,
            totalRevenue: parseFloat(overall.totalRevenue || 0),
            totalPaid: parseFloat(overall.totalPaid || 0),
            unpaidAmount: parseFloat((overall.totalRevenue || 0) - (overall.totalPaid || 0)),
            paidBills,
            unpaidBills,
            partialBills,
            overdueBills,
            otherBills: 0,
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
