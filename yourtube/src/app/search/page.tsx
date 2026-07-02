"use client";

import SearchResult from "@/components/SearchResult";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SearchContent() {
  const params = useSearchParams();
  const q = params.get("q");

  return (
    <div className="flex-1 p-4">
      <div className="max-w-6xl">
        {q && (
          <div className="mb-6">
            <h1 className="text-xl font-medium mb-4">
              Search results for "{q}"
            </h1>
          </div>
        )}

        <SearchResult query={q || ""} />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading search results...</div>}>
      <SearchContent />
    </Suspense>
  );
}