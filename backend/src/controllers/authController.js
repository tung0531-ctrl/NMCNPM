import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { Op } from 'sequelize';
import { sequelize } from "../libs/db.js";

export const signUp = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { username, password, email, firstName, lastName, phone } = req.body;

        // Validate required fields
        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({ 
                success: false,
                message: "Vui lòng điền đầy đủ thông tin."
            });
        }

        // Check for duplicate username or email in a single query
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username },
                    { email }
                ]
            },
            attributes: ['username', 'email'],
            transaction
        });

        if (existingUser) {
            await transaction.rollback();
            return res.status(409).json({
                success: false,
                message: existingUser.username === username 
                    ? "Username đã tồn tại."
                    : "Email đã tồn tại."
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with transaction
        await User.create({
            username,
            email,
            displayName: `${firstName} ${lastName}`,
            hashedPassword,
            phone
        }, { transaction });

        // Commit transaction
        await transaction.commit();

        // Return success response
        return res.sendStatus(204)

    } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();

        console.error('Lỗi đăng ký người dùng:', error);

        // Handle specific Sequelize errors
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }

        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({
                success: false,
                message: "Dữ liệu đã tồn tại",
                errors: error.errors.map(e => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }

        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ."
        });
    }
};