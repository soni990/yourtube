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
  // const user: any =
  //   //null; //sign in
  //   {
  //     //sign out
  //     id: 1,
  //     name: "john Doe",
  //     email: "john@example.com",
  //     image: "https://avatars.githubusercontent.com/u/124599?v=4",
  //   };
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
    //handleWatchLater
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
    <div className="space-y-4">
      <h1 className="text-xl font font-semibold">{video.videotitle}</h1>
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 shrink-0">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{video.videochannel[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{video.videochannel}</h3>
            <p className="text-sm text-gray-600">1.2M subscribers</p>
          </div>
          <Button className="ml-4">Subscribe</Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-full">
            <Button
              onClick={handleLike}
              variant="ghost"
              className="bg-gray-100 rounded-full"
            >
              <ThumbsUp
                className={`mr-2 h-5 w-5 ${isLiked ? "fill-black" : ""}`}
              />
              {likes.toLocaleString()}
            </Button>
            <div className="h-6 w-px bg-gray-300" />
            <Button
              onClick={handleDislike}
              variant="ghost"
              size="sm"
              className="bg-gray-100 rounded-full"
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
            className={`bg-gray-100 rounded-full ${isWatchlater ? "text-primary" : ""}`}
            onClick={handlewatchlater}
          >
            <Clock className="h-5 w-5 " />
            {isWatchlater ? "Saved" : "Watch-later"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full"
          >
            <Share className="w-5 h-5 mr-2" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full"
            onClick={handleDownload}
          >
            <Download className="w-5 h-5 mr-2" />
            Dowload
          </Button>
          <WatchPartyButton videoId={video._id}></WatchPartyButton>
          <Button
            variant="ghost"
            size="sm"
            className="bg-gray-100 rounded-full"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex gap-4 text-sm font-medium mb-2">
          <span>{video.views.toLocaleString()} views</span>
          <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
        </div>
        <div className={`text-sm ${showFullDescription ? "" : "line-clamp-3"}`}>
          <p>
            Sample video description. This would contain the actual video
            description from the database.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 p-0 h-auto font-medium"
          onClick={() => setShowFullDescription(!showFullDescription)}
        >
          {showFullDescription ? "Show Less " : "Show More"}
        </Button>
      </div>
    </div>
  );
};

export default VideoInfo;
