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
  // const relatedVideos = [
  //   {
  //     _id: "1",
  //     videotitle: "Amazing Nature Documentary",
  //     filename: "nature-doc.mp4",
  //     filetype: "video/mp4",
  //     filepath: "/videos/nature-doc.mp4",
  //     filesize: "500MB",
  //     videochannel: "Nature Channel",
  //     Like: 1250,
  //     Dislike: 50,
  //     views: 45000,
  //     uploader: "nature_lover",
  //     createdAt: new Date().toISOString(),
  //   },
  //   {
  //     _id: "2",
  //     videotitle: "Cooking Tutorial: Perfect Pasta",
  //     filename: "pasta-tutorial.mp4",
  //     filetype: "video/mp4",
  //     filepath: "/videos/pasta-tutorial.mp4",
  //     filesize: "300MB",
  //     videochannel: "Chef's Kitchen",
  //     Like: 890,
  //     Dislike: 20,
  //     views: 23000,
  //     uploader: "chef_master",
  //     createdAt: new Date(Date.now() - 86400000).toISOString(),
  //   },
  // ];
  if (loading) {
    return <div>Loading...</div>;
  }
 
  if (!videos) {
    return <div>Video not found</div>;
  }
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex-1">
            <Videoplayer video={videos} />
            <VideoInfo video={videos} />
            <Comments videoId={id} />
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
