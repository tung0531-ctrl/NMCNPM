import { sequelize } from '../libs/db.js';
import { DataTypes } from 'sequelize';
import User from './User.js';

const Session = sequelize.define('Session', {
    userId: {
        type: DataTypes.CHAR(36),
        allowNull: false,
    },
    refreshToken: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    expiresAt: {
        type: DataTypes.DATE,
        allowNull: false
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['expiresAt']
        },
        {
            fields: ['userId']
        }
    ]
});

Session.belongsTo(User, { 
    foreignKey: 'userId',
    onDelete: 'CASCADE'
});
export default Session;