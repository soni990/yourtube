import express from "express";
import { handlelike, getAllLikes,removeLike } from "../Controller/like.js";

const routes = express.Router();

routes.post("/:videoId", handlelike);
routes.get("/:userId", getAllLikes);
routes.delete("/:likeId", removeLike);
export default routes;
