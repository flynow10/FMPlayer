import { usePageContext } from "@/src/contexts/PageContext";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { ContextMenuPropType } from "@/src/hooks/use-media-context";
import { MusicLibrary } from "@/src/music/library/music-library";

import { Item, ItemParams, Menu, Separator } from "react-contexify-props";
import { toast } from "react-toastify";

type PlaylistCtxMenuProps = {
  pageSlug: string;
};

export default function PlaylistCtxMenu(props: PlaylistCtxMenuProps) {
  const pages = usePageContext();
  const audioPlayer = useAudioPlayer();

  const addToQueue = async (
    event: ItemParams<ContextMenuPropType<"playlist">>,
    addNext: boolean
  ) => {
    const playlistId = event.props?.playlistId;
    if (typeof playlistId !== "string") {
      alert("This context menu was not set up correctly!");
      throw new Error("Unable to add playlist to queue; missing playlist id!");
    }
    const playlist = await MusicLibrary.db.playlist.get({ id: playlistId });
    if (playlist === null) {
      alert("This context menu was not setup correctly");
      throw new Error(
        "Unable to add playlist to queue; playlist doesn't exist!"
      );
    }
    if (
      !(await audioPlayer.queue.addTrackList(playlist.trackListId, addNext))
    ) {
      alert("Unable to add playlist to queue; reason unknown!");
    }
  };

  const editPlaylist = (event: ItemParams<ContextMenuPropType<"playlist">>) => {
    const playlistId = event.props?.playlistId;
    if (typeof playlistId !== "string") {
      alert("This context menu was not set up correctly!");
      throw new Error("Unable to open playlist editor; missing playlist id!");
    }
    pages.navigate("new", {
      type: "playlist editor",
      data: { isNew: false, id: playlistId },
    });
  };

  const deletePlaylist = async (
    event: ItemParams<ContextMenuPropType<"playlist">>
  ) => {
    const playlistId = event.props?.playlistId;
    if (typeof playlistId !== "string") {
      alert("This context menu was not set up correctly!");
      throw new Error("Unable to delete playlist; missing playlist id!");
    }
    const toastId = toast("Deleting playlist...", {
      isLoading: true,
      autoClose: false,
      type: "info",
    });

    const deletedPlaylist = await MusicLibrary.db.playlist.delete({
      id: playlistId,
    });
    let success = deletedPlaylist !== null;
    if (success) {
      const deletedTrackList = await MusicLibrary.db.trackList.delete({
        id: deletedPlaylist?.trackListId,
      });
      success = deletedTrackList !== null;
    }

    const content = success
      ? `Successfully deleted ${deletedPlaylist!.title}`
      : `Failed to delete playlist!`;
    const type = success ? "success" : "error";
    if (toast.isActive(toastId)) {
      toast.update(toastId, {
        render: content,
        autoClose: 5000,
        isLoading: false,
        type,
      });
    } else {
      toast(content, {
        autoClose: 5000,
        type: type,
      });
    }
  };

  return (
    <Menu
      id={"playlist-" + props.pageSlug}
      theme="dark"
      className="dark:invert"
    >
      <Item
        onClick={(event) => {
          addToQueue(event, false);
        }}
      >
        Play Last
      </Item>
      <Item
        onClick={(event) => {
          addToQueue(event, true);
        }}
      >
        Play Next
      </Item>
      <Separator />
      <Item onClick={editPlaylist}>Edit Playlist</Item>
      <Item
        onClick={(event) => {
          if (!confirm("Are you sure you want to delete this playlist?")) {
            return;
          }
          deletePlaylist(event);
        }}
      >
        <span className="text-red-600">Delete From Library</span>
      </Item>
    </Menu>
  );
}
