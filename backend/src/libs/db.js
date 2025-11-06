// db.js (sử dụng mysql2/promise)
import mysql from 'mysql2/promise';


export const connection = async () => {
    try {
        await mysql.createConnection(process.env.DB_CONNECTION_STRING);
        console.log("Kết nối đến cơ sở dữ liệu thành công!");
    } catch (error) {
        console.error("Lỗi kết nối đến cơ sở dữ liệu:", error);
        throw error;
    }
}