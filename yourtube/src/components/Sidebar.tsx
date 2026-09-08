"use client";
import {
  Clock,
  Compass,
  Download,
  History,
  Home,
  PlaySquare,
  ThumbsUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import ChannelDialogue from "./ChannelDialogue";
import { useUser } from "@/lib/authContext";

const Sidebar = () => {
  const { user }: any = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <aside className="w-16 md:w-64 bg-background border-r min-h-screen p-2 shrink-0">
      <nav className="space-y-1">
        <Link href="/">
          <Button variant="ghost" className="w-full justify-start px-2 md:px-3">
            <Home className="w-2 h-2 md:mr-3 shrink-0" />
             <span className="hidden lg:inline">Home</span>
          </Button>
        </Link>
        <Link href="/explore">
          <Button variant="ghost" className="w-full justify-start px-2 md:px-3">
            <Compass className="w-5 h-5 md:mr-3 shrink-0" />
            <span className="hidden lg:inline">Explore</span>
          </Button>
        </Link>
        <Link href="/subscriptions">
          <Button variant="ghost" className="w-full justify-start px-2 md:px-3">
            <PlaySquare className="w-5 h-5 md:mr-3 shrink-0" />
            <span className="hidden lg:inline">Subscriptions</span>
          </Button>
        </Link>
        {user && (
          <>
            <div className="border-t pt-2 mt-2">
              <Link href="/history">
                <Button variant="ghost" className="w-full justify-start px-2 md:px-3">
                  <History className="w-5 h-5 md:mr-3 shrink-0" />
                  <span className="hidden lg:inline">History</span>
                </Button>
              </Link>
              <Link href="/liked">
                <Button variant="ghost" className="w-full justify-start px-2 md:px-3">
                  <ThumbsUp className="w-5 h-5 md:mr-3 shrink-0" />
                  <span className="hidden lg:inline">Liked videos</span>
                </Button>
              </Link>
              <Link href="/watch-later">
                <Button variant="ghost" className="w-full justify-start px-2 md:px-3">
                  <Clock className="w-5 h-5 md:mr-3 shrink-0" />
                  <span className="hidden lg:inline">Watch later</span>
                </Button>
              </Link>
              <Link href="/download">
                <Button variant="ghost" className="w-full justify-start px-2 md:px-3">
                  <Download className="w-5 h-5 md:mr-3 shrink-0" />
                  <span className="hidden lg:inline">Downloads</span>
                </Button>
              </Link>
              {user?.channelname ? (
                <Link href={`/channel/${user._id}`}>
                  <Button variant="ghost" className="w-full justify-start px-2 md:px-3">
                    <User className="w-5 h-5 md:mr-3 shrink-0" />
                    <span className="hidden lg:inline">Your channel</span>
                  </Button>
                </Link>
              ) : (
                <div className="px-0 md:px-2 py-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full px-1 md:px-3"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <span className="hidden md:inline">Create a channel</span>
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
      <ChannelDialogue
        isopen={isDialogOpen}
        onclose={() => setIsDialogOpen(false)}
        mode="create"
      />
    </aside>
  );
};
export default Sidebar;
