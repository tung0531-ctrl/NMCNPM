import { DataTypes } from 'sequelize';
import { sequelize } from '../libs/db.js';

const Bill = sequelize.define('Bill', {
    billId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'bill_id',
    },
    householdId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'household_id',
    },
    billingPeriod: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'billing_period',
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: true,
        field: 'title',
    },
    totalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'total_amount',
    },
    paidAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'paid_amount',
    },
    paymentStatus: {
        type: DataTypes.ENUM('UNPAID', 'PARTIAL', 'PAID'),
        allowNull: false,
        defaultValue: 'UNPAID',
        field: 'payment_status',
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'created_by',
    },
    feeTypeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'fee_type_id',
    },
    collectorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'collector_id',
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
    },
}, {
    tableName: 'bills',
    timestamps: false,
});

export default Bill;
