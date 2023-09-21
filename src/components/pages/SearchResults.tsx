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
  return (
    <div className="flex flex-col">
      <span className="p-4 text-gray-400">
        Showing results for: &quot;
        <span className="text-black">{props.searchString}</span>&quot;
      </span>
      <pre>{JSON.stringify(searchResults, null, 2)}</pre>
    </div>
  );
}
