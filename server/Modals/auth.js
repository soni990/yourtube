import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String },

  email: {
    type: String,
    unique: true,
    required: true,
  },

  channelname: { type: String },
  description: { type: String },
  image: { type: String },

  plan: {
    type: String,
    enum: ["free", "bronze", "silver", "gold"],
    default: "free",
  },

  // Task 5 - Theme
  theme: {
    type: String,
    enum: ["light", "dark"],
    default: "dark",
  },

  // Task 5 - Security
  lastLoginCity: {
    type: String,
    default: null,
  },

  lastLoginState: {
    type: String,
    default: null,
  },

  lastLoginDevice: {
    type: String,
    default: null,
  },

  // OTP
  otp: {
    type: String,
    default: null,
  },

  otpExpiresAt: {
    type: Date,
    default: null,
  },

  joinedon: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", userSchema);
