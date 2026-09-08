import express from "express";
import {
  getAllHistory,
  handlehistory,
  handleview,
  removeHistory,
} from "../Controller/history.js";

const routes = express.Router();

routes.post("/:videoId", handlehistory);
routes.get("/:userId", getAllHistory);
routes.post("/views/:videoId", handleview);
routes.delete("/:historyId", removeHistory);
export default routes;
