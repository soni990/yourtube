import express from "express";
import { uploadVideo,getAllVideos } from "../Controller/video.js";
import upload from "../fileHelper/fileHelper.js";

const routes = express.Router();
routes.post("/upload",upload.single("file"), uploadVideo);
routes.get("/getallvideos", getAllVideos);
export default routes;