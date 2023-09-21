import { MediaCard } from "@/src/components/media-displays/OldMediaCard";
import NewMediaCard from "@/src/components/media-displays/MediaCard";
import { Music } from "@/src/types/music";

export default function TestingPage() {
  const testAlbum: Music.DB.TableType<"Album"> = {
    id: "",
    title:
      "The Greatest Showman (Original Motion Picture Soundtrack) [Sing-A-Long Edition]",
    artists: [
      {
        albumId: "",
        artist: {
          id: "",
          name: "Benj Pasek",
          createdOn: new Date(),
          modifiedOn: new Date(),
        },
        artistId: "",
        artistType: "MAIN",
        modifiedOn: new Date(),
      },
    ],
    artwork: null,
    artworkId: null,
    genre: {
      id: "",
      name: "Classical",
      createdOn: new Date(),
      modifiedOn: new Date(),
    },
    genreId: "",
    tags: [],
    trackList: {
      id: "",
      integratedLoudness: 0,
      trackConnections: [],
      createdOn: new Date(),
      modifiedOn: new Date(),
    },
    trackListId: "",
    modifiedOn: new Date(),
    createdOn: new Date(),
  };
  const testArtist: Music.DB.TableType<"Artist"> = {
    id: "",
    name: "The Piano Guys",
    tracks: [],
    albums: [],
    createdOn: new Date(),
    modifiedOn: new Date(),
  };
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-4">
        <span>Old</span>
        <MediaCard
          id=""
          mediaType="album"
          title="The Greatest Showman (Original Motion Picture Soundtrack) [Sing-A-Long Edition]"
          onNavigate={() => {
            return;
          }}
          onPlayMedia={() => {
            return;
          }}
          size="medium"
        />
      </div>
      <div className="flex flex-col gap-4">
        <span>New</span>
        <div className="flex flex-row gap-4">
          <NewMediaCard type="album" style="tab-card" data={testAlbum} />
          <NewMediaCard type="artist" style="tab-card" data={testArtist} />
          <NewMediaCard type="album" style="cover-card" data={testAlbum} />
          <NewMediaCard type="artist" style="cover-card" data={testArtist} />
        </div>
      </div>
    </div>
  );
}
