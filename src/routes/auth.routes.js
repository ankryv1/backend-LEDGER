import express from "express"
import { userLoginController, userRegisterController } from "../controller/auth.controller.js";
import { authMiddlewear } from "../middlewear/auth.middlewear.js";

const router = express.Router();

router.post("/register", userRegisterController);
router.post("/login", userLoginController)

export default router;
