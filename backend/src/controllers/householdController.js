import Household from '../models/Household.js';
import { Op } from 'sequelize';
import { createLog, LogActions, EntityTypes } from '../utils/logger.js';

// Get all households
export const getAllHouseholds = async (req, res) => {
    try {
        if (req.user?.role === 'RESIDENT') {
            const householdId = req.user.householdId;

            if (!householdId) {
                return res.status(403).json({
                    message: 'Tài khoản chưa được gán vào hộ gia đình'
                });
            }

            const household = await Household.findByPk(householdId);

            if (!household) {
                return res.status(404).json({ message: 'Không tìm thấy hộ gia đình' });
            }

            await createLog(
                req.user.userId,
                LogActions.VIEW_HOUSEHOLD,
                EntityTypes.HOUSEHOLD,
                household.householdId,
                { scope: 'resident' },
                req
            );

            return res.status(200).json({
                households: [
                    {
                        householdId: household.householdId,
                        ownerName: household.ownerName,
                        householdCode: household.householdCode,
                        address: household.address,
                        areaSqm: household.areaSqm,
                        userId: household.userId,
                        createdAt: household.createdAt
                    }
                ]
            });
        }

        const households = await Household.findAll({
            order: [['ownerName', 'ASC']]
        });

        // Log admin viewing all households
        await createLog(req.user?.userId || null, LogActions.VIEW_ALL_HOUSEHOLDS, EntityTypes.HOUSEHOLD, null, { count: households.length }, req);

        res.status(200).json({
            households: households.map(h => ({
                householdId: h.householdId,
                ownerName: h.ownerName,
                householdCode: h.householdCode,
                address: h.address
            }))
        });
    } catch (error) {
        console.error('Error fetching households:', error);
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

        // Log view all households activity
        await createLog(req.user.userId, LogActions.VIEW_ALL_HOUSEHOLDS, EntityTypes.HOUSEHOLD, null, 
            { count: rows.length, filters: { ownerName, householdCode, address } }, req);

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

        // Log create household activity
        await createLog(req.user.userId, LogActions.CREATE_HOUSEHOLD, EntityTypes.HOUSEHOLD, newHousehold.householdId, 
            { 
                householdCode: newHousehold.householdCode,
                ownerName: newHousehold.ownerName,
                address: newHousehold.address,
                areaSqm: newHousehold.areaSqm,
                userId: newHousehold.userId
            }, req);

        res.status(201).json(newHousehold);
    } catch (error) {
        console.error('Error creating household:', error);
        res.status(500).json({
            message: 'Lỗi khi tạo hộ gia đình',
            error: error.message
        });
    }
};

// Update household for admin
export const updateHouseholdForAdmin = async (req, res) => {
    try {
        const { householdId } = req.params;
        const { householdCode, ownerName, address, areaSqm, userId } = req.body;

        // Validate required fields
        if (!householdCode || !ownerName || !address) {
            return res.status(400).json({
                message: 'Mã hộ, tên chủ hộ và địa chỉ là bắt buộc'
            });
        }

        const household = await Household.findByPk(householdId);
        if (!household) {
            return res.status(404).json({
                message: 'Không tìm thấy hộ gia đình'
            });
        }

        // Capture old values
        const oldValues = {
            householdCode: household.householdCode,
            ownerName: household.ownerName,
            address: household.address,
            areaSqm: household.areaSqm,
            userId: household.userId
        };

        // Check if household code already exists (excluding current household)
        const existingHousehold = await Household.findOne({
            where: {
                householdCode,
                householdId: { [Op.ne]: householdId }
            }
        });

        if (existingHousehold) {
            return res.status(400).json({
                message: 'Mã hộ đã tồn tại'
            });
        }

        await household.update({
            householdCode,
            ownerName,
            address,
            areaSqm: areaSqm || null,
            userId: userId || null
        });

        // New values after update
        const newValues = {
            householdCode,
            ownerName,
            address,
            areaSqm: areaSqm || null,
            userId: userId || null
        };

        // Log update household activity
        await createLog(req.user.userId, LogActions.UPDATE_HOUSEHOLD, EntityTypes.HOUSEHOLD, householdId, 
            { 
                householdCode: household.householdCode,
                old_values: oldValues,
                new_values: newValues
            }, req);

        res.status(200).json(household);
    } catch (error) {
        console.error('Error updating household:', error);
        res.status(500).json({
            message: 'Lỗi khi cập nhật hộ gia đình',
            error: error.message
        });
    }
};

// Delete household for admin
export const deleteHouseholdForAdmin = async (req, res) => {
    try {
        const { householdId } = req.params;

        const household = await Household.findByPk(householdId);
        if (!household) {
            return res.status(404).json({
                message: 'Không tìm thấy hộ gia đình'
            });
        }

        const householdData = {
            householdCode: household.householdCode,
            ownerName: household.ownerName,
            address: household.address,
            areaSqm: household.areaSqm,
            userId: household.userId
        };

        await household.destroy();

        // Log delete household activity
        await createLog(req.user.userId, LogActions.DELETE_HOUSEHOLD, EntityTypes.HOUSEHOLD, householdId, householdData, req);

        res.status(200).json({
            message: 'Xóa hộ gia đình thành công'
        });
    } catch (error) {
        console.error('Error deleting household:', error);
        res.status(500).json({
            message: 'Lỗi khi xóa hộ gia đình',
            error: error.message
        });
    }
};