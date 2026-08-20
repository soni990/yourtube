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
    return <div className="p-6 text-muted-foreground">Loading Watch Party... 🎬</div>;
  }

  if (!video) {
    return <div className="p-6 text-muted-foreground">Video not found.</div>;
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Watch Party Room</h1>

      <p className="mt-2">Party ID: {partyId}</p>

      <div className="mt-2">
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold ${
            role === "host"
              ? "bg-green-100 text-green-700"
              : "bg-secondary  text-muted-foreground"
          }`}
        >
          {role === "host" ? "👑 Host" : "👤 Guest"}
        </span>
      </div>

      {/* SINGLE VIDEO PLAYER ONLY */}
      <div className="mt-6">
        <Videoplayer video={video} partyId={partyId} role={role} />

        {/* PARTICIPANTS */}
        <div className="mt-4">
          <h2 className="font-semibold">
            Participants ({participants.length})
          </h2>

          <ul className="mt-2">
            {participants.map((p, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                🟢 {p} {i === 0 ? "(Host)" : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <VideoCall partyId={partyId} role={role} />
      <LiveChat
        partyId={partyId}
        username={role === "host" ? "Host" : "Guest"}
      />

      <p className="text-green-600 mt-4">Connected Successfully</p>
    </div>
  );
};
export default WatchPartyRoom;
