"use client"
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";

const SearchResult = ({ query }: any) => {
  if (!query.trim()) {
    return (
      <div>
        <p>Enter a search term to find videos</p>
      </div>
    );
  }
  const [video, setVideo] = useState<any>(null);
  const videos = async () => {
    const allvideos = [
      {
        _id: "1",
        videotitle: "Amazing Nature Documentary",
        filename: "nature-doc.mp4",
        filetype: "video/mp4",
        filepath: "/videos/nature-doc.mp4",
        filesize: "500MB",
        videochannel: "Nature Channel",
        Like: 1250,
        views: 45000,
        uploader: "nature_lover",
        createdAt: new Date().toISOString(),
      },
      {
        _id: "2",
        videotitle: "Cooking Tutorial: Perfect Pasta",
        filename: "pasta-tutorial.mp4",
        filetype: "video/mp4",
        filepath: "/videos/pasta-tutorial.mp4",
        filesize: "300MB",
        videochannel: "Chef's Kitchen",
        Like: 890,
        views: 23000,
        uploader: "chef_master",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    let results = allvideos.filter(
      (vid) =>
        vid.videotitle.toLowerCase().includes(query.toLowerCase()) ||
        vid.videochannel.toLowerCase().includes(query.toLowerCase()),
    );
    setVideo(results);
  };
  useEffect(() => {
    videos();
  }, [query]);

  if (!video) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold mb-2">No Result found</h1>
        <p className="text-gray-600">
          Try different keywords or remove search filters
        </p>
      </div>
    );
  }
  const hasResults = video ? video.length > 0 : true;
  if (!hasResults) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">
        Showing <span className="font-semibold">0</span> results for{" "}
        <span className="font-semibold">"{query}"</span>
      </p>
      </div>
    );
  }
  const vids = "/video/vdo.mp4";

  return (
    <div className="space-y-6">
      {video.length > 0 && (
        <div className="space-y-4">
          {video.map((video: any) => (
            <Link
              key={video._id}
              href={`/watch/${video._id}`}
              className="flex gap-2 group"
            >
              <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden shrink-0">
                <video
                  src={vids}
                  className="w-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
                  {video.videotitle}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {video.videochannel}
                </p>
                <p className="text-xs text-gray-600">
                  {video.views.toLocaleString()} views{" "}
                  {formatDistanceToNow(new Date(video.createdAt))} ago
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResult;
