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
