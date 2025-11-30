import { DataTypes } from "sequelize";
import { sequelize } from "../libs/db.js";

const User = sequelize.define("User", {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        set(value) {
            this.setDataValue("username", value.trim().toLowerCase());
        }
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        set(value) {
            this.setDataValue("email", value.trim().toLowerCase());
        }
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        set(value) {
            this.setDataValue("full_name", value.trim());
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('ADMIN', 'RESIDENT'),
        allowNull: false,
        defaultValue: 'RESIDENT'
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'LOCKED'),
        defaultValue: 'ACTIVE'
    }
}, {
    tableName: "users",
    timestamps: true,
    underscored: true
});

export default User;