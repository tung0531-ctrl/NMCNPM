import User from "../models/User.js";
import Session from "../models/Session.js";
import { Op } from "sequelize";
import { sequelize } from "../libs/db.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 ngày

export const signUp = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { username, password, email, firstName, lastName, phone } = req.body;

        if (!username || !email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin."
            });
        }

        // kiểm tra trùng username hoặc email
        const normalizedUsername = username.trim().toLowerCase();
        const normalizedEmail = email.trim().toLowerCase();

        const existing = await User.findOne({
            where: {
                [Op.or]: [{ username: normalizedUsername }, { email: normalizedEmail }]
            },
            attributes: ["username", "email"],
            transaction
        });

        if (existing) {
            await transaction.rollback();
            return res.status(409).json({
                success: false,
                message:
                    existing.username === username
                        ? "Username đã tồn tại."
                        : "Email đã tồn tại."
            });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // tạo user
        await User.create(
            {
                username: normalizedUsername,
                email: normalizedEmail,
                displayName: `${firstName} ${lastName}`,
                hashedPassword,
                phone
            },
            { transaction }
        );

        await transaction.commit();

        return res.sendStatus(204);
    } catch (error) {
        await transaction.rollback();
        console.error("Lỗi signUp:", error);

        if (error.name === "SequelizeValidationError") {
            return res.status(400).json({
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: error.errors.map((e) => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }

        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                success: false,
                message: "Dữ liệu đã tồn tại",
                errors: error.errors.map((e) => ({
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
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin."
            });
        }

        // tìm user theo username (đăng nhập bằng username)
        const normalizedUsername = username.trim().toLowerCase();

        const user = await User.findOne({
            where: { username: normalizedUsername }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Tên đăng nhập hoặc mật khẩu không đúng."
            });
        }

        // kiểm tra password
        const isMatch = await bcrypt.compare(password, user.hashedPassword);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Tên đăng nhập hoặc mật khẩu không đúng."
            });
        }

        // xoá session cũ nếu có
        await Session.destroy({
            where: { userId: user.id }
        });

        // tạo access token
        const accessToken = jwt.sign(
            { userId: user.id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_TTL }
        );

        // tạo refresh token ngẫu nhiên (bảo mật tốt hơn JWT)
        const refreshToken = crypto.randomBytes(64).toString("hex");

        const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL);

        // lưu session
        await Session.create({
            userId: user.id,
            refreshToken,
            expiresAt
        });

        // gửi refreshToken qua cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: REFRESH_TOKEN_TTL
        });

        // trả access token
        return res.status(200).json({
            success: true,
            accessToken
        });
    } catch (error) {
        console.error("Lỗi signIn:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ."
        });
    }
};

export const signOut = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;

        if (refreshToken) {
            await Session.destroy({
                where: { refreshToken }
            });

            res.clearCookie("refreshToken", {
                httpOnly: true,
                secure: true,
                sameSite: "none"
            });
        }

        return res.sendStatus(204);
    } catch (error) {
        console.error("Lỗi signOut:", error);
        return res.status(500).json({
            success: false,
            message: "Lỗi máy chủ nội bộ."
        });
    }
};