import Log from "../models/Log.js";
import User from "../models/User.js";
import { sequelize } from "../libs/db.js";
import { Op } from "sequelize";

// Get all logs with pagination and filters
export const getLogs = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            action, 
            entityType, 
            userId,
            startDate,
            endDate
        } = req.query;

        const offset = (page - 1) * limit;

        // Build where clause
        const where = {};
        if (action) where.action = action;
        if (entityType) where.entityType = entityType;
        if (userId) where.userId = userId;
        
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt[Op.gte] = new Date(startDate);
            if (endDate) where.createdAt[Op.lte] = new Date(endDate);
        }

        const { count, rows } = await Log.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            include: [{
                model: User,
                as: 'user',
                attributes: ['userId', 'username', 'fullName', 'role']
            }]
        });

        return res.status(200).json({
            logs: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (error) {
        console.error("Lỗi lấy danh sách log:", error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
    }
};

// Get log statistics
export const getLogStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const where = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt[Op.gte] = new Date(startDate);
            if (endDate) where.createdAt[Op.lte] = new Date(endDate);
        }

        const actionCounts = await Log.findAll({
            where,
            attributes: [
                'action',
                [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('log_id')), 'count']
            ],
            group: ['action']
        });

        const entityTypeCounts = await Log.findAll({
            where,
            attributes: [
                'entityType',
                [sequelize.Sequelize.fn('COUNT', sequelize.Sequelize.col('log_id')), 'count']
            ],
            group: ['entityType']
        });

        return res.status(200).json({
            actionCounts,
            entityTypeCounts
        });
    } catch (error) {
        console.error("Lỗi lấy thống kê log:", error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
    }
};
