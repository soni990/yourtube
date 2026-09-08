"use client";
import Comments from "@/components/Comments";
import RelatedVideos from "@/components/RelatedVideos";
import VideoInfo from "@/components/VideoInfo";
import Videoplayer from "@/components/Videoplayer";
import axiosinstance from "@/lib/axiosinstance";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

const page = () => {
  const params = useParams();
  const id = params.id;
  const [videos, setVideos] = useState<any>(null);
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchVideo = async () => {
      if (!id || typeof id !== "string") return;
      try {
        const res = await axiosinstance.get("/video/getallvideos");
        
        const video = res.data?.filter((vid: any) => vid._id === id);

        setVideos(video[0]);
        setVideo(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);
  const handleNextVideo = () => {
  if (!video || !videos) return;

  const currentIndex = video.findIndex(
    (vid: any) => vid._id === videos._id
  );

  if (currentIndex === -1) return;

  const nextIndex = currentIndex + 1;

  if (nextIndex < video.length) {
    const nextVideo = video[nextIndex];

    window.location.href = `/watch/${nextVideo._id}`;
  }
};
  
  if (loading) {
    return <div>Loading...</div>;
  }
 
  if (!videos) {
    return <div>Video not found</div>;
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl p-4">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex w-full flex-1 flex-col gap-3">
  <div className="w-full">
    <Videoplayer
      video={videos}
      onNext={handleNextVideo}
    />
  </div>

  <div className="w-full">
    <VideoInfo video={videos} />
  </div>

  <div className="w-full">
    <Comments videoId={id} />
  </div>
</div>

          <div className="w-full xl:w-95 shrink-0">
            <RelatedVideos videos={video} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
