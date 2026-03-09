import mongoose from "mongoose";
import bcrypt from "bcrypt"

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is Required"],
      trim: true,
      lowercase: true,
      unique: [true, "Email already exists"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, " Invalid email Address "],
    },
    name: {
      type: String,
      required: [true, "Name is required to create account"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "password should contain more than 6 words"],
      select: false, //   jabtak hum nhi bol rhe ki password ko leke aao tab tak koi bhi query me password nhi aayega as humne bydefault false kar diya hai
    },
    systemUser: {
      type: Boolean,
      default: false,
      immutable: true,
      select: false
    }
  },
  { timestamps: true },
);

//  Jab bhi hum user ke data ko save karenge tab-tab ye fn chalega

UserSchema.pre("save", async function() {
    if(!this.isModified("password")){
        return ;
    }
    const hash = await bcrypt.hash(this.password, 10 );
    this.password = hash;
})

UserSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare( password, this.password);
}

export const User = mongoose.model("User", UserSchema);


