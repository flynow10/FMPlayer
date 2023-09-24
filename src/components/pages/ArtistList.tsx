import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Music } from "@/src/types/music";
import { Pages } from "@/src/types/pages";
import classNames from "classnames";
import { LucideIcon, Mic2, Play, User2 /*Users*/ } from "lucide-react";
import { useState } from "react";
import OrderedTrackList from "@/src/components/media-displays/OrderedTrackList";
import MediaCard from "@/src/components/media-displays/MediaCard";
import { usePageContext } from "@/src/contexts/PageContext";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { AudioPlayer } from "@/src/music/player/audio-player";

export default function ArtistList() {
  const pages = usePageContext();
  const audioPlayer = useAudioPlayer();
  const [artistId, setArtistId] = useState(pages.data ?? "all");
  const [artists, state] = useDatabase(
    async () => {
      const artists = await MusicLibrary.db.artist.list(
        {},
        {
          albums: {
            include: {
              album: {
                include: {
                  artists: {
                    include: {
                      artist: true,
                    },
                  },
                  artwork: true,
                  genre: true,
                  trackList: {
                    include: {
                      trackConnections: {
                        include: {
                          track: true,
                        },
                        orderBy: {
                          trackNumber: "asc",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          tracks: {
            include: {
              track: {
                include: {
                  genre: true,
                  listConnections: true,
                },
              },
            },
          },
        }
      );
      return artists.sort((a, b) => a.name.localeCompare(b.name));
    },
    [],
    ["AlbumArtist", "Artist", "TrackArtist"]
  );
  const filteredArtists = artists.filter((artist) => {
    if (["all", "compilations"].includes(artistId)) {
      return true;
    } else {
      return artist.id === artistId;
    }
  });
  if (state === DataState.Loading) {
    return <FullCover />;
  }
  return (
    <div className="flex h-full">
      <div className="flex flex-col overflow-auto border-r-2 max-w-1/5 min-w-1/6">
        {createArtistListItem(
          {
            albums: [],
            createdOn: new Date(),
            id: "all",
            modifiedOn: new Date(),
            name: "All Artists",
            tracks: [],
          },
          Mic2,
          artistId === "all",
          () => {
            setArtistId("all");
          }
        )}
        {/* {createArtistListItem(
          {
            albums: [],
            createdOn: new Date(),
            id: "compilations",
            modifiedOn: new Date(),
            name: "Compilations",
            tracks: [],
          },
          Users,
          artistId === "compilations",
          () => {
            setArtistId("compilations");
          }
        )} */}
        {artists.map((artist) =>
          createArtistListItem(artist, User2, artist.id === artistId, () => {
            setArtistId(artist.id);
          })
        )}
      </div>
      <div className="grow flex flex-col overflow-auto">
        {filteredArtists.map((artist) =>
          createArtistMusicList(pages.navigate, audioPlayer, artist)
        )}
      </div>
    </div>
  );
}

function createArtistMusicList(
  onNavigate: Pages.NavigationMethod,
  audioPlayer: AudioPlayer,
  artist: Music.DB.TableType<
    "Artist",
    {
      tracks: {
        include: {
          track: {
            include: {
              listConnections: true;
              genre: true;
            };
          };
        };
      };
      albums: {
        include: {
          album: {
            include: {
              genre: true;
              artists: {
                include: {
                  artist: true;
                };
              };
              artwork: true;
              trackList: {
                include: {
                  trackConnections: {
                    include: {
                      track: true;
                    };
                  };
                };
              };
            };
          };
        };
      };
    }
  >
) {
  const filteredArtistTracks = artist.tracks.filter(({ track }) =>
    track.listConnections.every(
      (trackConnection) =>
        !artist.albums.some(
          (albumConnection) =>
            albumConnection.album.trackListId === trackConnection.trackListId
        )
    )
  );
  return (
    <div className="flex flex-col relative px-8" key={artist.id}>
      <div className="top-0 sticky z-10 bg-white pt-8 pb-1">
        <span className="text-2xl py-2">{artist.name}</span>
        <hr />
        <span className="text-sm text-gray-600">
          {[
            {
              name: "Albums",
              count: artist.albums.length,
            },
            {
              name: "Tracks",
              count: filteredArtistTracks.length,
            },
          ]
            .filter((obj) => obj.count > 0)
            .map((obj) => `${obj.count} ${obj.name}`)
            .join(", ")}
        </span>
      </div>
      <div className="flex flex-col gap-24">
        {artist.albums
          .filter((connection) => connection.artistType === "MAIN")
          .map(({ album }) => (
            <div key={album.id} className="flex p-4 gap-10">
              <MediaCard
                data={album}
                type="album"
                style="cover-card"
                hideLinks={true}
              />
              <div className="flex flex-col grow gap-4">
                <div className="flex flex-col">
                  <a
                    onClick={() => {
                      onNavigate("new", {
                        type: "album display",
                        data: album.id,
                      });
                    }}
                    className="font-extrabold text-lg text-accent dark:invert"
                  >
                    {album.title}
                  </a>
                  <span className="font-semibold text-sm text-gray-600">
                    {album.genre.name} &bull; {album.createdOn.getFullYear()}
                  </span>
                </div>
                <OrderedTrackList list={album.trackList} />
              </div>
            </div>
          ))}
        {filteredArtistTracks.length > 0 && (
          <div className="flex flex-col p-4">
            <span className="text-lg font-bold">Standalone Tracks</span>
            <div className="flex flex-col w-full">
              {filteredArtistTracks.map(({ track }) => (
                <div
                  key={track.id}
                  className="flex border-t-2 last:border-b-2 p-2 gap-4"
                >
                  <button
                    className="w-6 h-6"
                    onClick={() => {
                      audioPlayer.play.track(track.id);
                    }}
                  >
                    <Play className="block m-0 p-0" />
                  </button>
                  <div>{track.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function createArtistListItem(
  artist: Music.DB.TableType<"Artist", Music.DB.IncludeParameter<"Artist">>,
  icon: LucideIcon,
  isSelected: boolean,
  onClick: () => void
) {
  const Icon = icon;
  return (
    <div key={artist.id} className="border-b-2">
      <button
        onClick={onClick}
        className={classNames(
          "p-4",
          "flex",
          "gap-2",
          "w-full",
          "whitespace-nowrap",
          {
            "bg-accent dark:invert": isSelected,
          }
        )}
      >
        <Icon className="shrink-0" />
        <span className="overflow-hidden overflow-ellipsis">{artist.name}</span>
      </button>
    </div>
  );
}
