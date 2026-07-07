import express from "express"
import { createParty,joinParty,getParty } from "../Controller/watchParty.js"

const routes=express.Router()
routes.post("/create",createParty)
routes.post("/join",joinParty)
routes.get("/:partyId", getParty);
export default routes