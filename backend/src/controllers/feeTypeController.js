import FeeType from '../models/FeeType.js';
import { Op } from 'sequelize';
import { createLog, LogActions, EntityTypes } from '../utils/logger.js';

// Get all fee types with filtering (for management page)
export const getAllFeeTypes = async (req, res) => {
    try {
        const { 
            feeName, 
            isActive,
            page = 1, 
            limit = 10 
        } = req.query;

        const where = {};

        // Filter by fee name
        if (feeName) {
            where.feeName = { [Op.like]: `%${feeName}%` };
        }

        // Filter by active status
        if (isActive !== undefined && isActive !== '') {
            where.isActive = isActive === 'true' || isActive === '1';
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await FeeType.findAndCountAll({
            where,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['feeTypeId', 'DESC']]
        });

        // Log view all fee types activity
        await createLog(req.user.userId, LogActions.VIEW_ALL_FEE_TYPES, EntityTypes.FEE_TYPE, null, 
            { count: rows.length, filters: { feeName, isActive } }, req);

        res.json({
            feeTypes: rows,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching fee types:', error);
        res.status(500).json({ 
            message: 'Lỗi khi tải danh sách loại khoản thu',
            error: error.message 
        });
    }
};

// Get all active fee types (for dropdown selection)
export const getActiveFeeTypes = async (req, res) => {
    try {
        const feeTypes = await FeeType.findAll({
            where: {
                isActive: 1
            },
            order: [['feeName', 'ASC']]
        });

        res.status(200).json({
            feeTypes: feeTypes.map(ft => ({
                feeTypeId: ft.feeTypeId,
                feeName: ft.feeName,
                unitPrice: ft.unitPrice,
                unit: ft.unit,
                description: ft.description
            }))
        });
    } catch (error) {
        console.error('Error fetching fee types:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Create new fee type
export const createFeeType = async (req, res) => {
    try {
        const { feeName, unitPrice, unit, description, isActive } = req.body;

        // Validate required fields
        if (!feeName || !unitPrice) {
            return res.status(400).json({ 
                message: 'Tên khoản thu và đơn giá là bắt buộc' 
            });
        }

        const newFeeType = await FeeType.create({
            feeName,
            unitPrice,
            unit: unit || null,
            description: description || null,
            isActive: isActive !== undefined ? isActive : true
        });

        // Log create fee type activity
        await createLog(req.user.userId, LogActions.CREATE_FEE_TYPE, EntityTypes.FEE_TYPE, newFeeType.feeTypeId, 
            { 
                feeName: newFeeType.feeName,
                unitPrice: newFeeType.unitPrice,
                unit: newFeeType.unit,
                description: newFeeType.description,
                isActive: newFeeType.isActive
            }, req);

        res.status(201).json(newFeeType);
    } catch (error) {
        console.error('Error creating fee type:', error);
        res.status(500).json({ 
            message: 'Lỗi khi tạo loại khoản thu',
            error: error.message 
        });
    }
};

// Update fee type
export const updateFeeType = async (req, res) => {
    try {
        const { id } = req.params;
        const { feeName, unitPrice, unit, description, isActive } = req.body;

        const feeType = await FeeType.findByPk(id);
        
        if (!feeType) {
            return res.status(404).json({ message: 'Không tìm thấy loại khoản thu' });
        }

        // Validate required fields
        if (!feeName || !unitPrice) {
            return res.status(400).json({ 
                message: 'Tên khoản thu và đơn giá là bắt buộc' 
            });
        }

        // Capture old values
        const oldValues = {
            feeName: feeType.feeName,
            unitPrice: feeType.unitPrice,
            unit: feeType.unit,
            description: feeType.description,
            isActive: feeType.isActive
        };

        await feeType.update({
            feeName,
            unitPrice,
            unit: unit || null,
            description: description || null,
            isActive: isActive !== undefined ? isActive : feeType.isActive
        });

        // New values after update
        const newValues = {
            feeName,
            unitPrice,
            unit: unit || null,
            description: description || null,
            isActive: isActive !== undefined ? isActive : oldValues.isActive
        };

        // Log update fee type activity
        await createLog(req.user.userId, LogActions.UPDATE_FEE_TYPE, EntityTypes.FEE_TYPE, id, 
            { 
                feeName: feeType.feeName,
                old_values: oldValues,
                new_values: newValues
            }, req);

        res.json(feeType);
    } catch (error) {
        console.error('Error updating fee type:', error);
        res.status(500).json({ 
            message: 'Lỗi khi cập nhật loại khoản thu',
            error: error.message 
        });
    }
};

// Delete fee type
export const deleteFeeType = async (req, res) => {
    try {
        const { id } = req.params;

        const feeType = await FeeType.findByPk(id);
        
        if (!feeType) {
            return res.status(404).json({ message: 'Không tìm thấy loại khoản thu' });
        }

        const feeTypeData = {
            feeName: feeType.feeName,
            unitPrice: feeType.unitPrice,
            unit: feeType.unit,
            description: feeType.description,
            isActive: feeType.isActive
        };

        await feeType.destroy();

        // Log delete fee type activity
        await createLog(req.user.userId, LogActions.DELETE_FEE_TYPE, EntityTypes.FEE_TYPE, id, feeTypeData, req);

        res.json({ message: 'Xóa loại khoản thu thành công' });
    } catch (error) {
        console.error('Error deleting fee type:', error);
        res.status(500).json({ 
            message: 'Lỗi khi xóa loại khoản thu',
            error: error.message 
        });
    }
};
