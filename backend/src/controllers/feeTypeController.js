import FeeType from '../models/FeeType.js';
import { Op } from 'sequelize';

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

        await feeType.update({
            feeName,
            unitPrice,
            unit: unit || null,
            description: description || null,
            isActive: isActive !== undefined ? isActive : feeType.isActive
        });

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

        await feeType.destroy();

        res.json({ message: 'Xóa loại khoản thu thành công' });
    } catch (error) {
        console.error('Error deleting fee type:', error);
        res.status(500).json({ 
            message: 'Lỗi khi xóa loại khoản thu',
            error: error.message 
        });
    }
};
