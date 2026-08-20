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
import { useUser } from "@/lib/authContext";
import axiosinstance from "@/lib/axiosinstance";

const LikedContent = () => {
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

  const [like, setLike] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadLikes();
    }
    else{
      setLoading(true);
    }
  }, [user]);
  const loadLikes = async () => {
    if (!user) return;
    try {
      const likeData = await axiosinstance.get(`/like/${user?._id}`);

      setLike(likeData.data);
    } catch (error) {
      console.error("Error loading liked videos:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        Loading videos...
      </div>
    );
  }
  const handleunlikevideo = async (likeId: string) => {
    try {
+      setLike(like.filter((item) => item._id !== likeId));
    } catch (error) {
      console.error("Error removing liked videos:", error);
    }
  };
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <Clock className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold">
          Keep track of videos you like
        </h2>
        <p className="text-muted-foreground mt-2">Sign in to see your liked videos.</p>
      </div>
    );
  }
  
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <Clock className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold">No liked videos yet</h2>
        <p className="text-muted-foreground mt-2">Videos you like will appear here.</p>
      </div>
    );
  }
  //const videos = "/video/vdo.mp4";
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-2">
        <p className="text-muted-foreground">{like.length} videos</p>
        <Button className="ml-auto flex items-center gap-2  bg-black text-white px-4 py-2">
          <Play />
          Play all
        </Button>
      </div>
      <div className="space-y-2">
        {like.map((item) => (
          <div
            key={item._id}
            className="flex items-start gap-4 group hover:bg-secondary  rounded-xl transition"
          >
            <Link href={`/watch/${item.videoid._id}`}>
              <div>
                <video
                  src={item.videoId.filepath} 
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
                <DropdownMenuItem onClick={() => handleunlikevideo(item._id)}>
                  <X className="w-4 h-4 mr-2" />
                  Remove from liked videos
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedContent;
