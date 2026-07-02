"use client"
import Historycontent from "@/components/Historycontent";
import { Suspense } from "react";

const page = () => {
  return (
    <div className="flex-1 p-6" >
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Watch History</h1>
        <Suspense fallback={<div>Loading...</div>}>
          <Historycontent />
        </Suspense>
      </div>
    </div>
  );
};

export default page;
