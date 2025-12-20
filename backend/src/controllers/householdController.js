import Household from '../models/Household.js';

// Get all households
export const getAllHouseholds = async (req, res) => {
    try {
        const households = await Household.findAll({
            order: [['ownerName', 'ASC']]
        });

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

// Create new household
export const createHousehold = async (req, res) => {
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
