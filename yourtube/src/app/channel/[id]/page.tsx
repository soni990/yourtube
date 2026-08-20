"use client";
import ChannelHeader from "@/components/ChannelHeader";
import Channeltabs from "@/components/Channeltabs";
import ChannelVideos from "@/components/ChannelVideos";
import VideoUploader from "@/components/VideoUploader";
import { useUser } from "@/lib/authContext";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axiosinstance from "@/lib/axiosinstance";

const page = () => {
  const params = useParams();
  const id = params.id;
  const { user }: any = useUser();

  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannelVideos = async () => {
      try {
        const res = await axiosinstance.get("/video/getallvideos");
        // Sirf isi channel/uploader ki videos filter karo
        const channelVideos = res.data.filter(
          (vid: any) => vid.uploader === id
        );
        setVideos(channelVideos);
      } catch (error) {
        console.error("Error fetching channel videos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchChannelVideos();
  }, [id]);

  const channel = user;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto">
        <ChannelHeader channel={channel} user={user} />
        <Channeltabs />
        <div className="px-4 pb-8">
          <VideoUploader channelId={id} channelName={channel?.channelname} />
        </div>
        <div className="px-4 pb-8">
          {loading ? <p>Loading videos...</p> : <ChannelVideos videos={videos} />}
        </div>
      </div>
    </div>
  );
};

export default page;