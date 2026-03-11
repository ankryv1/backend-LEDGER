import mongoose from 'mongoose'

const tokenBlackListSchema = new mongoose.Schema({
    token:{
        type:String,
        required: true,
        required:[true, "token is required to blacklist"],
        unique: [ true, "Token is already blacklisted"],
    },
    blackListedAt:{
        type:Date,
        default:Date.now,
        immutable: true
    }
},{timestamps:true});

tokenBlackListSchema.index({ createdAt:1},{
    expireAfterSeconds:60*60*24*3
} )

export const tokenBlacklistModel = mongoose.model("TokenBlacklistSchema", tokenBlackListSchema);