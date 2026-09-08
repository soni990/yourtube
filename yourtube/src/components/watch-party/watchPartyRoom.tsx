"use client";

import socket from "@/lib/socket";
import { useEffect, useState } from "react";
import axiosinstance from "@/lib/axiosinstance";
import Videoplayer from "../Videoplayer";
import LiveChat from "../LiveChat";
import VideoCall from "../VideoCall";
interface WatchPartyRoomProps {
  partyId: string;
}

const WatchPartyRoom = ({ partyId }: WatchPartyRoomProps) => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [role, setRole] = useState<"host" | "viewer">("viewer");
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.connect();

    const onConnect = () => {
      socket.emit("join-room", partyId, "Guest", (res: any) => {
        setRole(res.role);
      });
    };

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
      socket.disconnect();
    };
  }, [partyId]);

  useEffect(() => {
    const handleParticipants = (data: any) => {
      setParticipants(data.participants);
    };

    socket.on("participants-update", handleParticipants);

    return () => {
      socket.off("participants-update", handleParticipants);
    };
  }, [partyId]);

  useEffect(() => {
    const fetchPartyVideo = async () => {
      try {
        // Party details fetch
        const partyRes = await axiosinstance.get(`/watch-party/${partyId}`);

        const videoId = partyRes.data.party.videoId;

        // Saare videos fetch
        const videoRes = await axiosinstance.get("/video/getallvideos");

        // Matching video find
        const selectedVideo = videoRes.data.find((v: any) => v._id === videoId);

        setVideo(selectedVideo);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartyVideo();
  }, [partyId]);
  if (loading) {
    return <div className="p-3 sm:p-4 md:p-6 text-muted-foreground">
      Loading Watch Party... 🎬
    </div>;
  }

  if (!video) {
    return  <div className="p-3 sm:p-4 md:p-6 text-muted-foreground">
      Video not found.
    </div>;
  }
  return (
    <div className="w-full min-h-screen p-3 sm:p-4 md:p-6">
  <h1 className="text-xl sm:text-2xl font-bold">
    Watch Party Room
  </h1>

  <p className="mt-2 text-sm sm:text-base break-all">
    Party ID: {partyId}
  </p>

  <div className="mt-2">
    <span
      className={`inline-flex px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
        role === "host"
          ? "bg-green-100 text-green-700"
          : "bg-secondary text-muted-foreground"
      }`}
    >
      {role === "host" ? "👑 Host" : "👤 Guest"}
    </span>
  </div>

  {/* VIDEO PLAYER */}
  <div className="mt-4 sm:mt-6 w-full min-w-0">
    <Videoplayer
      video={video}
      partyId={partyId}
      role={role}
    />

    {/* PARTICIPANTS */}
    <div className="mt-4">
      <h2 className="font-semibold text-sm sm:text-base">
        Participants ({participants.length})
      </h2>

      <ul className="mt-2 space-y-1">
        {participants.map((p, i) => (
          <li
            key={i}
            className="text-sm text-muted-foreground break-all"
          >
            🟢 {p} {i === 0 ? "(Host)" : ""}
          </li>
        ))}
      </ul>
    </div>
  </div>

  <div className="mt-4 sm:mt-6">
    <VideoCall partyId={partyId} role={role} />
  </div>

  <div className="mt-4 sm:mt-6">
    <LiveChat
      partyId={partyId}
      username={role === "host" ? "Host" : "Guest"}
    />
  </div>

  <p className="text-green-600 text-sm mt-4">
    Connected Successfully
  </p>
</div>
  );
};
export default WatchPartyRoom;
