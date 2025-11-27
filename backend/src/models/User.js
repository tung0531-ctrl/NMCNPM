import { DataTypes } from "sequelize";
import { sequelize } from "../libs/db.js";

const User = sequelize.define("User", {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
            this.setDataValue("username", value.trim().toLowerCase());
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        set(value) {
            this.setDataValue("email", value.trim().toLowerCase());
        }
    },
    displayName: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
            this.setDataValue("displayName", value.trim());
        }
    },
    hashedPassword: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ["username"]
        },
        {
            fields: ["email"]
        }
    ]
});

export default User;