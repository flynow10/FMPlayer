import { Play } from "lucide-react";
import { NavigationMethod, PlayByID } from "./Main";
import { MediaType } from "@/src/utils/types";
import Upload from "./pages/upload/Upload";
import AlbumList from "./pages/AlbumList";
import SongList from "./pages/SongList";
import GenreList from "./pages/GenreList";

type PageProps = {
  location: string;
  currentLocation: string;
  index: number;
  locationPageCount: number;
  type: PageType;
  data: string;
  onNavigate: NavigationMethod;
  onPlayMedia: PlayByID;
};

export enum PageType {
  SearchResults,
  AlbumList,
  SongList,
  PlaylistList,
  AlbumDisplay,
  UploadMedia,
  GenreList,
}

export default function Page(props: PageProps) {
  const isHidden =
      props.location !== props.currentLocation ||
      props.locationPageCount !== props.index + 1,
    isHiddenClass = isHidden ? "hidden " : "";
  const pageClass = isHiddenClass + "relative max-h-full min-h-0 grow";
  if (props.type === PageType.UploadMedia) {
    return (
      <div className={pageClass}>
        <div className="h-full px-4">
          <Upload />
        </div>
      </div>
    );
  }
  return (
    <div className={pageClass}>
      <div className="h-full overflow-auto relative">
        {(() => {
          switch (props.type) {
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
            // case PageType.PlaylistList: {
            //   return (
            //     <div className="grid grid-cols-5 gap-x-8 overflow-auto">
            //       {MyMusicLibrary.getAllPlaylists().map((playlist) =>
            //         createCoverCard(
            //           playlist,
            //           props.onPlayMedia,
            //           props.onNavigate
            //         )
            //       )}
            //     </div>
            //   );
            // }
            // case PageType.AlbumList: {
            //   return (
            //     <div className="grid grid-cols-5 gap-x-8 overflow-auto">
            //       {MyMusicLibrary.getAlbumList().map((album) =>
            //         createCoverCard(album, props.onPlayMedia, props.onNavigate)
            //       )}
            //     </div>
            //   );
            // }
            // case PageType.SongList: {
            //   var songList: Song[] | undefined = undefined;
            //   const album = MyMusicLibrary.getAlbum(props.data);
            //   if (album) {
            //     songList = MyMusicLibrary.getAlbumSongs(album);
            //   }
            //   if (!songList) {
            //     songList = MyMusicLibrary.getAllSongs();
            //   }
            //   return (
            //     <table className="text-left">
            //       <thead className="border-b-2">
            //         <tr>
            //           <th className="p-1"></th>
            //           <th className="p-1">Title</th>
            //         </tr>
            //       </thead>
            //       <tbody>
            //         {songList.map((song) => (
            //           <tr key={song.id}>
            //             <td
            //               role="button"
            //               className="p-2"
            //               onClick={() => {
            //                 props.onPlayMedia(song.id, MediaType.Song);
            //               }}
            //             >
            //               <Play />
            //             </td>
            //             <td className="p-1">{song.title}</td>
            //           </tr>
            //         ))}
            //       </tbody>
            //     </table>
            //   );
            // }
            default: {
              return `Page Missing! Type: ${props.type}`;
            }
          }
        })()}
      </div>
    </div>
  );
}
