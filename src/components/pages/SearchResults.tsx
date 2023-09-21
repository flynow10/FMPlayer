import { MediaCard } from "@/src/components/media-displays/MediaCard";
import { MediaCarousel } from "@/src/components/media-displays/MediaCarousel";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Music } from "@/src/types/music";
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
  const createMediaDisplay = (type: "albums" | "tracks") => {
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
                id={media.id}
                mediaType={type.slice(0, -1) as Music.MediaType}
                onNavigate={props.onNavigate}
                onPlayMedia={props.onPlayMedia}
                title={media.title}
                size="medium"
              />
            );
          })}
        </MediaCarousel>
      </div>
    );
  };
  return (
    <div className="flex flex-col">
      <span className="p-4 text-gray-400">
        Showing results for: &quot;
        <span className="text-black">{props.searchString}</span>&quot;
      </span>
      {searchResults.albums.length > 0 && createMediaDisplay("albums")}
      {searchResults.tracks.length > 0 && createMediaDisplay("tracks")}
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
