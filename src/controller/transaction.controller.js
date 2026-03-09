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

  const isTransactionExists = await TransactionModel.findOne({ idempotencyKey });

  if (isTransactionExists) {
    if (isTransactionExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "Transaction succssfully",
        succes: true,
        transactionDetails: isTransactionExists,
      });
    }

    if (isTransactionExists.status === "PENDING") {
      return res.status(200).json({ message: "Trasaction is processing" });
    }

    if (isTransactionExists.status === "FAILED") {
      return res.status(500).json({ message: "transaction failed" });
    }

    if (isTransactionExists.status === "REVERSED") {
      return res
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

  const balance = await isFromAccountExists.getBalance();

  if (balance < amount) {
    return res
      .status(400)
      .json({ message: `Insufficient Balance: Current balance- ${balance}` });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const newTransaction = new TransactionModel({
      fromAccount,
      toAccount,
      idempotencyKey,
      amount,
      status: "PENDING",
    });

    await newTransaction.save({ session });

    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
          transaction: newTransaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount,
          transaction: newTransaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    await TransactionModel.findByIdAndUpdate(
      newTransaction._id,
      { status: "COMPLETED" },
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Transaction completed successfully", newTransaction
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      message: "Transaction failed",
      error: error.message,
    });
  }
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
      message: "Invalid toAccount",
    });
  }

  let fromAccountExists = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromAccountExists) {
    return res.status(400).json({
      message: "System user account not found",
    });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    let newTransaction = new TransactionModel({
      fromAccount: fromAccountExists._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING",
    });

    await newTransaction.save({ session });

    await ledgerModel.create(
      [
        {
          account: toAccount,
          amount,
          transaction: newTransaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    await ledgerModel.create(
      [
        {
          account: fromAccountExists._id,
          amount,
          transaction: newTransaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    newTransaction.status = "COMPLETED";

    await newTransaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Transaction completed successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      message: "Transaction failed",
      error: error.message,
    });
  }
};
//   yaha hum create nhi use kr rhe isliye session create nhi hoga
