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
import PlaylistCtxMenu from "@/src/components/utils/PlaylistCtxMenu";
import { slugify } from "@/src/utils/string-utils";

type PageProps = {
  location: Pages.Location;
  currentLocation: Pages.Location;
  index: number;
  locationPageCount: number;
  type: Pages.PageType;
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onNavigate: Pages.NavigationMethod;
};

export default function Page(props: PageProps) {
  const isHidden =
      props.location !== props.currentLocation ||
      props.locationPageCount !== props.index + 1,
    isHiddenClass = isHidden ? "hidden " : "";
  const pageClass = isHiddenClass + "relative max-h-full min-h-0 grow";
  const pageSlug = slugify(props.location, props.type, props.index);
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
            {(() => {
              switch (props.type) {
                case "recent list": {
                  return <RecentlyAddedList />;
                }

                case "file search": {
                  return <UploadSearch />;
                }

                case "file upload": {
                  return <FileUpload />;
                }

                case "youtube upload": {
                  return <YoutubeUpload />;
                }

                case "album list": {
                  return <AlbumList />;
                }

                case "track list": {
                  return <TrackList />;
                }

                case "genre list": {
                  return <GenreList />;
                }

                case "artist list": {
                  return <ArtistList />;
                }

                case "album display": {
                  return <AlbumDisplay />;
                }

                case "search results": {
                  return <SearchResults />;
                }

                case "testing page": {
                  return <TestingPage />;
                }

                case "playlist list": {
                  return <PlaylistList />;
                }

                case "playlist display": {
                  return <PlaylistDisplay />;
                }

                default: {
                  return <span>Page Missing! Type: {props.type}</span>;
                }
              }
            })()}
          </ErrorBoundary>
        </div>
      </div>
      <PlaylistCtxMenu pageSlug={pageSlug} />
    </PageContext.Provider>
  );
}
