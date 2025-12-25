import User from "../models/User.js";
import bcrypt from "bcrypt";
import Log from "../models/Log.js";
import { sequelize } from "../libs/db.js";
import { Op } from "sequelize";

// Helper function to create log
const createLog = async (userId, action, entityType, entityId, details, req) => {
    try {
        await Log.create({
            userId,
            action,
            entityType,
            entityId,
            details: JSON.stringify(details),
            ipAddress: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent')
        });
    } catch (error) {
        console.error("Lỗi tạo log:", error);
    }
};

export const authMe = async (req, res) => {
    try{
        const user = req.user;

        return res.status(200).json(user);
    } catch(error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['passwordHash'] },
            order: [['createdAt', 'DESC']]
        });

        await createLog(req.user.userId, 'VIEW_ALL_USERS', 'USER', null, { count: users.length }, req);

        return res.status(200).json(users);
    } catch (error) {
        console.error("Lỗi lấy danh sách người dùng:", error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id, {
            attributes: { exclude: ['passwordHash'] }
        });

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }

        await createLog(req.user.userId, 'VIEW_USER', 'USER', id, { username: user.username }, req);

        return res.status(200).json(user);
    } catch (error) {
        console.error("Lỗi lấy thông tin người dùng:", error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        const { username, email, fullName, password, role, status } = req.body;

        // Validate required fields
        if (!username || !email || !fullName || !password) {
            return res.status(400).json({ message: "Vui lòng điền đầy đủ thông tin." });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({
            where: {
                [Op.or]: [
                    { username: username.trim().toLowerCase() },
                    { email: email.trim().toLowerCase() }
                ]
            }
        });

        if (existingUser) {
            return res.status(400).json({ message: "Tên đăng nhập hoặc email đã tồn tại." });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
            username,
            email,
            fullName,
            passwordHash,
            role: role || 'RESIDENT',
            status: status || 'ACTIVE'
        });

        await createLog(
            req.user.userId, 
            'CREATE_USER', 
            'USER', 
            newUser.userId, 
            { username: newUser.username, role: newUser.role },
            req
        );

        const userResponse = newUser.toJSON();
        delete userResponse.passwordHash;

        return res.status(201).json({ 
            message: "Tạo người dùng thành công.",
            user: userResponse 
        });
    } catch (error) {
        console.error("Lỗi tạo người dùng:", error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, fullName, password, role, status } = req.body;

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }

        // Check if username or email is being changed and already exists
        if (username || email) {
            const existingUser = await User.findOne({
                where: {
                    userId: { [Op.ne]: id },
                    [Op.or]: [
                        username ? { username: username.trim().toLowerCase() } : null,
                        email ? { email: email.trim().toLowerCase() } : null
                    ].filter(Boolean)
                }
            });

            if (existingUser) {
                return res.status(400).json({ message: "Tên đăng nhập hoặc email đã tồn tại." });
            }
        }

        const updateData = {};
        if (username) updateData.username = username;
        if (email) updateData.email = email;
        if (fullName) updateData.fullName = fullName;
        if (password) updateData.passwordHash = await bcrypt.hash(password, 10);
        if (role) updateData.role = role;
        if (status) updateData.status = status;

        await user.update(updateData);

        await createLog(
            req.user.userId,
            'UPDATE_USER',
            'USER',
            id,
            { updated_fields: Object.keys(updateData), username: user.username },
            req
        );

        const userResponse = user.toJSON();
        delete userResponse.passwordHash;

        return res.status(200).json({
            message: "Cập nhật người dùng thành công.",
            user: userResponse
        });
    } catch (error) {
        console.error("Lỗi cập nhật người dùng:", error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent user from deleting themselves
        if (parseInt(id) === req.user.userId) {
            return res.status(400).json({ message: "Không thể xóa tài khoản của chính mình." });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }

        const username = user.username;
        await user.destroy();

        await createLog(
            req.user.userId,
            'DELETE_USER',
            'USER',
            id,
            { username },
            req
        );

        return res.status(200).json({ message: "Xóa người dùng thành công." });
    } catch (error) {
        console.error("Lỗi xóa người dùng:", error);
        return res.status(500).json({ message: "Lỗi máy chủ nội bộ." });
    }
};