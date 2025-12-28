import User from '../models/User.js';
import Household from '../models/Household.js';
import { Op } from 'sequelize';
import { createLog, LogActions, EntityTypes } from '../utils/logger.js';

// Get all admin users
export const getAllAdmins = async (req, res) => {
    try {
        const admins = await User.findAll({
            where: {
                role: 'ADMIN'
            },
            attributes: ['userId', 'fullName', 'username'],
            order: [['fullName', 'ASC']]
        });

        // Log view all admins
        await createLog(req.user?.userId || null, LogActions.VIEW_ALL_USERS, EntityTypes.USER, null, { count: admins.length }, req);

        res.status(200).json({
            admins: admins.map(admin => ({
                userId: admin.userId,
                fullName: admin.fullName,
                username: admin.username
            }))
        });
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};