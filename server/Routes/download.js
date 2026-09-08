import express from "express";
import { downloadVideo,getDownloads,removeDownload } from "../Controller/download.js";

const routes = express.Router();

routes.post("/", downloadVideo);
routes.get("/:userId", getDownloads);
routes.delete("/:downloadId", removeDownload);
export default routes;