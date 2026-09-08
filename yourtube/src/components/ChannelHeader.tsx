"use client";
import { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

const ChannelHeader = ({ channel, user }: any) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  return (
   <div className="w-full">
  <div className="relative h-24 sm:h-32 md:h-48 lg:h-64 bg-linear-to-r from-blue-400 to-purple-500 overflow-hidden" />

  <div className="px-3 sm:px-4 py-4 sm:py-6">
    <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
      
      <Avatar className="w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 shrink-0">
        <AvatarFallback className="text-xl sm:text-2xl">
          {channel?.channelname?.[0] || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0 space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-4xl font-bold break-words">
          {channel?.channelname}
        </h1>

        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <span className="break-all">
            @
            {channel?.channelname?.toLowerCase().replace(/\s+/g, "") ||
              "user"}
          </span>
        </div>

        {channel?.description && (
          <p className="text-sm text-muted-foreground max-w-2xl break-words">
            {channel?.description}
          </p>
        )}
      </div>

      {user && user?._id !== channel?._id && (
        <div className="w-full md:w-auto">
          <Button
            onClick={() => setIsSubscribed(!isSubscribed)}
            variant={isSubscribed ? "outline" : "default"}
            className={`w-full md:w-auto ${
              isSubscribed
                ? "bg-secondary"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSubscribed ? "Unsubscribe" : "Subscribe"}
          </Button>
        </div>
      )}

    </div>
  </div>
</div>
  );
};
export default ChannelHeader;
