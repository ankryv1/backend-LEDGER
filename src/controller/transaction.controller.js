import mongoose from "mongoose";
import { accountModel } from "../model/account.model.js";
import { TransactionModel } from "../model/transaction.model.js";
import { ledgerModel } from "../model/ledger.model.js";

export const createTransactionController = async (req, res) => {
  const { fromAccount, toAccount, idempotencyKey, amount } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res
      .status(400)
      .json({ message: "enter all fields", success: false });
  }

  const isFromAccountExists = await accountModel.findOne({ _id: fromAccount });
  const isToAccountExists = await accountModel.findOne({ _id: toAccount });
  if (!isFromAccountExists || !isToAccountExists) {
    return res.status(400).json({ message: "Accounts dos not exists" });
  }

  const isTransactionExists = await accountModel.findOne({ idempotencyKey });
  if (isTransactionExists) {
    if (isTransactionExists.status === "COMPLETED") {
      res.status(200).json({
        message: "Transaction succssfully",
        succes: true,
        transactionDetails: isTransactionExists,
      });
    }

    if (isTransactionExists.status === "PENDING") {
      res.status(200).json({ message: "Trasaction is processing" });
    }

    if (isTransactionExists.status === "FAILED") {
      res.status(500).json({ message: "transaction failed" });
    }

    if (isTransactionExists.status === "REVERSED") {
      res
        .status(500)
        .json({ message: "Transaction was reversed, retry again" });
    }
  }

  if (
    isFromAccountExists.status !== "ACTIVE" ||
    isToAccountExists.status !== "ACTIVE"
  ) {
    return res.status(400).json({ message: "account is frozen or closed" });
  }

  //   now we will check balance of sender from ledger
  const balance = await isFromAccountExists.getBalance();

  if (balance < amount) {
    return res
      .status(400)
      .json({ message: `Insufficient Balance: Current balance- ${balance}` });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  const newTransaction = await TransactionModel.create(
    {
      fromAccount,
      toAccount,
      idempotencyKey,
      amount,
      status: "PENDING",
    },
    { session },
  );

  const creditLedgerEntry = await ledgerModel.create(
    {
      account: toAccount,
      amount,
      transaction: newTransaction._id,
      type: "CREDIT",
    },
    { session },
  );

  const debitLedgerEntry = await ledgerModel.create(
    {
      account: fromAccount,
      amount,
      transaction: newTransaction._id,
      type: "DEBIT",
    },
    { session },
  );

  const updateNewTransaction = await TransactionModel.findByIdAndUpdate(
    newTransaction._id,
    { type: "COMPLETED" },
    { session },
  );

  session.endSession();
};

export const createInitialFundsTransation = async (req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;
  if (!toAccount || !amount || !idempotencyKey) {
    return res
      .status(400)
      .json({ message: "enter all fields", success: false });
  }
  let isToUserAccountExists = await accountModel.findOne({ _id: toAccount });
  if (!isToUserAccountExists) {
        return res.status(400).json({
            message: "Invalid toAccount"
        })
    }
  let fromAccountExists = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
        return res.status(400).json({
            message: "System user account not found"
        })
    }
  const session = await mongoose.startSession();
  session.startTransaction();
  let newTransaction = await TransactionModel.create({
    fromAccount:fromAccountExists._id,
    toAccount,
    amount,
    idempotencyKey,
    status:"PENDING"
  },{session});

  let creditUserLedger = await ledgerModel.create([{
    account: toAccount,
    amount,
    transaction: newTransaction._id,
    type: "CREDIT"
  }], {session});

  let debitUserLedger = await ledgerModel.create([{
    account: fromAccountExists._id,
    amount,
    transaction: newTransaction._id,
    type: "DEBIT"
  }],{session});

  newTransaction.status ="COMPLETED";
  await newTransaction.save();
  await session.commitTransaction();
  session.endSession();

  return res.status(201).json({
    message:"Transaction completed successfully",
    transaction: newTransaction
  })
};
