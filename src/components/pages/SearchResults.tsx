import MediaCard, {
  DisplayableMediaType,
} from "@/src/components/media-displays/MediaCard";
import { MediaCarousel } from "@/src/components/media-displays/MediaCarousel";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Pages } from "@/src/types/pages";

type SearchResultsProps = {
  onPlayMedia: Pages.PlayByID;
  onNavigate: Pages.NavigationMethod;
  searchString: string;
};

export default function SearchResults(props: SearchResultsProps) {
  const [searchResults, isLoaded] = useAsyncLoad(
    () => {
      return MusicLibrary.search(props.searchString);
    },
    null,
    [props.searchString]
  );
  if (!isLoaded || searchResults === null) {
    return <FullCover />;
  }
  const createMediaDisplay = (type: "albums" | "tracks" | "artists") => {
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
                type={type.slice(0, -1) as "track" | "album" | "artist"}
                style="cover-card"
              />
            );
          })}
        </MediaCarousel>
      </div>
    );
  };
  return (
    <div className="flex flex-col">
      <span className="px-4 pt-4 pb-2 text-gray-400">
        Showing results for: &quot;
        <span className="text-black">{props.searchString}</span>&quot;
      </span>
      <div className="flex flex-col p-4">
        <span className="text-2xl pb-4">Top Results</span>
        <div className="flex flex-row gap-4">
          {searchResults.results
            .filter((result) =>
              ["track", "album", "artist", "playlist"].includes(result.type)
            )
            .slice(0, 3)
            .map((result) => {
              const data = searchResults[
                (result.type + "s") as
                  | "tracks"
                  | "albums"
                  | "artists"
                  | "playlists"
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
      {searchResults.albums.length > 0 && createMediaDisplay("albums")}
      {searchResults.tracks.length > 0 && createMediaDisplay("tracks")}
      {searchResults.artists.length > 0 && createMediaDisplay("artists")}
      {/* <pre>{JSON.stringify(searchResults, null, 2)}</pre> */}
      <span className="px-4 py-8">
        Can&apos;t find what you&apos;re looking for?{" "}
        <a
          onClick={() => {
            props.onNavigate("new", {
              type: "file search",
              data: props.searchString,
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
