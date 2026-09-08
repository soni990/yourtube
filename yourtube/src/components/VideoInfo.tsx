import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/authContext";
import axiosinstance from "@/lib/axiosinstance";
import WatchPartyButton from "./watch-party/watchPartyButton";

const VideoInfo = ({ video }: any) => {
  const [likes, setLikes] = useState(video.Like || 0);
  const [dislikes, setDislikes] = useState(video.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isWatchlater, setIsWatchlater] = useState(false);
  const { user }: any = useUser();
  useEffect(() => {
    setLikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
  }, [video]);
  useEffect(() => {
    const handleview = async () => {
      if (user) {
        try {
          return await axiosinstance.post(`/history/${video._id}`, {
            userId: user?._id,
          });
        } catch (error) {
          return console.log(error);
        }
      } else {
        return await axiosinstance.post(`/history/views/${video?._id}`);
      }
    };
    handleview();
  }, [user]);
  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axiosinstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.liked) {
        if (isLiked) {
          setLikes((prev: any) => prev - 1);
          setIsLiked(false);
        } else {
          setLikes((prev: any) => prev + 1);
          setIsLiked(true);
          if (isDisliked) {
            setDislikes((prev: any) => prev - 1);
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleDislike = async () => {
    if (!user) return;
    try {
      const res = await axiosinstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (!res.data.liked) {
        if (isDisliked) {
          setDislikes((prev: any) => prev - 1);
          setIsDisliked(false);
        } else {
          setDislikes((prev: any) => prev + 1);
          setIsDisliked(true);
          if (isLiked) {
            setLikes((prev: any) => prev - 1);
            setIsLiked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handlewatchlater = async () => {
    try {
      const res = await axiosinstance.post(`/watchlater/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.watchLater) {
        setIsWatchlater(!isWatchlater);
      } else {
        setIsWatchlater(false);
      }
    } catch (error) {
      console.log(error);
    }
  };
const handleDownload = async () => {
  if (!user) {
    toast.error("Please login first");
    return;
  }

  try {
    toast.loading("Downloading video...", {
      id: "download",
    });

    const res = await axiosinstance.post("/download", {
      userId: user._id,
      videoId: video._id,
    });

    const blob = new Blob([res.data]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = video.filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Video downloaded successfully!", {
      id: "download",
    });
  } catch (err: any) {
    toast.error(
      err.response?.data?.message || "Download failed",
      {
        id: "download",
      }
    );
  }
};
  return (
    <div className="w-full min-w-0 space-y-2 sm:space-y-4">
      <h1 className="break-words text-base font-semibold sm:text-xl">
  {video.videotitle}
</h1>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
  <Avatar className="h-8 w-8 shrink-0 sm:h-10 sm:w-10">
    <AvatarFallback>{video.videochannel[0]}</AvatarFallback>
  </Avatar>

  <div className="min-w-0">
    <h3 className="truncate text-sm font-medium sm:text-base">
      {video.videochannel}
    </h3>

    <p className="text-xs text-muted-foreground sm:text-sm">
      1.2M subscribers
    </p>
  </div>

  <Button className="ml-0 h-8 px-3 text-xs sm:ml-4 sm:h-10 sm:px-4 sm:text-sm">
    Subscribe
  </Button>
</div> 
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex items-center bg-secondary  rounded-full">
            <Button
  onClick={handleLike}
  variant="ghost"
  className="h-8 rounded-full bg-secondary px-2 text-xs sm:h-10 sm:px-4 sm:text-sm"
>
  <ThumbsUp
    className={`mr-1.5 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5 ${
      isLiked ? "fill-black" : ""
    }`}
  />
  {likes.toLocaleString()}
</Button>
            <div className="h-6 w-px bg-gray-300" />
            <Button
              onClick={handleDislike}
              variant="ghost"
              size="sm"
              className="h-8 rounded-full bg-secondary px-2 text-xs sm:h-10 sm:px-4 sm:text-sm"
            >
              <ThumbsDown
                className={`h-5 w-5 ${isDisliked ? "fill-black" : ""}`}
              />
              {dislikes.toLocaleString()}
            </Button>
          </div>
          <Button
  variant="ghost"
  size="sm"
  className={`h-8 rounded-full bg-secondary px-2 text-xs sm:h-10 sm:px-4 sm:text-sm ${
    isWatchlater ? "text-primary" : ""
  }`}
  onClick={handlewatchlater}
>
  <Clock className="mr-1 h-4 w-4 sm:h-5 sm:w-5" />
  {isWatchlater ? "Saved" : "Watch-later"}
</Button>
          <Button
  variant="ghost"
  size="sm"
  className="h-8 rounded-full bg-secondary px-2 text-xs sm:h-10 sm:px-4 sm:text-sm"
>
  <Share className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
  Share
</Button>
          <Button
  variant="ghost"
  size="sm"
  className="h-8 rounded-full bg-secondary px-2 text-xs sm:h-10 sm:px-4 sm:text-sm"
  onClick={handleDownload}
>
  <Download className="mr-1 h-4 w-4 sm:mr-2 sm:h-5 sm:w-5" />
  Download
</Button>
          <WatchPartyButton videoId={video._id}></WatchPartyButton>
          <Button
  variant="ghost"
  size="sm"
  className="h-8 w-8 rounded-full bg-secondary p-0 sm:h-10 sm:w-10"
>
  <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5" />
</Button>
        </div>
      </div>
      <div className="rounded-lg bg-secondary p-2.5 sm:p-4">
         <div className="p-1 mb-1.5 flex flex-wrap gap-2 text-[11px] font-medium sm:mb-2 sm:gap-4 sm:text-sm">
  <span>{video.views.toLocaleString()} views</span>
  <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
</div>
        <div
  className={`items-justify p-1 break-words text-xs sm:text-sm ${
    showFullDescription ? "" : "line-clamp-3"
  }`}
>
  <p className="text-xs sm:text-sm">
    Sample video description. This would contain the actual video
    description from the database.
  </p>
</div>
       <Button
  variant="ghost"
  size="sm"
  className="mt-1 h-auto p-1 text-xs font-medium sm:mt-2 sm:text-sm"
  onClick={() => setShowFullDescription(!showFullDescription)}
>
  {showFullDescription ? "Show Less" : "Show More"}
</Button>
      </div>
    </div>
  );
};

export default VideoInfo;
