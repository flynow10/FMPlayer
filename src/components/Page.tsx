import { NavigationMethod, PlayByID } from "./Main";
import FileSearch from "./pages/upload/FileSearch";
import AlbumList from "./pages/AlbumList";
import SongList from "./pages/SongList";
import GenreList from "./pages/GenreList";
import FileUpload from "./pages/upload/FileUpload";

type PageProps = {
  location: string;
  currentLocation: string;
  index: number;
  locationPageCount: number;
  type: PageType;
  data: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  onNavigate: NavigationMethod;
  onPlayMedia: PlayByID;
};

export enum PageType {
  SearchResults,
  AlbumList,
  SongList,
  PlaylistList,
  AlbumDisplay,
  FileSearch,
  GenreList,
  FileUpload,
}

export default function Page(props: PageProps) {
  const isHidden =
      props.location !== props.currentLocation ||
      props.locationPageCount !== props.index + 1,
    isHiddenClass = isHidden ? "hidden " : "";
  const pageClass = isHiddenClass + "relative max-h-full min-h-0 grow";
  return (
    <div className={pageClass}>
      <div className="h-full overflow-auto relative">
        {(() => {
          switch (props.type) {
            case PageType.FileSearch: {
              return <FileSearch onNavigate={props.onNavigate} />;
            }
            case PageType.FileUpload: {
              return <FileUpload data={props.data} />;
            }
            case PageType.AlbumList: {
              return (
                <AlbumList
                  onPlayMedia={props.onPlayMedia}
                  onNavigate={props.onNavigate}
                />
              );
            }
            case PageType.SongList: {
              return (
                <SongList
                  onPlayMedia={props.onPlayMedia}
                  onNavigate={props.onNavigate}
                />
              );
            }
            case PageType.GenreList: {
              return (
                <GenreList
                  onPlayMedia={props.onPlayMedia}
                  onNavigate={props.onNavigate}
                />
              );
            }
            default: {
              return `Page Missing! Type: ${props.type}`;
            }
          }
        })()}
      </div>
    </div>
  );
}
