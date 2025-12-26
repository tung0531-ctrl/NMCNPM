import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { initDatabase } from "./libs/db.js";
import authRoute from "./routes/authRoute.js";
import userRoute from "./routes/userRoute.js";
import billRoute from "./routes/billRoute.js";
import feeTypeRoute from "./routes/feeTypeRoute.js";
import householdRoute from "./routes/householdRoute.js";
import adminRoute from "./routes/adminRoute.js";
import residentRoute from "./routes/residentRoute.js";
import logRoute from "./routes/logRoute.js";
import { protectedRoute } from "./middlewares/authMiddleware.js";
import cookieParser from "cookie-parser";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Trust proxy - để đọc đúng IP address khi đằng sau proxy/load balancer
app.set('trust proxy', true);

// Middleware
// Configure CORS to allow requests from the frontend and allow credentials (cookies)
const frontendOrigin = process.env.FRONTEND_ORIGIN|| 'http://localhost:5173';
app.use(
    cors({
        origin: [frontendOrigin, 'http://localhost:5173', 'http://localhost:5174'],
        credentials: true
    })
);
app.use(express.json());
app.use(cookieParser());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoute);
app.use('/api/bills', billRoute); // Add bill route
app.use('/api/fee-types', feeTypeRoute); // Add fee type route
app.use('/api/admins', adminRoute); // Add admin route
// Private route
app.use(protectedRoute);
app.use('/api/users', userRoute);
app.use('/api/households', householdRoute); // Add household route (moved to protected section)
app.use('/api/residents', residentRoute); // Add resident route (moved to protected section)
app.use('/api/logs', logRoute); // Add log route

// Basic error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ.' });
});

// Start server
const startServer = async () => {
    try {
        await initDatabase();
        app.listen(PORT, () => {
            console.log(`Server đang chạy trên cổng ${PORT}`);
        });
    } catch (error) {
        console.error('Lỗi khởi động server:', error);
        process.exit(1);
    }
};

startServer();
