import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { DataState, useDatabase } from "@/src/hooks/use-database";
import { ContextMenuPropType } from "@/src/hooks/use-media-context";
import { MusicLibrary } from "@/src/music/library/music-library";

import {
  HandlerParams,
  Item,
  ItemParams,
  Menu,
  Separator,
} from "react-contexify-props";
import { toast } from "react-toastify";

type AlbumCtxMenuProps = {
  pageSlug: string;
};

export default function AlbumCtxMenu(props: AlbumCtxMenuProps) {
  const audioPlayer = useAudioPlayer();

  const addToQueue = async (
    event: ItemParams<ContextMenuPropType<"album">>,
    addNext: boolean
  ) => {
    const albumId = event.props?.albumId;
    if (typeof albumId !== "string") {
      alert("This context menu was not set up correctly!");
      throw new Error("Unable to add album to queue; missing album id!");
    }
    const album = await MusicLibrary.db.album.get({ id: albumId });
    if (album === null) {
      alert("This context menu was not setup correctly");
      throw new Error("Unable to add album to queue; album doesn't exist!");
    }
    if (!(await audioPlayer.queue.addTrackList(album.trackListId, addNext))) {
      alert("Unable to add album to queue; reason unknown!");
    }
  };

  const deleteAlbum = async (
    event: ItemParams<ContextMenuPropType<"album">>
  ) => {
    const albumId = event.props?.albumId;
    if (typeof albumId !== "string") {
      alert("This context menu was not set up correctly!");
      throw new Error("Unable to delete album; missing album id!");
    }
    const toastId = toast("Deleting album...", {
      isLoading: true,
      autoClose: false,
      type: "info",
    });
    const deletedAlbum = await MusicLibrary.db.album.delete({
      id: albumId,
    });
    let success = deletedAlbum !== null;
    if (success) {
      const deletedTrackList = await MusicLibrary.db.trackList.delete({
        id: deletedAlbum?.trackListId,
      });
      success = deletedTrackList !== null;
    }
    const content = success
      ? `Successfully deleted ${deletedAlbum!.title}`
      : `Failed to delete album!`;
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
    <Menu id={"album-" + props.pageSlug} theme="dark" className="dark:invert">
      <Item disabled>{(args) => <AlbumTitle {...args} />}</Item>
      <Separator />
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
      <Item
        disabled
        onClick={(event) => {
          alert("This feature is not working quite yet!");
          return;
          if (!confirm("Are you sure you want to delete this album?")) {
            return;
          }
          deleteAlbum(event);
        }}
      >
        <span className="text-red-600">Delete From Library</span>
      </Item>
    </Menu>
  );
}

// eslint-disable-next-line react/no-multi-comp
function AlbumTitle(args: HandlerParams<ContextMenuPropType<"album">>) {
  const albumId = args.props?.albumId;
  if (typeof albumId !== "string") {
    alert("This context menu was not set up correctly!");
    throw new Error("Unable to add album to queue; missing album id!");
  }
  const [album, state] = useDatabase(
    () => {
      return MusicLibrary.db.album.get({ id: albumId });
    },
    null,
    "Album",
    [albumId]
  );
  if (!album || state === DataState.Stale) {
    return "Loading...";
  }
  return album.title;
}
