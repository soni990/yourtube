"use client";

import SearchResult from "@/components/SearchResult";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const page = () => {
  const params = useSearchParams();
  const q = params.get("q");
  return (
    <div className="felx-1 p-4">
      <div className="mxa-w-6xl">
        {q && (
          <div className="mb-6">
            <h1 className="text-xl font-medium mb-4">Search results for "{q}" </h1>
          </div>
        )}
        <Suspense fallback={<div>Loading search results...</div>}>
        <SearchResult query={q || ""}></SearchResult>
        </Suspense>
      </div>
    </div>
  );
};
export default page;
