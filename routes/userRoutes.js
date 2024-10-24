import express from "express";
import { loginUser, registerUser, updateUserActiveStatus } from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/", registerUser);

router.post("/login", loginUser);

router.use(protect);

router.put("/updateUserStatus", updateUserActiveStatus);

export default router;
