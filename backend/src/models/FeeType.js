import { DataTypes } from 'sequelize';
import { sequelize } from '../libs/db.js';

const FeeType = sequelize.define('FeeType', {
    feeTypeId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'fee_type_id'
    },
    feeName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'fee_name'
    },
    unitPrice: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        field: 'unit_price'
    },
    unit: {
        type: DataTypes.STRING(20),
        field: 'unit'
    },
    description: {
        type: DataTypes.TEXT,
        field: 'description'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_active'
    }
}, {
    tableName: 'fee_types',
    timestamps: false
});

export default FeeType;
