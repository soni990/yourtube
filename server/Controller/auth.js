import users from "../Modals/auth.js";
import mongoose from "mongoose";
export const login = async (req, res) => {
  const { name, email, image } = req.body;

  try {
    const existingUser = await users.findOne({ email });

    if (!existingUser) {
      const newUser = await users.create({ name, email, image });
      return res.status(201).json({ result: newUser });
    } else {
      return res.status(200).json({ result: existingUser });
    }
  } catch (error) {
    console.log("Login error...", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const updateProfile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({ message: "User Unavailable..." });
  }
  try {
    const updateData = await users.findByIdAndUpdate(
      _id,
      {
        $set: {
          channelname: channelname,
          description: description,
        },
      },
      { new: true },
    );
    return res.status(201).json(updateData);
  } catch (error) {
  console.error(error);

  return res.status(500).json({
    message: error.message,
    error,
  });
}
};
