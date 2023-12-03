import MediaCard, {
  DisplayableMediaType,
} from "@/src/components/media-displays/MediaCard";
import { MediaCarousel } from "@/src/components/media-displays/MediaCarousel";
import { FullCover } from "@/src/components/utils/loading/FullCover";
import { usePageContext } from "@/src/contexts/PageContext";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { MusicLibrary } from "@/src/music/library/music-library";

export default function SearchResults() {
  const pages = usePageContext();
  const [searchResults, isLoaded] = useAsyncLoad(
    () => {
      return MusicLibrary.search(pages.data);
    },
    null,
    [pages.data]
  );
  if (!isLoaded || searchResults === null) {
    return <FullCover />;
  }
  const createMediaDisplay = (
    type: "albums" | "tracks" | "artists" | "functions"
  ) => {
    return (
      <div className="flex flex-col p-4">
        <span className="text-xl pb-4">
          {type[0].toUpperCase() + type.substring(1)}
        </span>
        <MediaCarousel>
          {searchResults[type].map((media) => {
            return (
              <MediaCard
                key={media.id}
                data={media}
                type={
                  type.slice(0, -1) as "track" | "album" | "artist" | "function"
                }
                style="cover-card"
              />
            );
          })}
        </MediaCarousel>
      </div>
    );
  };

  const topResultsList = (
    <div className="flex flex-col p-4">
      <span className="text-2xl pb-4">Top Results</span>
      <div className="flex flex-row gap-4">
        {searchResults.results
          .filter((result) =>
            ["track", "album", "artist", "playlist", "function"].includes(
              result.type
            )
          )
          .slice(0, 3)
          .map((result) => {
            const data = searchResults[
              (result.type + "s") as
                | "tracks"
                | "albums"
                | "artists"
                | "playlists"
                | "functions"
            ].find((media) => result.id === media.id);
            if (data === undefined) {
              throw new Error(
                "Couldn't find data for media card in search results!"
              );
            }
            return (
              <MediaCard
                key={result.id}
                style="tab-card"
                type={result.type as DisplayableMediaType}
                data={data}
                shouldDisplayType={true}
              />
            );
          })}
      </div>
    </div>
  );
  return (
    <div className="flex flex-col">
      <span className="px-4 pt-4 pb-2 text-gray-400">
        Showing results for: &quot;
        <span className="text-black">{pages.data}</span>&quot;
      </span>
      {searchResults.results.length > 0 ? (
        topResultsList
      ) : (
        <span className="text-2xl p-4">No results found!</span>
      )}
      {searchResults.albums.length > 0 && createMediaDisplay("albums")}
      {searchResults.tracks.length > 0 && createMediaDisplay("tracks")}
      {searchResults.artists.length > 0 && createMediaDisplay("artists")}
      {searchResults.functions.length > 0 && createMediaDisplay("functions")}
      {/* <pre>{JSON.stringify(searchResults, null, 2)}</pre> */}
      <span className="px-4 pb-8 pt-2">
        Can&apos;t find what you&apos;re looking for?{" "}
        <a
          onClick={() => {
            pages.navigate("new", {
              type: "file search",
              data: pages.data,
            });
          }}
          className="text-accent dark:invert cursor-pointer"
        >
          Try searching youtube
        </a>
      </span>
    </div>
  );
}
