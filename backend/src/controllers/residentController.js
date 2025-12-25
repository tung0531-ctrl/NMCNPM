import { Resident, Household } from '../models/index.js';
import { Op } from 'sequelize';
import { createLog, LogActions, EntityTypes } from '../utils/logger.js';

// Get all residents with filtering for admin
export const getAllResidentsForAdmin = async (req, res) => {
    try {
        const { fullName, householdId, isStaying, page = 1, limit = 10 } = req.query;

        const where = {};

        if (fullName) {
            where.fullName = { [Op.like]: `%${fullName}%` };
        }

        if (householdId && householdId !== 'undefined') {
            where.householdId = householdId;
        }

        if (isStaying === 'true' || isStaying === 'false') {
            where.isStaying = isStaying === 'true';
        }

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const offset = (pageNum - 1) * limitNum;

        const { count, rows } = await Resident.findAndCountAll({
            where,
            include: [{
                model: Household,
                as: 'household_resident',
                attributes: ['householdId', 'householdCode', 'ownerName', 'address']
            }],
            limit: limitNum,
            offset,
            order: [['fullName', 'ASC']]
        });

        // Log view all residents activity
        await createLog(req.user.userId, LogActions.VIEW_ALL_RESIDENTS, EntityTypes.RESIDENT, null, 
            { count: rows.length, filters: { fullName, householdId, isStaying } }, req);

        res.status(200).json({
            residents: rows,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(count / limitNum),
                totalItems: count,
                itemsPerPage: limitNum
            }
        });
    } catch (error) {
        console.error('Error fetching residents:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Get resident by ID
export const getResidentById = async (req, res) => {
    try {
        const { id } = req.params;

        const resident = await Resident.findByPk(id, {
            include: [{
                model: Household,
                as: 'household_resident',
                attributes: ['householdId', 'householdCode', 'ownerName', 'address']
            }]
        });

        if (!resident) {
            return res.status(404).json({ message: 'Resident not found' });
        }

        res.status(200).json(resident);
    } catch (error) {
        console.error('Error fetching resident:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

// Create resident
export const createResident = async (req, res) => {
    try {
        const {
            householdId,
            fullName,
            dateOfBirth,
            indentityCardNumber,
            relationToOwner,
            job,
            phone_number,
            isStaying
        } = req.body;

        const resident = await Resident.create({
            householdId,
            fullName,
            dateOfBirth,
            indentityCardNumber,
            relationToOwner,
            job,
            phone_number,
            isStaying
        });

        // Log create resident activity
        await createLog(req.user.userId, LogActions.CREATE_RESIDENT, EntityTypes.RESIDENT, resident.residentId, 
            { fullName: resident.fullName, householdId }, req);

        res.status(201).json(resident);
    } catch (error) {
        console.error('Error creating resident:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ message: 'Identity card number already exists' });
        } else {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
};

// Update resident
export const updateResident = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            householdId,
            fullName,
            dateOfBirth,
            indentityCardNumber,
            relationToOwner,
            job,
            phone_number,
            isStaying
        } = req.body;

        const resident = await Resident.findByPk(id);
        if (!resident) {
            return res.status(404).json({ message: 'Resident not found' });
        }

        await resident.update({
            householdId,
            fullName,
            dateOfBirth,
            indentityCardNumber,
            relationToOwner,
            job,
            phone_number,
            isStaying
        });

        // Log update resident activity
        await createLog(req.user.userId, LogActions.UPDATE_RESIDENT, EntityTypes.RESIDENT, id, 
            { fullName: resident.fullName, householdId }, req);

        res.status(200).json(resident);
    } catch (error) {
        console.error('Error updating resident:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ message: 'Identity card number already exists' });
        } else {
            res.status(500).json({ message: 'Internal server error', error: error.message });
        }
    }
};

// Delete resident
export const deleteResident = async (req, res) => {
    try {
        const { id } = req.params;

        const resident = await Resident.findByPk(id);
        if (!resident) {
            return res.status(404).json({ message: 'Resident not found' });
        }

        const residentData = { fullName: resident.fullName, householdId: resident.householdId };

        await resident.destroy();

        // Log delete resident activity
        await createLog(req.user.userId, LogActions.DELETE_RESIDENT, EntityTypes.RESIDENT, id, residentData, req);

        res.status(200).json({ message: 'Resident deleted successfully' });
    } catch (error) {
        console.error('Error deleting resident:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};