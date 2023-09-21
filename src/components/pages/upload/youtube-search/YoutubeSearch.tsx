import { YoutubeAPI } from "@/src/api/youtube-API";
import { isYoutubeUrl } from "@/src/utils/url-utils";
import { useState } from "react";
import { API } from "@/src/types/api";
import { YoutubeSearchResult } from "@/src/components/pages/upload/youtube-search/YoutubeSearchResult";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import SuggestionSearch from "@/src/components/utils/input-extensions/SuggestionSearch";

type YoutubeSearchProps = {
  onClickDownload: (video: API.Youtube.Video) => void;
  initialSearch?: string;
};

const loadCompletions = async (text: string) => {
  return (await YoutubeAPI.searchSuggestions(text)).suggestions;
};

export default function YoutubeSearch(props: YoutubeSearchProps) {
  const [completions, setCompletions] = useState<string[]>([]);

  const [resultList, setResultList] = useState<API.Youtube.Video[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);

  const onSearch = async (searchText: string) => {
    setResultList([]);
    setLoadingResults(true);
    const videoId = await isYoutubeUrl(searchText);

    if (typeof videoId === "string") {
      const videoResult = await YoutubeAPI.video(videoId);

      if (videoResult) {
        setResultList(videoResult.items);
      }
    } else {
      const searchResult = await YoutubeAPI.search(searchText, 10);

      if (searchResult) {
        const results = [];

        for (let i = 0; i < searchResult.items.length; i++) {
          const searchVideoId = searchResult.items[i].id.videoId;
          const videoResult = await YoutubeAPI.video(searchVideoId);

          if (videoResult) {
            results.push(...videoResult.items);
          }
        }

        setResultList(results);
      }
    }

    setLoadingResults(false);
  };

  return (
    <>
      <SuggestionSearch
        initalValue={props.initialSearch}
        completions={completions}
        getCompletionValue={(s) => s}
        inputProps={{
          placeholder: "Search by Keyword | Paste URL",
        }}
        onCompletionFetchRequested={async ({ value }) => {
          setCompletions(await loadCompletions(value));
        }}
        onSubmit={(search) => {
          onSearch(search);
        }}
      />
      <div className="youtube-results flex flex-col overflow-auto h-full pr-4 mt-2">
        {loadingResults && resultList.length === 0 && <FullCover />}
        {resultList.map((result, index) => {
          return (
            <YoutubeSearchResult
              key={index}
              videoId={result.id}
              video={result}
              onClickDownLoad={() => {
                props.onClickDownload(result);
              }}
            />
          );
        })}
      </div>
    </>
  );
}
