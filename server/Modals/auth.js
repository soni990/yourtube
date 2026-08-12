import mongoose from "mongoose";
const userSchema = mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true,required: true },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  plan: {
  type: String,
  enum: ["free", "bronze", "silver", "gold"],
  default: "free",
  },
  joinedon: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
