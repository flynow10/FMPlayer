import UploadSearch from "@/src/components/pages/upload/UploadSearch";
import AlbumList from "@/src/components/pages/AlbumList";
import SongList from "@/src/components/pages/SongList";
import GenreList from "@/src/components/pages/GenreList";
import RecentlyAddedList from "@/src/components/pages/RecentlyAddedList";
import FileUpload from "@/src/components/pages/upload/FileUpload";
import { Pages } from "@/src/types/pages";
import YoutubeUpload from "@/src/components/pages/upload/YoutubeUpload";
import TestingPage from "@/src/components/pages/TestingPage";
import { ErrorBoundary } from "react-error-boundary";
import AlbumDisplay from "@/src/components/pages/AlbumDisplay";

type PageProps = {
  location: string;
  currentLocation: string;
  index: number;
  locationPageCount: number;
  type: Pages.PageType;
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onNavigate: Pages.NavigationMethod;
  onPlayMedia: Pages.PlayByID;
};

export default function Page(props: PageProps) {
  const isHidden =
      props.location !== props.currentLocation ||
      props.locationPageCount !== props.index + 1,
    isHiddenClass = isHidden ? "hidden " : "";
  const pageClass = isHiddenClass + "relative max-h-full min-h-0 grow";
  return (
    <div className={pageClass}>
      <div className="h-full overflow-auto relative">
        <ErrorBoundary
          fallback={
            <span>This page failed to load! Check the console for details</span>
          }
        >
          {(() => {
            switch (props.type) {
              case "recent list": {
                return (
                  <RecentlyAddedList
                    onPlayMedia={props.onPlayMedia}
                    onNavigate={props.onNavigate}
                  />
                );
              }

              case "file search": {
                return <UploadSearch onNavigate={props.onNavigate} />;
              }

              case "file upload": {
                return (
                  <FileUpload data={props.data} onNavigate={props.onNavigate} />
                );
              }

              case "youtube upload": {
                return (
                  <YoutubeUpload
                    data={props.data}
                    onNavigate={props.onNavigate}
                  />
                );
              }

              case "album list": {
                return (
                  <AlbumList
                    onPlayMedia={props.onPlayMedia}
                    onNavigate={props.onNavigate}
                  />
                );
              }

              case "song list": {
                return (
                  <SongList
                    onPlayMedia={props.onPlayMedia}
                    onNavigate={props.onNavigate}
                  />
                );
              }

              case "genre list": {
                return (
                  <GenreList
                    onPlayMedia={props.onPlayMedia}
                    onNavigate={props.onNavigate}
                  />
                );
              }

              case "testing page": {
                return <TestingPage />;
              }

              case "album display": {
                return (
                  <AlbumDisplay
                    onPlayMedia={props.onPlayMedia}
                    onNavigate={props.onNavigate}
                    albumId={props.data as string}
                  />
                );
              }

              default: {
                return <span>Page Missing! Type: {props.type}</span>;
              }
            }
          })()}
        </ErrorBoundary>
      </div>
    </div>
  );
}
