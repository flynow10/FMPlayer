import { useAsyncLoad } from "@/src/utils/useAsyncLoad";
import { NavigationMethod, PlayByID } from "../Main";
import { MyMusicLibrary } from "@/src/Music/Library/MusicLibrary";
import { FullCover } from "./LoadingPages";
import { GenreMediaResponse } from "api/_postgres-types";
import {
  MediaCard,
  MediaCardSize,
} from "@/src/components/MediaDisplays/MediaCard";
import { MediaCarousel } from "@/src/components/MediaDisplays/MediaCarousel";
import { MediaType } from "@/src/utils/types";

export type GenreListProps = {
  onPlayMedia: PlayByID;
  onNavigate: NavigationMethod;
};

export default function GenreList(props: GenreListProps) {
  const [genreMedia, loaded] = useAsyncLoad<GenreMediaResponse[]>(
    async () => {
      const genreList = await MyMusicLibrary.getGenreList();
      return Promise.all(
        genreList.map((genre) => {
          return MyMusicLibrary.getGenreMedia(genre.genre);
        })
      );
    },
    [],
    []
  );
  if (!loaded) {
    return <FullCover />;
  }
  return (
    <div>
      {genreMedia.map((genreInfo) => {
        const filteredSongs = genreInfo.songs.filter(
          (song) => song.albumId === null
        );
        return (
          <div key={genreInfo.genre} className="flex flex-col p-10">
            <h3 className="text-2xl font-bold">{genreInfo.genre}</h3>
            {genreInfo.albums.length > 0 && (
              <>
                <h2 className="text-lg ml-5">Albums</h2>
                <MediaCarousel>
                  {genreInfo.albums.map((album) => {
                    return (
                      <MediaCard
                        key={album.id}
                        id={album.id}
                        mediaType={MediaType.Album}
                        title={album.title}
                        size={MediaCardSize.Medium}
                        onPlayMedia={props.onPlayMedia}
                        onNavigate={props.onNavigate}
                      />
                    );
                  })}
                </MediaCarousel>
              </>
            )}
            {filteredSongs.length > 0 && (
              <>
                <h2 className="text-lg ml-5">Songs</h2>
                <MediaCarousel>
                  {filteredSongs.map((song) => {
                    return (
                      <MediaCard
                        key={song.id}
                        id={song.id}
                        mediaType={MediaType.Song}
                        size={MediaCardSize.Medium}
                        title={song.title}
                        onPlayMedia={props.onPlayMedia}
                        onNavigate={props.onNavigate}
                      />
                    );
                  })}
                </MediaCarousel>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
