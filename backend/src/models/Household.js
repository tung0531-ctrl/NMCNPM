import { DataTypes } from 'sequelize';
import { sequelize } from '../libs/db.js';

const Household = sequelize.define('Household', {
    householdId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'household_id',
    },
    householdCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
        field: 'household_code',
    },
    ownerName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'owner_name',
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: false,
        field: 'address',
    },
    areaSqm: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        field: 'area_sqm',
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
        field: 'user_id',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
    },
}, {
    tableName: 'households',
    timestamps: false,
});

export default Household;