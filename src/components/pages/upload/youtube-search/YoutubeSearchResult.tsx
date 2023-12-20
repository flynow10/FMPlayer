import ChannelDisplay from "@/src/components/utils/youtube/ChannelDisplay";

import { YoutubeAPI } from "@/src/api/youtube-API";
import { API } from "@/src/types/api";
import { formatIsoDuration, timeSince } from "@/src/utils/date-utils";
import { shortenNumberString } from "@/src/utils/string-utils";

import { ExternalLink } from "lucide-react";

type YoutubeSearchResultProps = {
  videoId: string;
  video: API.Youtube.Video;
  onClickDownLoad: () => void;
};

export default function YoutubeSearchResult(props: YoutubeSearchResultProps) {
  const videoLink = `https://youtube.com/watch?v=${props.videoId}`;

  const videoSnippet = props.video.snippet;
  return (
    <div className="flex flex-row p-2 rounded-md odd:bg-gray-100">
      <a
        href={videoLink}
        target="_blank"
        rel="noreferrer"
        className="aspect-video h-48 mr-2"
      >
        <div className="aspect-video group relative rounded-md overflow-hidden">
          <img
            src={YoutubeAPI.getBestThumbnail(videoSnippet.thumbnails)?.url}
            className="aspect-video object-cover"
          />
          <div className="video-duration p-1 bg-gray-200 absolute right-0 bottom-0 text-xs m-1 rounded-md">
            <span>
              {formatIsoDuration(props.video.contentDetails.duration)}
            </span>
          </div>
          <div className="absolute left-0 top-0 w-full h-full bg-black bg-opacity-20 group-hover:block hidden">
            <ExternalLink
              size={48}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white z-10"
            />
          </div>
        </div>
      </a>
      <div className="flex flex-col relative grow gap-2 overflow-clip">
        <div className="flex flex-col overflow-hidden">
          <a
            href={videoLink}
            target="_blank"
            rel="noreferrer"
            className="block min-w-0 w-fit whitespace-nowrap overflow-hidden overflow-ellipsis text-lg"
          >
            {videoSnippet.title}
          </a>
          <div className="flex gap-1 flex-row video-stats text-xs text-gray-400 ml-2">
            <span>
              {shortenNumberString(props.video.statistics.viewCount, 2)} views
            </span>
            <span>•</span>
            <span>
              {timeSince(new Date(props.video.snippet.publishedAt))} ago
            </span>
          </div>
        </div>
        <div className="relative flex h-10">
          <ChannelDisplay channelId={videoSnippet.channelId} />
        </div>
        <div className="mt-auto flex flex-row-reverse">
          <button
            className="btn py-1 bg-sky-600 border-cyan-600 active:bg-sky-700 dark:invert"
            onClick={props.onClickDownLoad}
          >
            Import Audio
          </button>
        </div>
      </div>
    </div>
  );
}
