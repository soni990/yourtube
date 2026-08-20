"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState } from "react";
import axiosinstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/authContext";

const DownloadsContent = () => {
  const { user }: any = useUser();

  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (user) {
      loadDownloads();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadDownloads = async () => {
  try {
    const res = await axiosinstance.get(`/download/${user._id}`);
    setDownloads(res.data);
  } catch (error) {
    console.log(error);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Download className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold">Sign in to view Downloads</h2>
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Download className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold">No downloaded videos</h2>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground">{downloads.length} videos</p>
      {downloads.map((item: any) => (
        <Link
          key={item._id}
          href={`/watch/${item.videoId._id}`}
          className="flex gap-4 group"
        >
          <video
            src={`${item.videoId.filepath}`} 
            className="w-56 h-32 rounded-xl object-cover"
          />

          <div>
            <h3 className="font-semibold group-hover:text-blue-600">
              {item.videoId.videotitle}
            </h3>

            <p className="text-sm text-muted-foreground">{item.videoId.videochannel}</p>

            <p className="text-sm text-muted-foreground">
              {item.videoId.views.toLocaleString()} views •{" "}
              {formatDistanceToNow(new Date(item.videoId.createdAt))} ago
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DownloadsContent;
