import comment from "../Modals/comment.js";
import mongoose from "mongoose";

export const postcomment = async (req, res) => {
  try {
    const postcomment = new comment(req.body);
    await postcomment.save();
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.log("comment error :", error);
    return res.status(500).json({ message: "comment error..." });
  }
};
export const getAllcomment = async (req, res) => {
  const { videoid } = req.params;
  try {
    const commentvideo = await comment.find({ videoid: videoid });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error("comment error :", error);
    return res.status(500).json({ message: "comment error..." });
  }
};
export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unvailable");
  }
  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error("comment error :", error);
    return res.status(500).json({ message: "comment error..." });
  }
};
export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unvailable");
  }
  try {
    const updatecomment = await comment.findByIdAndUpdate(_id, {
      $set: { commentbody: commentbody },
    });
    return res.status(200).json(updatecomment);
  } catch (error) {
    console.error("comment error :", error);
    return res.status(500).json({ message: "comment error..." });
  }
};
