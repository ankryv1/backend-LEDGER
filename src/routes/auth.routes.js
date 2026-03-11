import express from "express"
import { userLoginController, userLogoutController, userRegisterController } from "../controller/auth.controller.js";
import { authMiddlewear } from "../middlewear/auth.middlewear.js";

const router = express.Router();

router.post("/register", userRegisterController);
router.post("/login", userLoginController);
router.post("/logout", authMiddlewear, userLogoutController)

export default router;
