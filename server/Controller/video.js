import video from "../Modals/videos.js";
export const uploadVideo = async (req, res) => {
  if (req.file === undefined) {
    return res
      .status(404)
      .json({ message: "plz upload a mp4 video file only" });
  } else {
    try {
      const file = new video({
        videotitle: req.body.videotitle,
        filename: req.file.filename,
        filepath: `/uploads/${req.file.filename}`,
        originalname: req.file.originalname,
        filetype: req.file.mimetype,
        filesize: req.file.size,
        videochannel: req.body.videochannel,
        uploader: req.body.uploader,
      });
      await file.save();
      res.status(201).json("file uploaded successfully");
    } catch (error) {
      console.error("Error occurred while uploading video:", error);
      return res
        .status(500)
        .json({ message: "Error occurred while uploading video" });
    }
  }
};
export const getAllVideos = async (req, res) => {
  try {
    const files = await video.find();
    return res.status(200).send(files);
  } catch (error) {
    console.error("Login error :", error);
    return res
      .status(500)
      .json({ message: "Error occurred while fetching videos" });
  }
};
