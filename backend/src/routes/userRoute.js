import express from "express"
import { 
    authMe, 
    getAllUsers, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser 
} from "../controllers/userController.js"
import { adminOnly } from "../middlewares/adminMiddleware.js"

const router = express.Router()

router.get('/me', authMe)

// Admin only routes
router.get('/', adminOnly, getAllUsers)
router.get('/:id', adminOnly, getUserById)
router.post('/', adminOnly, createUser)
router.put('/:id', adminOnly, updateUser)
router.delete('/:id', adminOnly, deleteUser)

export default router