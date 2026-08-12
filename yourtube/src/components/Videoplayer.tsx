"use client";
import { useEffect, useRef, useState } from "react";
import socket from "@/lib/socket";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  SkipForward,
} from "lucide-react";
interface VideoPlayerProps {
  video: {
    _id: string;
    videotitle: string;
    filepath: string;
  };
  partyId?: string;
  role?: "host" | "viewer"; // 👈 ADD THIS
  onNext?: () => void;
}

export default function Videoplayer({
  video,
  partyId,
  role,
  onNext,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isRemoteAction = useRef(false);
  const lastTapTime = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [skipFeedback, setSkipFeedback] = useState<
    "forward" | "backward" | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<NodeJS.Timeout | null>(null);

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
  const togglePlay = async () => {
    const video = videoRef.current;

    if (!video) return;

    if (partyId && role !== "host") {
      return;
    }

    if (video.paused) {
      await safePlay();
    } else {
      video.pause();
    }
  };
  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "00:00";

    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };
  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };
  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;

    if (!video) return;

    video.volume = value;
    setVolume(value);

    if (value === 0) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      setIsMuted(false);
    }
  };
  const skip = (seconds: number) => {
    const video = videoRef.current;

    if (!video) return;

    // Viewer cannot seek in Watch Party
    if (partyId && role !== "host") return;

    let newTime = video.currentTime + seconds;

    newTime = Math.max(0, Math.min(newTime, video.duration));

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };
  const handleDoubleTap = (e: React.TouchEvent<HTMLVideoElement>) => {
    const currentTime = Date.now();

    if (currentTime - lastTapTime.current < 300) {
      const rect = e.currentTarget.getBoundingClientRect();
      const tapX = e.changedTouches[0].clientX - rect.left;
      const width = rect.width;

      if (tapX < width / 2) {
        skip(-10);
        setSkipFeedback("backward");
      } else {
        skip(10);
        setSkipFeedback("forward");
      }

      setTimeout(() => {
        setSkipFeedback(null);
      }, 700);
    }

    lastTapTime.current = currentTime;
  };
  const toggleFullscreen = async () => {
    const container = videoRef.current?.parentElement;

    if (!container) return;

    try {
      if (!document.fullscreenElement) {
        await container.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log("Fullscreen error:", error);
    }
  };
  const resetControlsTimer = () => {
    setShowControls(true);

    if (controlsTimer.current) {
      clearTimeout(controlsTimer.current);
    }

    if (videoRef.current && !videoRef.current.paused) {
      controlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };
  useEffect(() => {
    if (!partyId) return;

    // ✅ PLAY EVENT
    const handlePlay = async () => {
      try {
        isRemoteAction.current = true;
        setIsPlaying(true);
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
      setIsPlaying(false);
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
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimer.current) {
        clearTimeout(controlsTimer.current);
      }
    };
  }, []);
  return (
    <div>
      <div
        className="relative aspect-video bg-black rounded-lg overflow-hidden"
      >
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          onTouchEnd={handleDoubleTap}
           onMouseMove={resetControlsTimer}
        onTouchStart={resetControlsTimer}
          //controls={!partyId || role === "host"}
          onLoadStart={() => {
            setIsLoading(true);
          }}
          onWaiting={() => {
            setIsLoading(true);
          }}
          onCanPlay={() => {
            setIsLoading(false);
          }}
          onPlaying={() => {
            setIsLoading(false);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              setDuration(videoRef.current.duration);
            }
          }}
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime);
            }
          }}
          onPlay={() => {
            setIsPlaying(true);

            setShowControls(true);

            if (controlsTimer.current) {
              clearTimeout(controlsTimer.current);
            }

            controlsTimer.current = setTimeout(() => {
              setShowControls(false);
            }, 3000);

            if (!partyId) return;

            if (role !== "host") return;

            socket.emit("play-video", { partyId });
          }}
          onPause={() => {
            setIsPlaying(false);
            setShowControls(true);

            if (controlsTimer.current) {
              clearTimeout(controlsTimer.current);
            }

            if (!partyId) return;

            if (role !== "host") return;

            socket.emit("pause-video", { partyId });
          }}
          onSeeked={() => {
            if (!partyId || !videoRef.current) return;
            if (partyId && role !== "host") return; // ❌ guest blocked

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
        {skipFeedback === "backward" && (
          <div
            className="absolute left-10 top-1/2 -translate-y-1/2 
                  bg-black/70 text-white rounded-full p-5"
          >
            <div className="text-center">
              <RotateCcw size={30} className="mx-auto" />
              <span className="text-sm font-bold">10</span>
            </div>
          </div>
        )}

        {skipFeedback === "forward" && (
          <div
            className="absolute right-10 top-1/2 -translate-y-1/2 
                  bg-black/70 text-white rounded-full p-5"
          >
            <div className="text-center">
              <RotateCw size={30} className="mx-auto" />
              <span className="text-sm font-bold">10</span>
            </div>
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {/* Custom Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-black/80 text-white px-4 py-3 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              const newTime = Number(e.target.value);

              if (!videoRef.current) return;

              // Viewer cannot seek in watch party
              if (partyId && role !== "host") return;

              videoRef.current.currentTime = newTime;
              setCurrentTime(newTime);
            }}
            className="w-full cursor-pointer"
          />

          {/* Controls Row */}
          <div className="flex items-center justify-between mt-2">
            <button
              onClick={() => skip(-10)}
              disabled={Boolean(partyId) && role !== "host"}
              className="p-2 hover:bg-gray-800 rounded disabled:opacity-50"
              title="Back 10 seconds"
            >
              <RotateCcw size={22} />
            </button>
            {/* Play / Pause */}
            <button
              onClick={togglePlay}
              disabled={Boolean(partyId) && role !== "host"}
              className="p-2 hover:bg-gray-800 rounded disabled:opacity-50"
            >
              {isPlaying ? <Pause size={22} /> : <Play size={22} />}
            </button>
            <button
              onClick={() => skip(10)}
              disabled={Boolean(partyId) && role !== "host"}
              className="p-2 hover:bg-gray-800 rounded disabled:opacity-50"
              title="Forward 10 seconds"
            >
              <RotateCw size={22} />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-gray-800 rounded"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={22} />
                ) : (
                  <Volume2 size={22} />
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-24 cursor-pointer"
              />
            </div>

            {/* Time */}
            <div className="text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <button
              onClick={onNext}
              disabled={!onNext}
              className="p-2 hover:bg-gray-800 rounded disabled:opacity-50"
              title="Next video"
            >
              <SkipForward size={22} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 hover:bg-gray-800 rounded"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize size={22} /> : <Maximize size={22} />}
            </button>
          </div>
        </div>
      </div>
      {partyId && role !== "host" && (
        <p className="text-xs text-gray-500 mt-2">
          Only host can control playback
        </p>
      )}
    </div>
  );
}
