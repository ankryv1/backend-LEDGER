import mongoose from "mongoose";
import { accountModel } from "../model/account.model.js";

export const createNewAccountController = async (req, res) => {
  const user = req.user;
  const { status, currency } = req.body || {};

  const doesAccExists = await accountModel.findOne({user: user._id})
  if(doesAccExists){
    return res.status(400).json({message:"User already has a account", success:"false"});
  }
  const newAccount = await accountModel.create({
    user: user._id,
    status,
    currency,
  });

  return res.status(201).json({
    success: true,
    message: " Account Successfully created",
    data: newAccount,
  });
};
