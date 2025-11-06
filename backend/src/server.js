import express from "express"
import dotenv from "dotenv"
import { connection } from "./libs/db.js"

dotenv.config()

const app = express();
const PORT = process.env.PORT || 4000

// middleware
app.use(express.json())

connection().then(() => {
    app.listen(PORT, () => {
        console.log(`Server bắt đầu trên cổng ${PORT}`)
    })
});
