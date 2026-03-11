import { tokenBlacklistModel } from "../model/blackList.model.js";
import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";

export const authMiddlewear = async function (req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Unauthorized Login " });
  }
  const isThisBlacklistedToken = await tokenBlacklistModel.findOne({token})
  if(isThisBlacklistedToken){
    return res.status(401).json({
      message:"Invalid token ,Does not existssss"
    })
  }
  const decoded = await jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  req.user = user;
  return next();
};


export const authSystemUserMiddlewear = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!token) {
    return res.status(403).json({ message: "Unauthorized Login " });
  }

  const isThisBlacklistedToken = await tokenBlacklistModel.findOne({token})
  if(isThisBlacklistedToken){
    return res.status(401).json({
      message:"Invalid token ,Does not exists"
    })
  }
  const user = await User.findById(decoded.userId).select("+systemUser");
  if (!user.systemUser) {
    return res.status(403).json({
      message: "Forbidden access, not system user",
    });
  }
  req.user = user;
  next();
};
