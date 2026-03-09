import express from 'express'
import { authMiddlewear, authSystemUserMiddlewear } from '../middlewear/auth.middlewear.js';
import { createInitialFundsTransation, createTransactionController } from '../controller/transaction.controller.js';

const router = express.Router();

router.post("/transaction", authMiddlewear, createTransactionController);
router.post("/system/initial-funds", authSystemUserMiddlewear, createInitialFundsTransation)
export default router;
