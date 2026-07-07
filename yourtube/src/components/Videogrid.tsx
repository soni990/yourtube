"use client";
import { useEffect, useState } from "react";
import Videocard from "./Videocard";
import axiosinstance from "@/lib/axiosinstance";

const Videogrid = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await axiosinstance.get("/video/getallvideos");
        setVideos(res.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, []);
  // const videos=[
  //     {
  //         _id:"1",
  //         videotitle:"Amazing Nature Documentary",
  //         filename:"nature-doc.mp4",
  //         filetype:"video/mp4",
  //         filepath:"/videos/nature-doc.mp4",
  //         filesize:"500MB",
  //         videochannel:"Nature Channel",
  //         Like:1250,
  //         views:45000,
  //         uploader:"nature_lover",
  //         createdAt:new Date().toISOString(),
  //     },
  //     {
  //         _id:"2",
  //         videotitle:"Cooking Tutorial: Perfect Pasta",
  //         filename:"pasta-tutorial.mp4",
  //         filetype:"video/mp4",
  //         filepath:"/videos/pasta-tutorial.mp4",
  //         filesize:"300MB",
  //         videochannel:"Chef's Kitchen",
  //         Like:890,
  //         views:23000,
  //         uploader:"chef_master",
  //         createdAt:new Date(Date.now()-86400000).toISOString(),
  //     }
  // ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      {loading ? (
        <>Loading...</>
      ) : (
        videos?.map((video: any) => <Videocard key={video._id} video={video} />)
      )}
    </div>
  );
};
export default Videogrid;
