import express from 'express'
import { authMiddlewear } from '../middlewear/auth.middlewear.js';
import { createNewAccountController } from '../controller/account.controller.js';

const router=  express.Router();

router.post("/new", authMiddlewear, createNewAccountController)

export default router;


