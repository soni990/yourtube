import users from "../Modals/auth.js";
import subscriptions from "../Modals/subscription.js";
import sendEmail from "../utils/sendEmail.js";
import mongoose from "mongoose";
import "dotenv/config";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const login = async (req, res) => {
  const { name, email, image } = req.body;

  try {
    let existingUser = await users.findOne({ email });

    if (existingUser) {
      return res.status(200).json({
        result: existingUser,
      });
    }

    const newUser = await users.create({
      name,
      email,
      image,
      plan: "free",
    });

    return res.status(201).json({
      result: newUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      const user = await users.findOne({ email });

      return res.status(200).json({
        result: user,
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
