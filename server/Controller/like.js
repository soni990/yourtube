import video from "../Modals/videos.js";
import like from "../Modals/like.js";
import mongoose from "mongoose";

export const handlelike = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    const existingLike = await like.findOne({
      viewer: userId,
      videoid: videoId,
    });
    if (existingLike) {
      await like.findByIdAndDelete(existingLike._id);
      await video.findByIdAndUpdate(videoId, { $inc: { Like: -1 } });
      return res.status(200).json({ liked: false });
    } else {
      await like.create({ viewer: userId, videoid: videoId });
      await video.findByIdAndUpdate(videoId, { $inc: { Like: 1 } });
      return res.status(200).json({ liked: true });
    }
  } catch (error) {
    console.error("Error handling like:", error);
    return res.status(500).json({ message: "Error handling like" });
  }
};

export const getAllLikes = async (req, res) => {
  const { userId } = req.params;
  try {
    const likevideo = await like
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();
    return res.status(200).json(likevideo);
  } catch (error) {
    console.error("Error fetching likes:", error);
    return res.status(500).json({ message: "Error fetching likes" });
  }
};
