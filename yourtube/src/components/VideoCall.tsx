"use client";

import socket from "@/lib/socket";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
interface VideoCallProps {
  partyId: string;
  role: "host" | "viewer";
}

export default function VideoCall({ partyId, role }: VideoCallProps) {
  const router = useRouter();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const screenStream = useRef<MediaStream | null>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const [isMuted, setIsMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [hostLeftDialog, setHostLeftDialog] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const toggleMute = () => {
    if (!localStream.current) return;

    localStream.current.getAudioTracks().forEach((track) => {
      track.enabled = isMuted;
    });

    setIsMuted(!isMuted);
  };

  const toggleCamera = () => {
    if (isSharingScreen) return;

    if (!localStream.current) return;

    localStream.current.getVideoTracks().forEach((track) => {
      track.enabled = cameraOff;
    });

    setCameraOff(!cameraOff);
  };
  const shareScreen = async () => {
    if (isSharingScreen && screenStream.current) {
      screenStream.current.getTracks().forEach((track) => track.stop());
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

      screenStream.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsSharingScreen(true);

      stream.getVideoTracks()[0].onended = () => {
        screenStream.current = null;

        if (localStream.current && localVideoRef.current) {
          localVideoRef.current.srcObject = localStream.current;
        }

        setIsSharingScreen(false);
      };
    } catch (err) {
      console.log("Screen Share Error:", err);
    }
  };
  const leaveCall = () => {
    if (role === "host") {
      socket.emit("host-leave", { partyId });
    }
    // Stop camera & microphone
    if (localStream.current) {
      localStream.current.getTracks().forEach((track) => track.stop());
      localStream.current = null;
    }

    // Close WebRTC connection
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    // Disconnect socket
    socket.disconnect();

    // Redirect to home
    router.push("/");
  };
  const startRecording = () => {
    if (!localStream.current) {
      console.log("Local stream not found");
      return;
    }

    recordedChunks.current = [];

    const recorder = new MediaRecorder(localStream.current);

    mediaRecorder.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.current.push(event.data);
      }
    };

    recorder.start();

    setIsRecording(true);
  };
  const stopRecording = () => {
    if (!mediaRecorder.current) return;

    mediaRecorder.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, {
        type: "video/webm",
      });

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `watch-party-${Date.now()}.webm`;
      a.click();

      URL.revokeObjectURL(url);
    };

    mediaRecorder.current.stop();

    setIsRecording(false);
  };
  useEffect(() => {
    const handleHostLeft = () => {
      setHostLeftDialog(true);
    };

    socket.on("host-left", handleHostLeft);

    return () => {
      socket.off("host-left", handleHostLeft);
    };
  }, [router]);
  useEffect(() => {
    const startCamera = async () => {
      try {
        // Get camera + microphone
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStream.current = stream;

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Create Peer Connection
        peerConnection.current = new RTCPeerConnection({
          iceServers: [
            {
              urls: "stun:stun.l.google.com:19302",
            },
          ],
        });

        // Add local tracks
        stream.getTracks().forEach((track) => {
          peerConnection.current?.addTrack(track, stream);
        });

        // Receive remote stream
        peerConnection.current.ontrack = (event) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
        };
      } catch (err) {
        console.log("Camera Error:", err);
      }
    };

    startCamera();
    return () => {
      peerConnection.current?.close();

      localStream.current?.getTracks().forEach((track) => track.stop());

      localStream.current = null;
    };
  }, []);
  return (
    <div className="mt-8 border rounded-lg p-4">
      <h2 className="text-xl font-bold mb-4">🎥 Video Call</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My Camera */}
        <div>
          <h3 className="text-sm font-semibold mb-2">My Camera</h3>

          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-64 object-cover rounded-lg border"
          />
        </div>

        {/* Remote User */}
        <div>
          <h3 className="text-sm font-semibold mb-2">Remote User</h3>

          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-64 object-cover rounded-lg border"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={toggleMute}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          {isMuted ? "🎤 Unmute" : "🔇 Mute"}
        </button>

        <button
          onClick={toggleCamera}
          disabled={isSharingScreen}
          className="bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cameraOff ? "📷 Camera On" : "🚫 Camera Off"}
        </button>
        <button
          onClick={shareScreen}
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          {isSharingScreen ? "🛑 Stop Sharing" : "🖥️ Share Screen"}
        </button>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg"
        >
          {isRecording ? "⏹️ Stop Recording" : "⏺️ Start Recording"}
        </button>
        <button
          onClick={leaveCall}
          className="ml-auto bg-gray-700 text-white px-4 py-2 rounded-lg"
        >
          Leave Call
        </button>
      </div>
      <Dialog open={hostLeftDialog} onOpenChange={setHostLeftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Watch Party Ended</DialogTitle>

            <DialogDescription>
              The host has left the watch party.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => router.push("/")}
              className="bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Go to Home
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
