import { useAsyncLoad } from "@/src/hooks/use-async-load";
import { MusicLibrary } from "@/src/music/library/music-library";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { MediaCard } from "@/src/components/media-displays/MediaCard";
import { MediaCarousel } from "@/src/components/media-displays/MediaCarousel";
import { Pages } from "@/src/types/pages";

type GenreListProps = {
  onPlayMedia: Pages.PlayByID;
  onNavigate: Pages.NavigationMethod;
};

export default function GenreList(props: GenreListProps) {
  const [genreMedia, loaded] = useAsyncLoad(
    async () => {
      return await MusicLibrary.db.genre.list();
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
                        id={album.id}
                        mediaType={"album"}
                        title={album.title}
                        size={"medium"}
                        onPlayMedia={props.onPlayMedia}
                        onNavigate={props.onNavigate}
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
                        id={track.id}
                        mediaType={"track"}
                        size={"medium"}
                        title={track.title}
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
