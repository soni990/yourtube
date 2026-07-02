import express from "express";
import { handlelike, getAllLikes } from "../Controller/like.js";

const routes = express.Router();

routes.post("/:videoId", handlelike);
routes.get("/:userId", getAllLikes);

export default routes;
