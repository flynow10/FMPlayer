import FileSearch from "@/src/components/pages/upload/FileSearch";
import AlbumList from "@/src/components/pages/AlbumList";
import SongList from "@/src/components/pages/SongList";
import GenreList from "@/src/components/pages/GenreList";
import FileUpload from "@/src/components/pages/upload/FileUpload";
import { Pages } from "@/src/types/pages";

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
        {(() => {
          switch (props.type) {
            case "file search": {
              return <FileSearch onNavigate={props.onNavigate} />;
            }

            case "file upload": {
              return <FileUpload data={props.data} />;
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

            default: {
              return `Page Missing! Type: ${props.type}`;
            }
          }
        })()}
      </div>
    </div>
  );
}
