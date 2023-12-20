import { useEffect, useState } from "react";

import Artwork from "@/src/components/media-displays/Artwork";
import LinkedArtistList from "@/src/components/media-displays/LinkedArtistList";
import TogglableInput from "@/src/components/utils/input-extensions/TogglableInput";
import FullCover from "@/src/components/utils/loading/FullCover";
import VerticalSplit from "@/src/components/utils/VerticalSplit";

import { usePageContext } from "@/src/contexts/PageContext";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Music } from "@/src/types/music";

import classNames from "classnames";
import { Menu, Play, Plus, PlusCircle, Trash } from "lucide-react";
import { ReactSortable } from "react-sortablejs";
import { toast } from "react-toastify";
import { v4 as uuid } from "uuid";

type UniqueTrack = { trackId: string; id: string };

export default function PlaylistEditor() {
  const pages = usePageContext();

  const { isNew, id: oldPlaylistId } = pages.data as
    | { isNew: false; id: string }
    | { isNew: true; id: null };

  const audioPlayer = useAudioPlayer();
  const [tracks, trackLoadState] = useDatabase(
    () => {
      return MusicLibrary.db.track.list();
    },
    [],
    "Track"
  );
  const [originalPlaylistData, setOriginalPlaylistData] =
    useState<Music.DB.TableType<"Playlist"> | null>(null);

  const originalTrackIds = (
    originalPlaylistData?.trackList.trackConnections ?? []
  ).map((trackConn) => trackConn.trackId);

  const [playlistTitle, setPlaylistTitle] = useState("");
  const [playlistTracksIds, setPlaylistTracksIds] = useState<UniqueTrack[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!isNew) {
        const playlistData = await MusicLibrary.db.playlist.get({
          id: oldPlaylistId,
        });
        if (!playlistData) {
          alert("Playlist editor failed to load!");
          throw new Error("Failed to load current playlist data!");
        }
        if (active) {
          setOriginalPlaylistData(playlistData);
          setPlaylistTitle(playlistData.title);
          setPlaylistTracksIds(
            playlistData.trackList.trackConnections.map((trackConn) => ({
              trackId: trackConn.trackId,
              id: uuid(),
            }))
          );
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [isNew, oldPlaylistId]);

  const [filter, setFilter] = useState<string>("");
  const trimmedFilter = filter.toLowerCase().trim();
  const trackFilter = (track: Music.DB.TableType<"Track">) => {
    return (
      trimmedFilter.length === 0 ||
      track.title.toLowerCase().includes(trimmedFilter) ||
      track.artists.some((a) =>
        a.artist.name.toLowerCase().includes(trimmedFilter)
      )
    );
  };

  const savePlaylist = async () => {
    if (!isSaveable) {
      alert("This playlist isn't saveable right now!");
      return;
    }
    const trackData = playlistTracksIds.map((track, index) => ({
      trackId: track.trackId,
      trackNumber: index + 1,
    }));
    const toastId = toast(`${isNew ? "Creating" : "Updating"} playlist...`, {
      autoClose: false,
      isLoading: true,
      closeButton: false,
      closeOnClick: false,
      draggable: false,
      type: "info",
    });
    if (isNew) {
      pages.navigate("back");
      const newPlaylist = await MusicLibrary.db.playlist.create({
        title: playlistTitle,
        trackList: {
          create: {
            trackConnections: {
              createMany: {
                data: trackData,
              },
            },
          },
        },
      });
      const success = newPlaylist !== null;

      toast.update(toastId, {
        render: success
          ? `Successfully created playlist "${newPlaylist.title}"`
          : "Failed to update playlist!",
        autoClose: 5000,
        draggable: true,
        closeOnClick: true,
        closeButton: true,
        isLoading: false,
        type: success ? "success" : "error",
      });
    } else {
      if (!originalPlaylistData) {
        alert("Failed to save playlist!");
        return;
      }
      pages.navigate("back");

      const updatedPlaylist = await MusicLibrary.db.playlist.update(
        {
          id: originalPlaylistData.id,
        },
        {
          title: playlistTitle,
          trackList: {
            update: {
              trackConnections: {
                deleteMany: {},
                createMany: {
                  data: trackData,
                },
              },
            },
          },
        }
      );
      const success = updatedPlaylist !== null;
      const oldTrackIds = [...originalTrackIds];

      let tracksAdded = 0;
      for (let i = 0; i < playlistTracksIds.length; i++) {
        const { trackId } = playlistTracksIds[i];
        const index = oldTrackIds.indexOf(trackId);
        if (index === -1) {
          tracksAdded++;
        } else {
          oldTrackIds.splice(index, 1);
        }
      }

      const newTrackIds = playlistTracksIds.map((t) => t.trackId);

      let tracksRemoved = 0;
      for (let i = 0; i < originalTrackIds.length; i++) {
        const trackId = originalTrackIds[i];
        const index = newTrackIds.indexOf(trackId);
        if (index === -1) {
          tracksRemoved++;
        } else {
          newTrackIds.splice(index, 1);
        }
      }

      toast.update(toastId, {
        render: (
          <span>
            {success ? (
              <span>
                Successfully updated playlist
                {tracksAdded > 0 || tracksRemoved > 0 ? ":" : "!"}
                {tracksAdded > 0 && (
                  <>
                    <br /> {tracksAdded} track{tracksAdded !== 1 ? "s" : ""}{" "}
                    added
                  </>
                )}
                {tracksRemoved > 0 && (
                  <>
                    <br />
                    {tracksRemoved} track{tracksRemoved !== 1 ? "s" : ""}{" "}
                    removed
                  </>
                )}
              </span>
            ) : (
              "Failed to update playlist!"
            )}
          </span>
        ),
        autoClose: 5000,
        draggable: true,
        closeOnClick: true,
        closeButton: true,
        isLoading: false,
        type: success ? "success" : "error",
      });
    }
  };
  if (trackLoadState !== DataState.Loaded) {
    return <FullCover />;
  }

  const hasPlaylistChanged =
    originalPlaylistData === null ||
    originalTrackIds.length !== playlistTracksIds.length ||
    originalPlaylistData.title !== playlistTitle ||
    originalTrackIds.reduce(
      (same, id, index) => same || id !== playlistTracksIds[index].trackId,
      false
    );
  const isSaveable =
    playlistTracksIds.length > 0 &&
    playlistTitle.trim().length > 0 &&
    hasPlaylistChanged;
  return (
    <VerticalSplit
      minWidth={300}
      left={
        <div className="flex flex-col h-full">
          <div className="text-xl p-2 border-b-2">
            <TogglableInput
              onChange={(newValue) => {
                setPlaylistTitle(newValue);
              }}
              value={playlistTitle}
              placeholder="Untitled Playlist"
            />
          </div>
          <ReactSortable
            className="flex flex-col grow overflow-y-auto"
            list={playlistTracksIds}
            setList={setPlaylistTracksIds}
            direction={"vertical"}
            animation={200}
          >
            {playlistTracksIds.map((uniqueTrack) => {
              const track = tracks.find((t) => t.id === uniqueTrack.trackId);
              if (!track) {
                throw new Error("Missing track in playlist!");
              }
              return (
                <div
                  key={uniqueTrack.id}
                  className={classNames(
                    "flex",
                    "gap-2",
                    "p-2",
                    "bg-white",
                    "border-b-2"
                  )}
                >
                  <div className="h-10">
                    <Artwork id={track.artworkId} />
                  </div>
                  <span className="my-auto">{track.title}</span>
                  <div className="ml-auto my-auto">
                    <button className="hover:bg-gray-200 rounded-md p-1">
                      <Menu />
                    </button>
                    <button
                      onClick={() => {
                        setPlaylistTracksIds((prev) => {
                          return prev.filter(
                            (fTrack) => fTrack.id !== uniqueTrack.id
                          );
                        });
                      }}
                      className="group hover:bg-gray-200 rounded-md p-1 hover:text-red-400"
                    >
                      <Trash className="dark:group-hover:invert" />
                    </button>
                  </div>
                </div>
              );
            })}
          </ReactSortable>
          <div className="flex flex-col border-t-2 p-2 mt-auto">
            <button
              onClick={savePlaylist}
              disabled={!isSaveable}
              className="btn success"
            >
              Save Playlist
            </button>
          </div>
        </div>
      }
      right={
        <div className="flex flex-col p-2 gap-2  overflow-hidden h-full">
          <input
            onChange={async (event) => {
              const filter = event.currentTarget.value;
              setFilter(filter);
            }}
            value={filter}
            className="input"
            placeholder="Filter tracks..."
          />
          <div className="flex flex-col overflow-auto">
            {tracks.filter(trackFilter).map((track) => {
              return (
                <div
                  key={track.id}
                  className="flex items-center border-t-2 last:border-b-2 p-2 gap-4"
                >
                  <button
                    className="w-6 h-6"
                    onClick={() => {
                      audioPlayer.play.track(track.id);
                    }}
                  >
                    <Play className="block m-0 p-0" />
                  </button>
                  <div className="flex flex-col">
                    <span>{track.title}</span>
                    <span>
                      <LinkedArtistList
                        artistList={track.artists}
                        onClickArtist={(artistId) => {
                          const artist = track.artists.find(
                            (a) => a.artistId === artistId
                          );
                          if (artist) {
                            setFilter(artist.artist.name);
                          }
                        }}
                      />
                    </span>
                  </div>
                  <button
                    className="group ml-auto w-6 h-6"
                    onClick={() => {
                      setPlaylistTracksIds((prev) => {
                        return [...prev, { trackId: track.id, id: uuid() }];
                      });
                    }}
                  >
                    <Plus className="group-hover:hidden" />
                    <PlusCircle className="hidden group-hover:block" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      }
    />
  );
}
