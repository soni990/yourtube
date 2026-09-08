"use client";

import Link from "next/link";

export default function PaymentCancel() {
  return (
   <div className="flex flex-col items-center justify-center min-h-screen px-4 gap-4 sm:gap-5">
  <h1 className="text-2xl sm:text-3xl font-bold text-red-600 text-center">
    Payment Cancelled ❌
  </h1>

  <Link href="/" className="text-blue-600 underline">
    Go Back Home
  </Link>
</div>
  );
}