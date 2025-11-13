import User from "../models/User.js";
import Session from "../models/Session.js";
import { Op } from 'sequelize';
import { sequelize } from "../libs/db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const ACCESS_TOKEN_TTL = '30m';
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds

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

export const signIn = async (req, res) => {
    try {
        // lấy input từ req body
        const { username, password } = req.body;

        if(!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin."
            });
        }
        // lấy hashed password từ db qua email hoặc username
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username }
                ]
            }
        });
        if(!user) {
            return  res.status(401).json({
                success: false,
                message: "Tên đăng nhập hoặc mật khẩu không đúng."
            });
        }
        // so sánh password với hashed password
        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if(!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Tên đăng nhập hoặc mật khẩu không đúng."
            });
        }
        // xoá session cũ (nếu có)
        await Session.destroy({
            where: {
                userId: user.id
            }
        });
        // nếu khớp, tạo access token với JWT
        const accessToken = jwt.sign(
            { userId: user.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_TTL }
        );
        // tạo refresh token với JWT
        const refreshToken = crypto.randomBytes(64).toString('hex');

        // tạo session mới để lưu refresh token
        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL);
        await Session.create({
            userId: user.id,
            refreshToken,
            expiresAt
        });
        // trả refresh token qua http only cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: REFRESH_TOKEN_TTL
        });
        // trả access token qua response body
        return res.status(200).json({
            success: true,
            accessToken
        });
    }
    catch (error) {
        console.error("Lỗi khi gọi signIn", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ."
        });
    }
};

export const signOut = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if(refreshToken) {
            await Session.destroy({
                where: {
                    refreshToken
                }
            });

            res.clearCookie('refreshToken');
        }

        return res.sendStatus(204);
    }
    catch (error) {
        console.error("Lỗi khi gọi signOut", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ."
        });
    }
};