import { YoutubeAPI } from "@/src/api/youtube-API";
import { isYoutubeUrl } from "@/src/utils/url-utils";
import { useState } from "react";
import YoutubeSearchForm from "./YoutubeSearchForm";
import { API } from "@/src/types/api";
import { YoutubeSearchResult } from "@/src/components/pages/upload/youtube-search/YoutubeSearchResult";

type YoutubeSearchProps = {
  onClickDownload: (videoId: string) => void;
};

export default function YoutubeSearch(props: YoutubeSearchProps) {
  const [resultList, setResultList] = useState<
    { snippet: API.Youtube.VideoSnippet; id: string }[]
  >([]);

  const onSearch = async (searchText: string) => {
    const videoId = await isYoutubeUrl(searchText);

    if (typeof videoId === "string") {
      const videoResult = await YoutubeAPI.video(videoId);

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
            <YoutubeSearchResult
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
