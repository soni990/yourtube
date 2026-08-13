"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import axiosinstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/authContext";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const userContext = useUser() as
    | { login?: (user: any) => void }
    | null
    | undefined;

  const login = userContext?.login;

  const [status, setStatus] = useState("Verifying payment...");

  // Prevent duplicate execution
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) {
      return;
    }

    const verifyAndActivatePlan = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        const userId = searchParams.get("userId");
        const plan = searchParams.get("plan");

        if (!sessionId || !userId || !plan) {
          setStatus("Invalid payment information.");
          return;
        }

        // Prevent same Stripe session from being processed twice
        const processedSession = sessionStorage.getItem(
          "processed_payment_session"
        );

        if (processedSession === sessionId) {
          setStatus("Payment already processed.");
          return;
        }

        processedRef.current = true;

        // -----------------------------------
        // 1. VERIFY STRIPE PAYMENT
        // -----------------------------------
        const paymentResponse = await axiosinstance.post(
          "/user/verify-payment",
          {
            sessionId,
          }
        );

        if (!paymentResponse.data.success) {
          setStatus("Payment verification failed.");
          processedRef.current = false;
          return;
        }

        const paymentId = paymentResponse.data.paymentId;

        // -----------------------------------
        // 2. ACTIVATE SUBSCRIPTION
        // -----------------------------------
        const upgradeResponse = await axiosinstance.post(
          "/user/upgrade-plan",
          {
            userId,
            plan,
            paymentId,
            orderId: sessionId,
          }
        );

        if (upgradeResponse.data.success) {
          // Mark session as processed
          sessionStorage.setItem(
            "processed_payment_session",
            sessionId
          );

          // Update frontend user
          if (login && upgradeResponse.data.user) {
            login(upgradeResponse.data.user);
          }

          setStatus(
            `${plan.toUpperCase()} plan activated successfully!`
          );
        } else {
          setStatus(
            "Payment successful, but plan activation failed."
          );
          processedRef.current = false;
        }
      } catch (error: any) {
        console.error(
          "Payment verification error:",
          error
        );

        setStatus(
          error.response?.data?.message ||
            "Something went wrong while activating your plan."
        );

        processedRef.current = false;
      }
    };

    verifyAndActivatePlan();
  }, [searchParams, login]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">
          {status}
        </h1>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}