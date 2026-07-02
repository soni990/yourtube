import video from "../Modals/videos.js";
import history from "../Modals/history.js";
import mongoose from "mongoose";

export const handlehistory = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
      await history.create({ viewer: userId, videoid: videoId });
      await video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });
      return res.status(200).json({ history: true });
  } catch (error) {
    console.error("Error handling history:", error);
    return res.status(500).json({ message: "Error handling history" });
  }
};
export const handleview = async (req, res) => {
  const { videoId } = req.params;
  try {
    await video.findByIdAndUpdate(videoId, { $inc: { views: -1 } });
  } catch (error) {
    console.error("Error fetching views:", error);
    return res.status(500).json({ message: "Error fetching views" });
  }
};
export const getAllHistory = async (req, res) => {
  const { userId } = req.params;
  try {
    const historyvideo = await history
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();
    return res.status(200).json(historyvideo);
  } catch (error) {
    console.error("Error fetching history:", error);
    return res.status(500).json({ message: "Error fetching history" });
  }
};
