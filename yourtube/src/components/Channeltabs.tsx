"use client";

import { useState } from "react";
import { Button } from "./ui/button";

const tabs = [
  { id: "home", label: "Home" },
  { id: "videos", label: "Videos" },
  { id: "shorts", label: "Shorts" },
  { id: "playlists", label: "Playlists" },
  { id: "community", label: "Community" },
  { id: "about", label: "About" },
];
const Channeltabs = () => {
  const [activeTab, setActiveTab] = useState("videos");
  return (
    <div className="border-b border-border">
      <div className="flex items-center gap-4">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            variant="ghost"
            className={`relative py-3 text-sm transition-colors ${
              activeTab === tab.id
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
             {activeTab === tab.id && (
              <span className="absolute left-0 bottom-0 w-full h-0.5 bg-black rounded-full"></span>
            )}
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
export default Channeltabs;
