"use client";
import { formatDistanceToNow } from "date-fns";
import { Clock, MoreVertical, Play, X } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import axiosinstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/authContext";

const WatchLaterContent = () => {
  const { user }: any = useUser();
  
  // const user: any =
  //   //null; //sign in
  //   {
  //     //sign out
  //     id: 1,
  //     name: "john Doe",
  //     email: "john@example.com",
  //     image: "https://avatars.githubusercontent.com/u/124599?v=4",
  //   };

  const [watch, setWatch] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadWatch();
    }else{
      setLoading(true);
    }
  }, [user]);
  const loadWatch = async () => {
    if (!user) return;
    try {
      const watchData = await axiosinstance.get(`/watchlater/${user?._id}`);

      setWatch(watchData.data);
    } catch (error) {
      console.error("Error loading :", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        Loading...
      </div>
    );
  }
  const handlewatchvideos = async (watchId: string) => {
    try {
      setWatch(watch.filter((item) => item._id !== watchId),
      );
    } catch (error) {
      console.error("Error removing watch videos :", error);
    }
  };
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <Clock className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold">Keep track of what you watch</h2>
        <p className="text-muted-foreground mt-2">
          Watch videos isn't viewable when signed out.
        </p>
      </div>
    );
  }

  if (watch.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <Clock className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold">No watch videos yet</h2>
        <p className="text-muted-foreground mt-2">Videos you save for later appear here.</p>
      </div>
    );
  }
  //const videos = "/video/vdo.mp4";
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-2">
        <p className="text-muted-foreground">{watch.length} videos</p>
        <Button className="ml-auto flex items-center gap-2  bg-black text-white px-4 py-2">
          <Play />
          Play all
        </Button>
      </div>
      <div className="space-y-2">
        {watch.map((item) => (
          <div
            key={item._id}
            className="flex items-start gap-4 group hover:bg-secondary  rounded-xl transition"
          >
            <Link href={`/watch/${item.videoid._id}`}>
              <div>
                <video
                  src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${item.videoid.filepath}`}
                  className="w-52 h-30 rounded-xl object-cover cursor-pointer"
                />
              </div>
            </Link>
            <div className="flex-1">
              <Link href={`/watch/${item.videoid._id}`}>
                <h3 className="text-lg font-semibold line-clamp-2 hover:text-blue-600">
                  {item.videoid.videotitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.videoid.videochannel}
                </p>
                <p className="text-sm text-muted-foreground">
                  {item.videoid.views.toLocaleString()} views •{" "}
                  {formatDistanceToNow(new Date(item.videoid.createdAt))} ago
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  watched {formatDistanceToNow(new Date(item.createdAt))}
                </p>
              </Link>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-gray-200"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handlewatchvideos(item._id)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove from watch videos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchLaterContent;
