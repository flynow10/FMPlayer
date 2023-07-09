import { YoutubeAPI } from "@/src/api/youtube-API";
import { isYoutubeUrl } from "@/src/utils/url-utils";
import { useState } from "react";
import { API } from "@/src/types/api";
import { YoutubeSearchResult } from "@/src/components/pages/upload/youtube-search/YoutubeSearchResult";
import SuggestionInput from "@/src/components/utils/SuggestionInput";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";

type YoutubeSearchProps = {
  onClickDownload: (video: API.Youtube.Video) => void;
};

export default function YoutubeSearch(props: YoutubeSearchProps) {
  const [searchText, setSearchText] = useState("");
  const [suggestions, loaded] = useAsyncLoad(
    async () => {
      if (searchText === "") {
        return [];
      } else {
        return (await YoutubeAPI.searchSuggestions(searchText)).suggestions;
      }
    },
    [],
    [searchText]
  );

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
      const searchResult = await YoutubeAPI.search(searchText);

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
      <SuggestionInput
        text={searchText}
        onChangeText={setSearchText}
        suggestions={loaded || suggestions.length !== 0 ? suggestions : null}
        onSearch={onSearch}
        options={{
          boldTypedInput: true,
          hasSearchButton: true,
          placeholder: "Search by Keyword | Paste URL",
        }}
      />
      <div className="youtube-results flex flex-col overflow-auto h-full pr-4">
        {loadingResults && resultList.length === 0 && <FullCover />}
        {resultList.map((result, index) => {
          return (
            <YoutubeSearchResult
              key={index}
              videoSnippet={result.snippet}
              videoId={result.id}
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
