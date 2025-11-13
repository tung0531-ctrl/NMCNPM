// db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();


export const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING, {
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
    connectTimeout: 60000,
    dateStrings: true,
    typeCast: true,
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
    },
    define: {
        // Prevent sequelize from pluralizing table names
        freezeTableName: true,
        // Add createdAt and updatedAt timestamps
        timestamps: true
    }
});

// Initialize database connection
export const initDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Sync all models
        // Note: In production, you might want to remove or control this
        await sequelize.sync({ alter: false });
        console.log('Database models synchronized.');
        
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        // In production, you might want to implement retry logic here
        throw error;
    }
};