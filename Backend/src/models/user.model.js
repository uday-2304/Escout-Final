import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, "Password is required"]
    },
    refreshToken: {
      type: String
    },
    coverImage: {
      type: String
    }, // Cloudinary URL
    role: {
      type: String,
      enum: ["player", "scout"],
      default: "player"
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    passwordResetOtp: {
      type: String
    },
    passwordResetOtpExpires: {
      type: Date
    },
    phoneNumber: {
      type: String
    },
    instaHandle: {
      type: String
    },
  },
  {
    timestamps: true
  }
)

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// This is the code used in the usercontroller code for access token (Function is called generateAccessToken)
//userschema rrepresents extraccting the user object details from the database
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    //user details
    {
      _id: this._id,
      email: this.email,
      userName: this.userName,
      role: this.role
    },
    process.env.ACCESS_TOKEN_SECRET,   // secret key
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY, //expiration
    }
  );
};
// This is the code used in the usercontroller code for access token (Function is called generateTRefreshoken)
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema); // User object contains details of the user 
