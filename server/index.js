import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRoutes from "./Routes/auth.js";
import videoRoutes from "./Routes/video.js";
import likeRoutes from "./Routes/like.js";
import watchLaterRoutes from "./Routes/watchLater.js";
import historyRoutes from "./Routes/history.js"
import commentRoutes from "./Routes/comment.js"

import path from "path";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join("uploads")));
app.get("/", (req, res) => {
  res.send("You tube backend is running");
});
app.use(bodyParser.json());
app.use("/user", userRoutes);
app.use("/video", videoRoutes);
app.use("/like", likeRoutes);
app.use("/watchlater", watchLaterRoutes);
app.use("/history", historyRoutes);
app.use("/comment", commentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const DBURL = process.env.DB_URL;
mongoose
  .connect(DBURL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.log(error);
  });
