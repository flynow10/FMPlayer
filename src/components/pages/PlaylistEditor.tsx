import LinkedArtistList from "@/src/components/media-displays/LinkedArtistList";
import VerticalSplit from "@/src/components/utils/VerticalSplit";
import { FullCover } from "@/src/components/utils/loading-pages/FullCover";
import { usePageContext } from "@/src/contexts/PageContext";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Music } from "@/src/types/music";
import { Menu, Play, Plus, PlusCircle, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { toast } from "react-toastify";
import classNames from "classnames";
import { v4 as uuid } from "uuid";

type UniqueTrack = { trackId: string; key: string };

export default function PlaylistEditor() {
  const pages = usePageContext();
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
  const [playlistTracksIds, setPlaylistTracksIds] = useState<UniqueTrack[]>([]);
  const [playlistLoaded, setPlaylistLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setPlaylistLoaded(false);
      const playlistData = await MusicLibrary.db.playlist.get({
        id: pages.data,
      });
      if (!playlistData) {
        alert("Playlist editor failed to load!");
        throw new Error("Failed to load current playlist data!");
      }
      if (active) {
        setOriginalPlaylistData(playlistData);
        setPlaylistTracksIds(
          playlistData.trackList.trackConnections.map((trackConn) => ({
            trackId: trackConn.trackId,
            key: uuid(),
          }))
        );
        setPlaylistLoaded(true);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [pages.data]);

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

  const reorder = (
    list: UniqueTrack[],
    startIndex: number,
    endIndex: number
  ) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const savePlaylist = async () => {
    if (!originalPlaylistData) {
      alert("Failed to save playlist!");
      return;
    }
    pages.navigate("back");
    const toastId = toast(`Updating playlist...`, {
      autoClose: false,
      isLoading: true,
      closeButton: false,
      closeOnClick: false,
      draggable: false,
      type: "info",
    });
    const updatedPlaylist = await MusicLibrary.db.playlist.update(
      {
        id: originalPlaylistData.id,
      },
      {
        trackList: {
          update: {
            trackConnections: {
              deleteMany: {},
              createMany: {
                data: playlistTracksIds.map((track, index) => ({
                  trackId: track.trackId,
                  trackNumber: index + 1,
                })),
              },
            },
          },
        },
      }
    );
    const success = updatedPlaylist !== null;

    const tracksAdded = playlistTracksIds.reduce(
      (acc, track) => acc + (originalTrackIds.includes(track.trackId) ? 0 : 1),
      0
    );
    const tracksRemoved = originalTrackIds.reduce(
      (acc, track) =>
        acc + (playlistTracksIds.map((t) => t.trackId).includes(track) ? 0 : 1),
      0
    );
    toast.update(toastId, {
      render: success
        ? `Successfully added ${tracksAdded} track${
            tracksAdded !== 1 ? "s" : ""
          } and removed ${tracksRemoved} track${tracksRemoved !== 1 ? "s" : ""}`
        : "Failed to update playlist!",
      autoClose: 5000,
      draggable: true,
      closeOnClick: true,
      closeButton: true,
      isLoading: false,
      type: success ? "success" : "error",
    });
  };
  if (!playlistLoaded || trackLoadState !== DataState.Loaded) {
    return <FullCover />;
  }
  return (
    <VerticalSplit
      minWidth={300}
      left={
        <div className="flex flex-col h-full">
          <span className="text-xl p-4 border-b-2">
            {originalPlaylistData?.title}
          </span>
          <DragDropContext
            onDragEnd={(result) => {
              if (!result.destination) {
                return;
              }
              let items: UniqueTrack[];
              if (result.destination.droppableId === "trash") {
                items = Array.from(playlistTracksIds);
                items.splice(result.source.index, 1);
              } else {
                items = reorder(
                  playlistTracksIds,
                  result.source.index,
                  result.destination.index
                );
              }

              setPlaylistTracksIds(items);
            }}
          >
            <div className="flex flex-col grow relative overflow-hidden">
              <Droppable droppableId={pages.pageSlug + "-playlist-drop"}>
                {(provided) => (
                  <div
                    className="flex flex-col overflow-y-scroll select-none"
                    {...provided.droppableProps}
                  >
                    <div ref={provided.innerRef}>
                      {playlistTracksIds.map((uniqueTrack, index) => {
                        const track = tracks.find(
                          (t) => t.id === uniqueTrack.trackId
                        );
                        if (!track) {
                          throw new Error("Missing track in playlist!");
                        }
                        return (
                          <Draggable
                            key={uniqueTrack.key}
                            draggableId={uniqueTrack.key}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  ...(snapshot.isDropAnimating &&
                                  snapshot.draggingOver === "trash"
                                    ? {
                                        transitionDuration: "0.001s",
                                      }
                                    : {}),
                                }}
                                className={classNames(
                                  "flex gap-2 p-4 bg-white",
                                  {
                                    "border-2":
                                      snapshot.isDragging &&
                                      !snapshot.isDropAnimating,
                                    "border-b-2":
                                      !snapshot.isDragging ||
                                      snapshot.isDropAnimating,
                                  }
                                )}
                              >
                                <span>{index + 1}.</span>
                                <span>{track.title}</span>
                                <Menu className="ml-auto" />
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
            <div className="border-t-2">
              <Droppable droppableId="trash">
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={classNames(
                      "p-4 flex flex-row gap-2 text-white dark:invert",
                      {
                        "bg-red-400": snapshot.isDraggingOver,
                      }
                    )}
                  >
                    <Trash />
                    <span>Trash</span>
                    <div className="hidden">{provided.placeholder}</div>
                  </div>
                )}
              </Droppable>
            </div>
          </DragDropContext>
          <div className="flex flex-col border-t-2 p-2">
            <button
              onClick={savePlaylist}
              disabled={
                playlistTracksIds.length === 0 ||
                (originalTrackIds.length === playlistTracksIds.length &&
                  originalTrackIds.reduce(
                    (same, id, index) =>
                      same && id === playlistTracksIds[index].trackId,
                    true
                  ))
              }
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
              const filter = event.currentTarget.value.trim().toLowerCase();
              setFilter(filter);
            }}
            value={filter}
            className="input"
            placeholder="Filter results..."
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
                        return [...prev, { trackId: track.id, key: uuid() }];
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
