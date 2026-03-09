import mongoose from "mongoose";
import { ledgerModel } from "./ledger.model.js";

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Account Must be associated with a user"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "FROZEN", "CLOSED"],
        message: "Status can be either ACTIVE , FROZEN OR CLOSED",
      },
      default: "ACTIVE",
    },
    currency: {
      type: String,
      required: [true, "Currency is required to create a account"],
      default: "INR",
    },
  },
  { timestamps: true },
);

accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function () {
  const balanceData = await ledgerModel.aggregate([
    {
      $match: { account: this._id },
    },
    { $group: {
        _id: null,
        totalDebit:{
          $sum: {
            $cond: [ 
              {$eq: ["$type","DEBIT"]},
              "$amount", 0
            ]
          }
        },
        totalCredit:{
          $sum:{
            $cond:[
              {$eq:["$type","CREDIT"]}, "$amount",0]
            }
        }
       } 
    },
    {
      $project:{
        balance:{ $subtract: ["$totalCredit", "$totalDebit" ] }
      }
    }
  ]);

  if(balanceData.length ===0){
    return 0;
  }

  return balanceData[0].balance;

};

export const accountModel = mongoose.model("account", accountSchema);
