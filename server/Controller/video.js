import video from "../Modals/videos.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const uploadVideo = async (req, res) => {
  if (req.file === undefined) {
    return res
      .status(404)
      .json({ message: "plz upload a mp4 video file only" });
  }

  try {
    const result = await cloudinary.uploader.upload_large(req.file.path, {
      resource_type: "video",
      folder: "yourtube/videos",
      use_filename: true,
      unique_filename: true,
    });

    fs.unlink(req.file.path, (error) => {
      if (error) {
        console.error("Temporary file delete failed:", error);
      }
    });

    const file = new video({
      videotitle: req.body.videotitle,
      filename: req.file.originalname,
      filepath: result.secure_url,
      filetype: req.file.mimetype,
      filesize: String(result.bytes),
      videochannel: req.body.videochannel,
      uploader: req.body.uploader,
    });

    await file.save();

    res.status(201).json({
      message: "file uploaded successfully",
      videoUrl: result.secure_url,
    });
  } catch (error) {
    console.error("CLOUDINARY UPLOAD ERROR:", error);

    if (req.file?.path) {
      fs.unlink(req.file.path, () => {});
    }

    return res.status(500).json({
      message: "Error occurred while uploading video",
      error: error.message,
    });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    const files = await video.find();
    return res.status(200).send(files);
  } catch (error) {
    console.error("Error while fetching videos:", error);

    return res
      .status(500)
      .json({ message: "Error occurred while fetching videos" });
  }
};
