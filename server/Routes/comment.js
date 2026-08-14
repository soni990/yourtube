
import express from "express";
import { deletecomment, editcomment, getAllcomment, postcomment,translatecomment, likecomment,dislikecomment, reportcomment } from "../Controller/comment.js";

const routes = express.Router();

routes.get("/:videoid", getAllcomment);
routes.post("/postcomment", postcomment);
routes.delete("/deletecomment/:id",deletecomment);
routes.post("/editcomment/:id",editcomment)
routes.post("/translatecomment", translatecomment);
routes.post("/likecomment/:id", likecomment);
routes.post("/dislikecomment/:id", dislikecomment);
routes.post("/reportcomment/:id", reportcomment);

export default routes;
