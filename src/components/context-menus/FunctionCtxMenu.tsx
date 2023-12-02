import { usePageContext } from "@/src/contexts/PageContext";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { ContextMenuPropType } from "@/src/hooks/use-media-context";
import { MusicLibrary } from "@/src/music/library/music-library";
import { Item, ItemParams, Menu, Separator } from "react-contexify";
import { toast } from "react-toastify";

type FunctionCtxMenuProps = {
  pageSlug: string;
};

export default function FunctionCtxMenu(props: FunctionCtxMenuProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const audioPlayer = useAudioPlayer();
  const pages = usePageContext();

  const addToQueue = async (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    event: ItemParams<ContextMenuPropType<"function">>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addNext: boolean
  ) => {
    alert("This feature has not been implemented yet!");
  };
  const editFunction = (event: ItemParams<ContextMenuPropType<"function">>) => {
    const functionId = event.props?.functionId;
    if (typeof functionId !== "string") {
      alert("This context menu was not set up correctly!");
      throw new Error("Unable to open function editor; missing function id!");
    }
    pages.navigate("new", {
      type: "function editor",
      data: { isNew: false, id: functionId },
    });
  };

  const deleteFunction = async (
    event: ItemParams<ContextMenuPropType<"function">>
  ) => {
    const functionId = event.props?.functionId;
    if (typeof functionId !== "string") {
      alert("This context menu was not set up correctly!");
      throw new Error("Unable to delete function; missing function id!");
    }
    const toastId = toast("Deleting album...", {
      isLoading: true,
      autoClose: false,
      type: "info",
    });
    const deletedFunction = await MusicLibrary.db.function.delete({
      id: functionId,
    });
    const success = deletedFunction !== null;
    const content = success
      ? `Successfully deleted ${deletedFunction!.title}`
      : `Failed to delete function!`;
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
      id={"function-" + props.pageSlug}
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
      <Item onClick={editFunction}>Edit Playlist</Item>
      <Item
        onClick={(event) => {
          if (!confirm("Are you sure you want to delete this function?")) {
            return;
          }
          deleteFunction(event);
        }}
      >
        <span className="text-red-600">Delete From Library</span>
      </Item>
    </Menu>
  );
}
