import { sequelize } from '../libs/db.js';
import { DataTypes } from 'sequelize';
import User from './User.js';

const Session = sequelize.define('Session', {
    userId: {
        type: DataTypes.INTEGER,
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

Session.belongsTo(User, { foreignKey: 'userId' });
export default Session;