import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectedRoute = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Không có token, truy cập bị từ chối." });
        }

        const token = authHeader.split(" ")[1];

        if (!process.env.ACCESS_TOKEN_SECRET) {
            throw new Error("ACCESS_TOKEN_SECRET chưa được khai báo");
        }

        // ✅ verify SYNC để bắt lỗi bằng try/catch
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decoded.userId) {
            return res.status(401).json({ message: "Token thiếu userId." });
        }

        const user = await User.findByPk(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: "Người dùng không tồn tại." });
        }

        const { passwordHash, ...userWithoutPassword } = user.toJSON();
        req.user = userWithoutPassword;

        next();
    } catch (error) {
        console.error("Lỗi auth middleware:", error);

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Access token đã hết hạn",
                code: "TOKEN_EXPIRED"
            });
        }

        return res.status(401).json({
            message: "Token không hợp lệ",
            code: "INVALID_TOKEN"
        });
    }
};
