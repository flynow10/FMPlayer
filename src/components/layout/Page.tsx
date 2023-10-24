import UploadSearch from "@/src/components/pages/upload/UploadSearch";
import AlbumList from "@/src/components/pages/AlbumList";
import TrackList from "@/src/components/pages/TrackList";
import GenreList from "@/src/components/pages/GenreList";
import RecentlyAddedList from "@/src/components/pages/RecentlyAddedList";
import FileUpload from "@/src/components/pages/upload/FileUpload";
import { Pages } from "@/src/types/pages";
import YoutubeUpload from "@/src/components/pages/upload/YoutubeUpload";
import TestingPage from "@/src/components/pages/TestingPage";
import { ErrorBoundary } from "react-error-boundary";
import AlbumDisplay from "@/src/components/pages/AlbumDisplay";
import ArtistList from "@/src/components/pages/ArtistList";
import SearchResults from "@/src/components/pages/SearchResults";
import { PageContext } from "@/src/contexts/PageContext";
import PlaylistList from "@/src/components/pages/PlaylistList";
import PlaylistDisplay from "@/src/components/pages/PlaylistDisplay";
import PlaylistCtxMenu from "@/src/components/utils/context-menus/PlaylistCtxMenu";
import { slugify } from "@/src/utils/string-utils";
import PlaylistEditor from "@/src/components/pages/PlaylistEditor";

type PageProps = {
  location: Pages.Location;
  currentLocation: Pages.Location;
  index: number;
  locationPageCount: number;
  type: Pages.PageType;
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onNavigate: Pages.NavigationMethod;
};

const PageComponents: {
  [Key in Pages.PageType]: typeof AlbumDisplay;
} = {
  "recent list": RecentlyAddedList,

  "file search": UploadSearch,

  "file upload": FileUpload,

  "youtube upload": YoutubeUpload,

  "album list": AlbumList,

  "track list": TrackList,

  "genre list": GenreList,

  "artist list": ArtistList,

  "album display": AlbumDisplay,

  "search results": SearchResults,

  "testing page": TestingPage,

  "playlist list": PlaylistList,

  "playlist display": PlaylistDisplay,

  "playlist editor": PlaylistEditor,
};

export default function Page(props: PageProps) {
  const isHidden =
      props.location !== props.currentLocation ||
      props.locationPageCount !== props.index + 1,
    isHiddenClass = isHidden ? "hidden " : "";
  const pageClass = isHiddenClass + "relative max-h-full min-h-0 grow";
  const pageSlug = slugify(props.location, props.type, props.index);
  const PageComponent = PageComponents[props.type];
  return (
    <PageContext.Provider
      value={{
        pageSlug,
        navigate: props.onNavigate,
        location: props.location,
        currentLocation: props.currentLocation,
        data: props.data,
      }}
    >
      <div className={pageClass}>
        <div className="h-full overflow-auto relative">
          <ErrorBoundary
            fallback={
              <span>
                This page failed to load! Check the console for details
              </span>
            }
          >
            <PageComponent />
          </ErrorBoundary>
        </div>
      </div>
      <PlaylistCtxMenu pageSlug={pageSlug} />
    </PageContext.Provider>
  );
}
