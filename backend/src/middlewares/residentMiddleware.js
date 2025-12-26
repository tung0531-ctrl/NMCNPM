export const residentOnly = (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                message: "Không có quyền truy cập. Vui lòng đăng nhập."
            });
        }

        if (user.role !== 'RESIDENT') {
            return res.status(403).json({
                message: "Chỉ cư dân mới có quyền truy cập."
            });
        }

        if (!user.householdId) {
            return res.status(403).json({
                message: "Tài khoản chưa được gán vào hộ gia đình."
            });
        }

        next();
    } catch (error) {
        console.error("Lỗi kiểm tra quyền cư dân:", error);
        return res.status(500).json({
            message: "Lỗi máy chủ nội bộ."
        });
    }
};
