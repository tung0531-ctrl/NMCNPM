import { DataTypes } from "sequelize";
import { sequelize } from "../libs/db.js";

const Resident = sequelize.define('Resident', {
    residentId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'resident_id'
    },
    householdId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
        field: 'household_id'
    },
    fullName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: 'full_name'
    },
    dateOfBirth: {
        type: DataTypes.DATE,
        field: 'date_of_birth'
    },
    indentityCardNumber: {
        type: DataTypes.STRING(20),
        unique: true,
        field: 'identity_card_number'
    },
    relationToOwner: {
        type: DataTypes.STRING(50),
        field: 'relation_to_owner'
    },
    job: {
        type: DataTypes.STRING(100),
        field: 'job'
    },
    phone_number: {
        type: DataTypes.STRING(15),
        field: 'phone_number'
    },
    isStaying: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        field: 'is_staying'
    },
}, {
    tableName: 'residents',
    timestamps: false
});

export default Resident;