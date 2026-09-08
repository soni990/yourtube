import express from "express";
import {
  handleWatchLater,
  getAllWatchLater,
  removeWatchLater
} from "../Controller/watchLater.js";

const routes = express.Router();

routes.post("/:videoId", handleWatchLater);
routes.get("/:userId", getAllWatchLater);
routes.delete("/:watchId", removeWatchLater);
export default routes;
