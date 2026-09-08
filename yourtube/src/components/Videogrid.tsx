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
 
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mt-4 sm:mt-6">
      {loading ? (
        <>Loading...</>
      ) : (
        videos?.map((video: any) => <Videocard key={video._id} video={video} />)
      )}
    </div>
  );
};
export default Videogrid;
