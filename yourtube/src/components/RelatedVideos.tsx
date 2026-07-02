import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

type RelatedVideo = {
  _id: string;
  videotitle: string;
  videochannel: string;
  views: number;
  createdAt: string;
};

type RelatedVideosProps = {
  videos: RelatedVideo[];
};

const vid = "/video/vdo.mp4";
export default function RelatedVideos({ videos }: RelatedVideosProps) {
  return (
    <div className="space-y-4">
      {videos.map((video: any) => (
        <Link
          key={video._id}
          href={`/watch/${video._id}`}
          className="flex gap-2 group"
        >
          <div className="relative w-40 aspect-video bg-gray-100 rounded overflow-hidden shrink-0">
            <video
              src={vid}
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
              {video.videotitle}
            </h3>
            <p className="text-xs text-gray-600 mt-1">{video.videochannel}</p>
            <p className="text-xs text-gray-600">
              {video.views.toLocaleString()} views{" "}
              {formatDistanceToNow(new Date(video.createdAt))} ago
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
