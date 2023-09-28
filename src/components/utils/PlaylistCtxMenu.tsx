import { ContextMenuPropType } from "@/src/hooks/use-media-context";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Item, ItemParams, Menu, Separator } from "react-contexify";
import { toast } from "react-toastify";

type PlaylistCtxMenuProps = {
  pageSlug: string;
};

export default function PlaylistCtxMenu(props: PlaylistCtxMenuProps) {
  const deletePlaylist = (
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
    MusicLibrary.db.playlist
      .delete({
        id: playlistId,
      })
      .then((deletedPlaylist) => {
        const success = deletedPlaylist !== null;
        const content = success
          ? `Successfully deleted ${deletedPlaylist.title}`
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
      });
  };
  return (
    <Menu
      id={"playlist-" + props.pageSlug}
      theme="dark"
      className="dark:invert"
    >
      <Item
        onClick={() => {
          alert("This function has not been implemented yet!");
        }}
      >
        Add to queue
      </Item>
      <Separator />
      <Item>Edit Playlist</Item>
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
