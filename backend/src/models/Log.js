import { DataTypes } from "sequelize";
import { sequelize } from "../libs/db.js";

const Log = sequelize.define("Log", {
    logId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: "log_id",
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "user_id",
    },
    action: {
        type: DataTypes.STRING(100),
        allowNull: false,
        field: "action",
    },
    entityType: {
        type: DataTypes.STRING(50),
        allowNull: true,
        field: "entity_type",
    },
    entityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "entity_id",
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: "details",
    },
    ipAddress: {
        type: DataTypes.STRING(45),
        allowNull: true,
        field: "ip_address",
    },
    userAgent: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: "user_agent",
    }
}, {
    tableName: "logs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true
});

export default Log;
