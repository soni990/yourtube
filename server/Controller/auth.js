import users from "../Modals/auth.js";
import subscriptions from "../Modals/subscription.js";
import sendEmail from "../utils/sendEmail.js";
import mongoose from "mongoose";
import "dotenv/config";
import Stripe from "stripe";
import crypto from "crypto";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const login = async (req, res) => {
  const { name, email, image, city, state, deviceId } = req.body;

  try {
    let existingUser = await users.findOne({ email });

    // Current IST time
    const istTime = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());

    const [hour, minute] = istTime.split(":").map(Number);

    const currentMinutes = hour * 60 + minute;

    // 10:00 AM to 12:00 PM IST
    const isLightTime = currentMinutes >= 600 && currentMinutes <= 720;

    const automaticTheme = isLightTime ? "light" : "dark";

    // --------------------------------
    // NEW USER
    // --------------------------------
    if (!existingUser) {
      const newUser = await users.create({
        name,
        email,
        image,
        plan: "free",

        theme: automaticTheme,

        lastLoginCity: city || null,
        lastLoginState: state || null,
        lastLoginDevice: deviceId || null,
      });

      return res.status(201).json({
        result: newUser,
        requiresOTP: false,
      });
    }

    // --------------------------------
    // CHECK NEW LOCATION / DEVICE
    // --------------------------------

    const isNewCity =
      city &&
      existingUser.lastLoginCity &&
      city.toLowerCase() !== existingUser.lastLoginCity.toLowerCase();

    const isNewState =
      state &&
      existingUser.lastLoginState &&
      state.toLowerCase() !== existingUser.lastLoginState.toLowerCase();

    const isNewDevice =
      deviceId &&
      existingUser.lastLoginDevice &&
      deviceId !== existingUser.lastLoginDevice;

    const requiresOTP = isNewCity || isNewState || isNewDevice;

    // --------------------------------
    // NEW LOCATION / DEVICE
    // SEND OTP
    // --------------------------------

    if (requiresOTP) {
      const otp = crypto.randomInt(100000, 1000000).toString();

      const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

      existingUser.otp = otp;
      existingUser.otpExpiresAt = otpExpiresAt;

      await existingUser.save();

      try {
        await sendEmail(
          existingUser.email,
          "Your OTP for Login Verification",
          `
            <h2>Login Verification</h2>

            <p>Hello ${existingUser.name || "User"},</p>

            <p>
              We detected a login from a new
              ${isNewDevice ? "device" : "location"}.
            </p>

            <h2>Your OTP: ${otp}</h2>

            <p>This OTP will expire in 5 minutes.</p>

            <p>
              If you did not attempt to login, please secure your account.
            </p>
          `,
        );
      } catch (emailError) {
        console.log("OTP email sending failed:", emailError);

        return res.status(500).json({
          message: "Unable to send OTP",
        });
      }

      return res.status(200).json({
        requiresOTP: true,
        message: "OTP verification required",
        userId: existingUser._id,
      });
    }

    // --------------------------------
    // NORMAL LOGIN
    // --------------------------------

    existingUser.theme = automaticTheme;

    if (city) {
      existingUser.lastLoginCity = city;
    }

    if (state) {
      existingUser.lastLoginState = state;
    }

    if (deviceId) {
      existingUser.lastLoginDevice = deviceId;
    }

    await existingUser.save();

    return res.status(200).json({
      result: existingUser,
      requiresOTP: false,
    });
  } catch (error) {
    if (error.code === 11000) {
      const user = await users.findOne({ email });

      return res.status(200).json({
        result: user,
        requiresOTP: false,
      });
    }

    console.log("Login error...", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
export const updateProfile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({ message: "User Unavailable..." });
  }
  try {
    const updateData = await users.findByIdAndUpdate(
      _id,
      {
        $set: {
          channelname: channelname,
          description: description,
        },
      },
      { new: true },
    );
    return res.status(201).json(updateData);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: error.message,
      error,
    });
  }
};
export const upgradePlan = async (req, res) => {
  try {
    const { userId, plan, paymentId, orderId } = req.body;

    if (!["bronze", "silver", "gold"].includes(plan)) {
      return res.status(400).json({
        message: "Invalid plan",
      });
    }

    const user = await users.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingSubscription = await subscriptions.findOne({
      paymentId,
    });

    if (existingSubscription) {
      return res.status(200).json({
        success: true,
        message: "Subscription already activated",
        user,
      });
    }
    user.plan = plan;

    await user.save();

    const prices = {
      bronze: 199,
      silver: 399,
      gold: 799,
    };
    await subscriptions.create({
      userId,
      plan,
      amount: prices[plan],
      paymentId,
      orderId,
    });

    try {
      await sendEmail(
        user.email,

        "Subscription Activated Successfully",

        `
  <h2>Hello ${user.name}</h2>

  <p>Your subscription has been activated.</p>

  <p>
  <b>Plan:</b> ${plan}
  </p>

  <p>
  <b>Amount:</b> ₹${prices[plan]}
  </p>

  <p>
  <b>Payment ID:</b> ${paymentId}
  </p>

  <p>
  <b>Date:</b> ${new Date().toLocaleDateString()}
  </p>
  
  <p>
  Thank you for using our platform.
  </p>
  `,
      );
    } catch (emailError) {
      console.log("Email sending failed:", emailError);
    }
    res.status(200).json({
      success: true,
      message: `${plan} plan activated successfully`,
      user,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};
export const createCheckoutSession = async (req, res) => {
  try {
    const { userId, plan } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User id required",
      });
    }

    if (!["bronze", "silver", "gold"].includes(plan)) {
      return res.status(400).json({
        message: "Invalid plan",
      });
    }

    const prices = {
      bronze: 199,
      silver: 399,
      gold: 799,
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `${plan.toUpperCase()} Plan`,
            },
            unit_amount: prices[plan] * 100,
          },
          quantity: 1,
        },
      ],

      success_url: `http://localhost:3000/payment-success?userId=${userId}&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/payment-cancel`,
    });

    res.json({
      url: session.url,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Stripe Error",
    });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        message: "Payment not completed",
      });
    }

    const paymentId = session.payment_intent;

    res.status(200).json({
      success: true,
      paymentId,
      amount: session.amount_total / 100,
      status: session.payment_status,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Payment verification failed",
    });
  }
};
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp, city, state, deviceId } = req.body;

    const user = await users.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.otp || !user.otpExpiresAt) {
      return res.status(400).json({
        message: "OTP not found or expired",
      });
    }

    if (new Date() > user.otpExpiresAt) {
      user.otp = null;
      user.otpExpiresAt = null;

      await user.save();

      return res.status(400).json({
        message: "OTP expired",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // OTP correct → update login information
    user.otp = null;
    user.otpExpiresAt = null;

    if (city) {
      user.lastLoginCity = city;
    }

    if (state) {
      user.lastLoginState = state;
    }

    if (deviceId) {
      user.lastLoginDevice = deviceId;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      result: user,
    });
  } catch (error) {
    console.log("OTP verification error:", error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
export const updateTheme = async (req, res) => {
  try {
    const { id } = req.params;
    const { theme } = req.body;

    if (!["light", "dark"].includes(theme)) {
      return res.status(400).json({
        message: "Invalid theme",
      });
    }

    const user = await users.findByIdAndUpdate(
      id,
      {
        $set: {
          theme: theme,
        },
      },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Theme updated successfully",
      result: user,
    });
  } catch (error) {
    console.log("Theme update error:", error);

    return res.status(500).json({
      message: "Unable to update theme",
    });
  }
};
