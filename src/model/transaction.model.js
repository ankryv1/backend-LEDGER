import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
    fromAccount:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        index:true,
        required: [true, "User must be asssociated with a from account"],

    },
    toAccount: {
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        index:true,
        required: [true, "User must be asssociated with a to account"],
    },
    status: {
        type:String,
        enum:{
            values:["COMPLETED", "PENDING ", "FAILED", "REVERSED"],
            message:"StAtus can either PENDING, COMPLETED, FAILED, REVERSED"
        },
        default:"PENDING"
    },
    amount:{
        type: Number,
        required:true,
        min:[0, "Transaction value cannot be negative"]
    },
    idempotencyKey:{
        type: String,
        required: true,
        index: true,
        unique: true
    }    //    ek transaction ke liye ek hi key hogi jo musse baar baar ek hi trans ke liye baar baar payment krne se rokegi 
}, {timestamps: true})

export const TransactionModel = mongoose.model("Transaction", transactionSchema)
