import User from '../models/User.js';
import Household from '../models/Household.js';
import { Op } from 'sequelize';

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

// Get all households with filtering for admin
export const getAllHouseholdsForAdmin = async (req, res) => {
    try {
        const { 
            ownerName, 
            householdCode,
            address,
            page = 1, 
            limit = 10 
        } = req.query;

        const where = {};

        // Filter by owner name
        if (ownerName) {
            where.ownerName = { [Op.like]: `%${ownerName}%` };
        }

        // Filter by household code
        if (householdCode) {
            where.householdCode = { [Op.like]: `%${householdCode}%` };
        }

        // Filter by address
        if (address) {
            where.address = { [Op.like]: `%${address}%` };
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await Household.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['householdId', 'DESC']]
        });

        res.json({
            households: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching households:', error);
        res.status(500).json({ 
            message: 'Lỗi khi tải danh sách hộ gia đình',
            error: error.message 
        });
    }
};

// Create new household for admin
export const createHouseholdForAdmin = async (req, res) => {
    try {
        const { householdCode, ownerName, address, areaSqm, userId } = req.body;

        // Validate required fields
        if (!householdCode || !ownerName || !address) {
            return res.status(400).json({
                message: 'Mã hộ, tên chủ hộ và địa chỉ là bắt buộc'
            });
        }

        // Check if household code already exists
        const existingHousehold = await Household.findOne({
            where: { householdCode }
        });

        if (existingHousehold) {
            return res.status(400).json({
                message: 'Mã hộ đã tồn tại'
            });
        }

        const newHousehold = await Household.create({
            householdCode,
            ownerName,
            address,
            areaSqm: areaSqm || null,
            userId: userId || null
        });

        res.status(201).json(newHousehold);
    } catch (error) {
        console.error('Error creating household:', error);
        res.status(500).json({
            message: 'Lỗi khi tạo hộ gia đình',
            error: error.message
        });
    }
};
