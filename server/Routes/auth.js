import express from "express";
import { login,updateProfile,upgradePlan,createCheckoutSession,verifyPayment,verifyOTP,updateTheme } from "../Controller/auth.js";


const routes = express.Router();

routes.post("/login", login);
routes.patch("/update/:id", updateProfile);
routes.post("/upgrade-plan", upgradePlan);
routes.post("/create-checkout-session", createCheckoutSession);
routes.post("/verify-payment",verifyPayment);
routes.post("/verify-otp", verifyOTP);
routes.patch("/update-theme/:id", updateTheme);
export default routes;