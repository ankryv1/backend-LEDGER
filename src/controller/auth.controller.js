import { User } from "../model/user.model.js";
import jwt from "jsonwebtoken";
import  {sendRegistrationEmail} from '../services/email.service.js'


export const userRegisterController = async (req, res) => {
  const { email, name, password } = req.body;

  const isExists = await User.findOne({ email });
  if (isExists) {
    return res.status(422).json({
      message: "User already exists with this email",
      status: "false",
    });
  }
  const newUser = await User.create({
    email,
    password,
    name,
  });

  const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token);
   await sendRegistrationEmail(newUser.email, newUser.name)
  res
    .status(201)
    .json({
      message: "User successfully registered",
      user: { _id: newUser._id, email: newUser.email, name: newUser.name },
      token
    });
   
};

export const userLoginController = async (req, res) =>{
    const {email, password} = req.body;

    const user = await User.findOne({email}).select("password");
    if(!user){
       return res.status(400).json({message:"User does not belong login"});
    }
    const isValidPassword = await user.comparePassword(password);

    if(!isValidPassword){
        res.status(400).json({message:"User email, password wrong"});
    }
    
     const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token);
  res
    .status(200)
    .json({
      message: "User successfully login",
      user: { _id: user._id, email: user.email, name: user.name },
      token
    });

}


















