import {
  Thumbnail,
  ThumbnailDetails,
  VideoSnippet,
  YoutubeAPI,
} from "@/Youtube/YoutubeAPI";
import { isUrl, isYoutubeUrl, splitOutUrls } from "@/Youtube/urlUtils";
import { DownloadCloud, ExternalLink } from "lucide-react";
import { ReactNode, useState } from "react";
import YoutubeSearchForm from "./YoutubeSearchForm";

type YoutubeSearchProps = {
  onClickDownload: (videoId: string) => void;
};

export default function YoutubeSearch(props: YoutubeSearchProps) {
  const [resultList, setResultList] = useState<
    { snippet: VideoSnippet; id: string }[]
  >([]);

  const onSearch = async (searchText: string) => {
    const videoId = await isYoutubeUrl(searchText);
    if (typeof videoId === "string") {
      var videoResult = await YoutubeAPI.video(videoId);
      if (videoResult) {
        setResultList(
          videoResult.items.map((video) => ({
            snippet: video.snippet,
            id: video.id,
          }))
        );
      }
    } else {
      const searchResult = await YoutubeAPI.search(searchText);
      if (searchResult) {
        const results = [];
        for (let i = 0; i < searchResult.items.length; i++) {
          const searchVideoId = searchResult.items[i].id.videoId;
          const videoResult = await YoutubeAPI.video(searchVideoId);
          if (videoResult) {
            results.push(
              ...videoResult.items.map((video) => ({
                snippet: video.snippet,
                id: video.id,
              }))
            );
          }
        }
        setResultList([...results]);
      }
    }
  };
  return (
    <>
      <YoutubeSearchForm onSearch={onSearch} />
      <div className="youtube-results flex flex-col overflow-auto h-full pr-4">
        {resultList.map((result, index) => {
          return (
            <YoutubeResult
              key={index}
              videoSnippet={result.snippet}
              videoId={result.id}
              onClickDownLoad={props.onClickDownload}
            />
          );
        })}
      </div>
    </>
  );
}

type YoutubeSearchResultProps = {
  videoSnippet: VideoSnippet;
  videoId: string;
  onClickDownLoad: (videoId: string) => void;
};

function YoutubeResult(props: YoutubeSearchResultProps) {
  const thumbnailOrder: (keyof ThumbnailDetails)[] = [
    "default",
    "medium",
    "high",
    "standard",
    "maxres",
  ];
  const thumbnail = thumbnailOrder.reduce<Thumbnail | undefined>(
    (value, key) => {
      if (props.videoSnippet.thumbnails[key] !== undefined) {
        value = props.videoSnippet.thumbnails[key];
      }
      return value;
    },
    undefined
  )!;
  const parsedDescription = splitOutUrls(props.videoSnippet.description).map(
    (split, index) => {
      if (split.type === "string") {
        return <span key={index}>{split.data}</span>;
      } else {
        return (
          <span key={index}>
            <a target="_blank" href={split.data} className="underline">
              {split.data}
            </a>
          </span>
        );
      }
    }
  );
  const videoLink = `https://youtube.com/watch?v=${props.videoId}`;
  return (
    <div className="flex flex-row max-h-[135px] my-3">
      <a
        href={videoLink}
        target="_blank"
        className="max-w-[240px] max-h-[135px] mr-2"
      >
        <div className="group relative rounded-md overflow-hidden">
          <img
            src={thumbnail.url}
            width={240}
            height={135}
            className="object-cover min-h-[135px] min-w-[240px]"
          />
          <div className="absolute left-0 top-0 w-full h-full bg-black bg-opacity-20 group-hover:block hidden">
            <ExternalLink
              size={48}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white z-10"
            />
          </div>
        </div>
      </a>
      <div className="flex flex-col relative grow overflow-clip">
        <div className="overflow-hidden flex flex-row shrink-0">
          <a
            href={videoLink}
            target="_blank"
            className="my-auto block grow min-w-0 whitespace-nowrap overflow-hidden overflow-ellipsis"
          >
            {props.videoSnippet.title}
          </a>
          <div className="buttons whitespace-nowrap">
            <button
              onClick={() => {
                props.onClickDownLoad(props.videoId);
              }}
              className="hover:bg-gray-300 rounded-md p-1"
            >
              <DownloadCloud />
            </button>
          </div>
        </div>
        <a
          className="ml-3 text-gray-600 font-light underline inline"
          target="_blank"
          href={`https://youtube.com/channel/${props.videoSnippet.channelId}`}
        >
          By: {props.videoSnippet.channelTitle}
        </a>
        <div className="grow overflow-clip border-t-2 relative">
          <p className="overflow-scroll whitespace-pre-line max-h-full">
            {parsedDescription}
          </p>
        </div>
      </div>
    </div>
  );
}
