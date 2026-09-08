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
export const removeHistory = async (req, res) => {
  const { historyId } = req.params;

  try {
    const deletedHistory = await history.findByIdAndDelete(historyId);

    if (!deletedHistory) {
      return res.status(404).json({
        message: "History item not found",
      });
    }

    return res.status(200).json({
      message: "History removed successfully",
    });
  } catch (error) {
    console.error("Error removing history:", error);

    return res.status(500).json({
      message: "Error removing history",
    });
  }
};