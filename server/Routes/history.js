import express from "express";
import {
  getAllHistory,
  handlehistory,
  handleview,
} from "../Controller/history.js";

const routes = express.Router();

routes.post("/:videoId", handlehistory);
routes.get("/:userId", getAllHistory);
routes.post("/views/:videoId", handleview);
export default routes;
