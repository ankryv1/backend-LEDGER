import express from 'express'
import cookieParser from 'cookie-parser';
import accountRouter from './routes/account.routes.js';
import transactionRouter from './routes/transaction.routes.js'

import authRouter from './routes/auth.routes.js'

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/account", accountRouter);
app.use("/api/transation", transactionRouter);


export default app;


//   server ko create krna aur server ko config krna