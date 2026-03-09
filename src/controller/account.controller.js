import mongoose from "mongoose";
import { accountModel } from "../model/account.model.js";
import { User } from "../model/user.model.js";

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

export const getUserAccountController = async (req, res) =>{
  const userAccount = await accountModel.findOne({user:req.user._id});
  if(!userAccount){
   return res.status(400).json({message:"User does not exists", success:false})
  }

  res.status(200).json({ message:"Account details fetched successfully", userAccount })
}


export const getAccountBalanceController = async (req, res) =>{
  const {accountId} = req.params;
  const user = req.user;
  const doesAccountExist = await accountModel.findOne({_id:accountId, user:user._id});

  if(!doesAccountExist){
   return res.status(401).json({message:"Accouhnt does not exists wring account ID", success: false});
   
  }
  const userAccountBalance = await doesAccountExist.getBalance();
   return res.status(200).json({message:"Sucessfully fetched", success: true, balance: userAccountBalance})
}


