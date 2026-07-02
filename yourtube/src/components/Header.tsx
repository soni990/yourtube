"use client";
import { FormEvent, useState, KeyboardEvent } from "react";
import { Menu, Search, Mic, VideoIcon, BellIcon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ChannelDialogue from "./ChannelDialogue";
import { useRouter } from "next/navigation";
import { useUser } from "@/lib/authContext";
const Header = () => {
  const { user, logout, handleGoogleSignIn } : any= useUser();
  // const user: any =
  //null; //sign in
  // {
  //   //sign out
  //   id: 1,
  //   name: "john Doe",
  //   email: "john@example.com",
  //   image: "https://avatars.githubusercontent.com/u/124599?v=4",
  // };
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const handlesearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const handlekeypress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchQuery.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white border-b">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Menu className="w-6 h-6" />
        </Button>
        <Link href={"/"} className="flex items-center gap-1">
          <div className="bg-red-600  p-1 rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186A3.016 3.016 0 0 0 21.122 2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.017 3.017 0 0 0 2.121 2.136c1.872.505 9.377.505 9.377.505s7.505 0 9.377-.505a3.016 3.016 0 0 0 2.121-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.75 15.5V8.5l6 3.5-6 3.5z" />
            </svg>
          </div>
          <span className="text-xl font -medium">Yourtube</span>
          <span className="text-xs text-gray-400 ml-1">In</span>
        </Link>
      </div>
      <form
        onSubmit={handlesearch}
        className="flex items-center gap-2 flex-1 max-w-2xl mx-4"
      >
        <div className="flex flex-1">
          <Input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onKeyPress={handlekeypress}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-l-full border-r-0 focus-visible:ring-0"
          />
          <Button
            type="submit"
            className="rounded-r-full px-6 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-l-0"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Mic className="w-5 h-5" />
        </Button>
      </form>
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <Button variant="ghost" size="icon">
              <VideoIcon className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon">
              <BellIcon className="w-6 h-6" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user.image}
                    />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 " align="end" forceMount>
                {user ?.channelname ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/channel/${user?._id}`}>Your channel</Link>
                  </DropdownMenuItem>
                ) : (
                  <div className="px-2 py-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => setIsDialogOpen(true)}
                    >
                      Create a channel
                    </Button>
                  </div>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/history">History</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/liked">Liked vedios</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/watch-later">Watch later</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button className="flex items-center gap-2" onClick={handleGoogleSignIn}>
              <User className="w-4 h-4" />
              Sign in
            </Button>
          </>
        )}{" "}
      </div>
      <ChannelDialogue
        isopen={isDialogOpen}
        onclose={() => setIsDialogOpen(false)}
        mode="create"
      />
    </header>
  );
};

export default Header;
