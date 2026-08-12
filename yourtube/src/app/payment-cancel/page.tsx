"use client";

import Link from "next/link";

export default function PaymentCancel() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-5">
      <h1 className="text-3xl font-bold text-red-600">
        Payment Cancelled ❌
      </h1>

      <Link href="/" className="text-blue-600 underline">
        Go Back Home
      </Link>
    </div>
  );
}