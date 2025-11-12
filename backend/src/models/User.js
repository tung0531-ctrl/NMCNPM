import { DataTypes } from "sequelize";
import { sequelize } from "../libs/db.js";

const User = sequelize.define("User", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        required: true,
        unique: false,
        trim: true,
        lowercase: true
    },
    email: {
        type: DataTypes.STRING,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    displayName: {
        type: DataTypes.STRING,
        required: true,
        trim: true
    },
    hashedPassword: {
        type: DataTypes.STRING,
        required: true
    },
    phone: {
        type: DataTypes.STRING,
        sparse: true
    }
}, {
    timestamps: true
});

export default User;