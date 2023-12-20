import MediaCard from "@/src/components/media-displays/MediaCard";
import MediaCarousel from "@/src/components/media-displays/MediaCarousel";
import FullCover from "@/src/components/utils/loading/FullCover";

import { DataState, useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";

export default function GenreList() {
  const [genreMedia, loadedState] = useDatabase(
    async () => {
      return await MusicLibrary.db.genre.list();
    },
    [],
    ["Genre", "Album", "Track"]
  );

  if (loadedState === DataState.Loading) {
    return <FullCover />;
  }

  return (
    <div>
      {genreMedia.map((genreInfo) => {
        return (
          <div key={genreInfo.name} className="flex flex-col p-10">
            <h3 className="text-2xl font-bold">{genreInfo.name}</h3>
            {genreInfo.albums.length > 0 && (
              <>
                <h2 className="text-lg ml-5">Albums</h2>
                <MediaCarousel>
                  {genreInfo.albums.map((album) => {
                    return (
                      <MediaCard
                        key={album.id}
                        type="album"
                        data={album}
                        style="cover-card"
                      />
                    );
                  })}
                </MediaCarousel>
              </>
            )}
            {genreInfo.tracks.length > 0 && (
              <>
                <h2 className="text-lg ml-5">Tracks</h2>
                <MediaCarousel>
                  {genreInfo.tracks.map((track) => {
                    return (
                      <MediaCard
                        key={track.id}
                        data={track}
                        style="cover-card"
                        type="track"
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
