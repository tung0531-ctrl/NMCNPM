export const adminOnly = (req, res, next) => {
    try {
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({ 
                message: "Không có quyền truy cập. Vui lòng đăng nhập." 
            });
        }
        
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ 
                message: "Chỉ quản trị viên mới có quyền truy cập." 
            });
        }
        
        next();
    } catch (error) {
        console.error("Lỗi kiểm tra quyền admin:", error);
        return res.status(500).json({ 
            message: "Lỗi máy chủ nội bộ." 
        });
    }
};
