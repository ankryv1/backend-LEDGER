import express from 'express'
import { authMiddlewear } from '../middlewear/auth.middlewear.js';
import { createNewAccountController, getAccountBalanceController, getUserAccountController } from '../controller/account.controller.js';

const router=  express.Router();

router.post("/new", authMiddlewear, createNewAccountController)

router.get("/get", authMiddlewear, getUserAccountController);

router.get("/get-balance/:accountId", authMiddlewear ,getAccountBalanceController);
export default router;


