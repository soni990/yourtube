import express from "express";
import {
  handleWatchLater,
  getAllWatchLater,
} from "../Controller/watchLater.js";

const routes = express.Router();

routes.post("/:videoId", handleWatchLater);
routes.get("/:userId", getAllWatchLater);

export default routes;
