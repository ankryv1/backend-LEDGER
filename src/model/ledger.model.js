import mongoose from "mongoose";

const ledgerSchema = new mongoose.Schema(
  {
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: [true, "User must have a account for Ledger"],
      index: true,
      immutable: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      immutable: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: [true, "Ledger must be associated with a transaction"],
      index: true,
      immutable: true,
    },
    type: {
      type: String,
      enum: {
        values: ["CREDIT", "DEBIT"],
        message: "Must be between Credit or debit",
      },
      immutable: true,
      required: [true, "Ledger type is required"],
    },
  },
  { timestamps: true },
);

function preventLedgerModifiocation(){
    throw new Error("Ledger cannot be updated or deleted once created")
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModifiocation);
ledgerSchema.pre("findOneAndDelete", preventLedgerModifiocation);
ledgerSchema.pre("deleteMany", preventLedgerModifiocation);
ledgerSchema.pre("updateMany", preventLedgerModifiocation)
ledgerSchema.pre("deleteOne", preventLedgerModifiocation);

export const ledgerModel = mongoose.model("Ledger", ledgerSchema);