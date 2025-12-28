// db.js
import { Sequelize } from 'sequelize';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();


const sslConfig = process.env.DB_SSL === 'true' ? {
    require: true,
    rejectUnauthorized: false
} : false;

export const sequelize = new Sequelize(process.env.DB_CONNECTION_STRING, {
    dialect: 'mysql',
    logging: false,
    timezone: '+00:00', // Lưu tất cả timestamp dưới dạng UTC
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    dialectOptions: {
        connectTimeout: 60000,
        ssl: sslConfig
    },
    define: {
        // Prevent sequelize from pluralizing table names
        freezeTableName: true,
        // Use snake_case column names like `created_at` / `updated_at` to match SQL schema
        underscored: true
    }
});

// Initialize database connection
export const initDatabase = async () => {
    try {
        // Parse DB_CONNECTION_STRING to create database if not exists
        const dbUrl = new URL(process.env.DB_CONNECTION_STRING);
        const serverUrl = `${dbUrl.protocol}//${dbUrl.username}:${dbUrl.password}@${dbUrl.hostname}:${dbUrl.port}`;
        const dbName = dbUrl.pathname.slice(1); // Remove leading /

        // Create database if not exists
        const connection = await mysql.createConnection(serverUrl);
        await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.end();

        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        
        // Sync models to create tables
        await sequelize.sync({ force: false });
        console.log('Database tables synchronized successfully.');
        
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        // In production, you might want to implement retry logic here
        throw error;
    }
};