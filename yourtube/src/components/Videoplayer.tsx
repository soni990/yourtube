"use client"
import { useRef } from "react";

interface VideoPlayerProps{
    video:{
        _id:string;
        videotitle:string;
        filepath:string;
    };
}

export default function Videoplayer({video}:VideoPlayerProps){
    const videoRef=useRef<HTMLVideoElement>(null);
    
    return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
            ref={videoRef}
            className="w-full h-full"
            controls
            >
                <source src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${video?.filepath}`} type="video/mp4"/>
                your browser does not support vedio tag.
                
            </video>
        </div>
    )
    
}

