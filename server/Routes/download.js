import express from "express";
import { downloadVideo,getDownloads } from "../Controller/download.js";

const routes = express.Router();

// Download video
routes.post("/", downloadVideo);
routes.get("/:userId", getDownloads);

export default routes;