import express from "express";
import { login,updateProfile,upgradePlan,createCheckoutSession,verifyPayment } from "../Controller/auth.js";


const routes = express.Router();

routes.post("/login", login);
routes.patch("/update/:id", updateProfile);
routes.post("/upgrade-plan", upgradePlan);
routes.post("/create-checkout-session", createCheckoutSession);
routes.post("/verify-payment",verifyPayment);
export default routes;