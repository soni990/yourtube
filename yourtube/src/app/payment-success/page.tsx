"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();

  const paymentId = searchParams.get("paymentId");
  const orderId = searchParams.get("orderId");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Payment Successful</h1>

        {paymentId && <p className="mt-2">Payment ID: {paymentId}</p>}

        {orderId && <p className="mt-1">Order ID: {orderId}</p>}
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
