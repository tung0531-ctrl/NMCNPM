import FeeType from '../models/FeeType.js';

// Get all active fee types
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
