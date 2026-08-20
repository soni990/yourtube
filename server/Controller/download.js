import Download from "../Modals/download.js";
import User from "../Modals/auth.js";
import Video from "../Modals/videos.js";
import axios from "axios";   // 👈 naya import (path ki zaroorat nahi rahi)

export const downloadVideo = async (req, res) => {
  try {
    const { userId, videoId } = req.body;

    // Check user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check video
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check daily download limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const downloadCount = await Download.countDocuments({
      userId,
      downloadedAt: { $gte: today, $lt: tomorrow },
    });

    let limit = 1;
    let message = "Free users can download only 1 video per day.";

    if (user.plan === "bronze") {
      limit = 5;
      message = "Bronze users can download only 5 videos per day.";
    } else if (user.plan === "silver") {
      limit = 10;
      message = "Silver users can download only 10 videos per day.";
    } else if (user.plan === "gold") {
      limit = 20;
      message = "Gold users can download only 20 videos per day.";
    }

    if (downloadCount >= limit) {
      return res.status(403).json({ message });
    }

    // Save download history
    const newDownload = new Download({
      userId,
      videoId,
      planAtDownload: user.plan,
    });
    await newDownload.save();

    // ---------- FIX: Cloudinary se stream karke bhejo ----------
    const cloudinaryResponse = await axios.get(video.filepath, {
      responseType: "stream",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${video.filename}"`
    );
    res.setHeader("Content-Type", video.filetype || "video/mp4");

    cloudinaryResponse.data.pipe(res);
    // ------------------------------------------------------------

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getDownloads = async (req, res) => {
  try {
    const downloads = await Download.find({
      userId: req.params.userId,
    }).populate("videoId");

    res.status(200).json(downloads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch downloads" });
  }
};