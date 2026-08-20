"use client";

import { useState } from "react";
import { useUser } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const OTPVerification = () => {
  const {
  verifyLoginOTP,
  pendingUserId,
  requiresOTP,
}: any = useUser();
const [otp, setOtp] = useState("");
const [loading, setLoading] = useState(false);

if (!requiresOTP || !pendingUserId) {
  return null;
}


  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const result = await verifyLoginOTP(otp);

      if (result.success) {
        toast.success("Login verified successfully");
      } else {
        toast.error(result.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error("OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
        <h2 className="mb-2 text-2xl font-semibold">
          Verify Your Login
        </h2>

        <p className="mb-6 text-sm text-gray-500">
          We detected a login from a new device or location.
          Please enter the OTP sent to your registered email.
        </p>

        <Input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value.replace(/\D/g, "")
            )
          }
          className="mb-4 text-center text-lg tracking-widest"
        />

        <Button
          className="w-full"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </Button>
      </div>
    </div>
  );
};

export default OTPVerification;