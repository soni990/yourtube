"use client";
import { formatDistanceToNow } from "date-fns";
import { Clock, MoreVertical, X } from "lucide-react";
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

const Historycontent = () => {
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

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHistory();
    }else{
      setLoading(true);
    }
  }, [user]);
  const loadHistory = async () => {
    if (!user) return;
    try {
      const historyData = await axiosinstance.get(`/history/${user?._id}`);
      setHistory(historyData.data);
    } catch (error) {
      console.error("Error loading history:", error);
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
  const handleRemoveHistory = async (historyId: string) => {
    try {
      setHistory((prevHistory) =>
        prevHistory.filter((item) => item._id !== historyId),
      );
    } catch (error) {
      console.error("Error removing history item:", error);
    }
  };
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <Clock className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold">Keep track of what you watch</h2>
        <p className="text-gray-500 mt-2">
          Watch history isn't viewable when signed out.
        </p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <Clock className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold">No watch history yet</h2>
        <p className="text-gray-600 mt-2">Videos you watch will appear here.</p>
      </div>
    );
  }
  //const videos = "/video/vdo.mp4";
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-2">
        <p className="text-gray-600">{history.length} videos</p>
      </div>
      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item._id}
            className="flex items-start gap-4 group hover:bg-gray-100 rounded-xl transition"
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
                <p className="text-sm text-gray-600 ">
                  {item.videoid.videochannel}
                </p>
                <p className="text-sm text-gray-600 ">
                  {item.videoid.views.toLocaleString()} views •{" "}
                  {formatDistanceToNow(new Date(item.videoid.createdAt))} ago
                </p>
                <p className="text-sm text-gray-500 mt-2">
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
                <DropdownMenuItem onClick={() => handleRemoveHistory(item._id)}>
                  <X className="w-4 h-4 mr-2" />
                  Remove from watch history
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Historycontent;
