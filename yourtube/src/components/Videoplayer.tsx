"use client";
import { useEffect, useRef } from "react";
import socket from "@/lib/socket";

interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
  partyId?: string;
  role?: "host" | "viewer"; // 👈 ADD THIS
}

export default function Videoplayer({
  video,
  partyId,
  role,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isRemoteAction = useRef(false);

  // ✅ SAFE PLAY FUNCTION
  const safePlay = async () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    try {
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (err) {
      console.log("Play error:", err);
    }
  };

  useEffect(() => {
    if (!partyId) return;

    // ✅ PLAY EVENT
    const handlePlay = async () => {
      try {
        isRemoteAction.current = true;

        const video = videoRef.current;
        if (!video) return;

        const playPromise = video.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (err) {
        console.log("Play blocked:", err);
      } finally {
        setTimeout(() => {
          isRemoteAction.current = false;
        }, 150);
      }
    };

    // ✅ PAUSE EVENT
    const handlePause = () => {
      if (!videoRef.current) return;

      isRemoteAction.current = true;
      videoRef.current.pause();

      setTimeout(() => {
        isRemoteAction.current = false;
      }, 150);
    };

    // ✅ SEEK EVENT (ONLY TIME SYNC)
    const handleSeek = ({ currentTime }: any) => {
      if (!videoRef.current) return;

      isRemoteAction.current = true;

      videoRef.current.currentTime = currentTime;

      setTimeout(() => {
        isRemoteAction.current = false;
      }, 150);
    };

    socket.on("play-video", handlePlay);
    socket.on("pause-video", handlePause);
    socket.on("seek-video", handleSeek);

    return () => {
      socket.off("play-video", handlePlay);
      socket.off("pause-video", handlePause);
      socket.off("seek-video", handleSeek);
    };
  }, [partyId]);

  console.log("Role:", role);
  return (
    <div>
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls={role === "host"}
        onPlay={() => {
          if (!partyId) return;
          if (role !== "host") return; // ❌ guest blocked
          
          socket.emit("play-video", { partyId });
        }}
        onPause={() => {
          if (!partyId) return;
          if (role !== "host") return; // ❌ guest blocked
          
          socket.emit("pause-video", { partyId });
        }}
        onSeeked={() => {
          if (!partyId || !videoRef.current) return;
          if (role !== "host") return; // ❌ guest blocked
          
          socket.emit("seek-video", {
            partyId,
            currentTime: videoRef.current.currentTime,
          });
        }}
        
        >
        <source
          src={`${process.env.NEXT_PUBLIC_BACKEND_URL}${video?.filepath}`}
          type="video/mp4"
          />
        
        your browser does not support video tag.
      </video>
          </div>
      {role !== "host" && (
  <p className="text-xs text-gray-500 mt-2">
    Only host can control playback
  </p>
)}
    </div>
  );
}
