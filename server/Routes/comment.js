
import express from "express";
import { deletecomment, editcomment, getAllcomment, postcomment } from "../Controller/comment.js";

const routes = express.Router();

routes.get("/:videoid", getAllcomment);
routes.post("/postcomment", postcomment);
routes.delete("/deletecomment/:id",deletecomment);
routes.post("/editcomment/:id",editcomment)

export default routes;
