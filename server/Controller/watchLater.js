import watchLater from "../Modals/watchLater.js";
import mongoose from "mongoose";

export const handleWatchLater = async (req, res) => {
  const { userId } = req.body;
  const { videoId } = req.params;
  try {
    const existingWatchLater = await watchLater.findOne({
      viewer: userId,
      videoid: videoId,
    });
    if (existingWatchLater) {
      await watchLater.findByIdAndDelete(existingWatchLater._id);
      return res.status(200).json({ watchLater: false });
    } else {
      await watchLater.create({ viewer: userId, videoid: videoId });
      return res.status(200).json({ watchLater: true });
    }
  } catch (error) {
    console.error("Error handling watchlater:", error);
    return res.status(500).json({ message: "Error handling watchlater" });
  }
};

export const getAllWatchLater = async (req, res) => {
  const { userId } = req.params;
  try {
    const watchLatervideo = await watchLater
      .find({ viewer: userId })
      .populate({
        path: "videoid",
        model: "videofiles",
      })
      .exec();
    return res.status(200).json(watchLatervideo);
  } catch (error) {
    console.error("Error fetching watchlater:", error);
    return res.status(500).json({ message: "Error fetching watchlater" });
  }
};
export const removeWatchLater = async (req, res) => {
  const { watchId } = req.params;

  try {
    const deletedWatchLater = await watchLater.findByIdAndDelete(watchId);

    if (!deletedWatchLater) {
      return res.status(404).json({
        message: "Watch later video not found",
      });
    }

    return res.status(200).json({
      message: "Video removed from watch later",
      watchLater: false,
    });
  } catch (error) {
    console.error("Error removing watchlater:", error);

    return res.status(500).json({
      message: "Error removing watchlater",
    });
  }
};