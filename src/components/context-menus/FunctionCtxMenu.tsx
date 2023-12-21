import { usePageContext } from "@/src/contexts/PageContext";
import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { useDatabase } from "@/src/hooks/use-database";
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

type FunctionCtxMenuProps = {
  pageSlug: string;
};

export default function FunctionCtxMenu(props: FunctionCtxMenuProps) {
  const audioPlayer = useAudioPlayer();
  const pages = usePageContext();

  const addToQueue = async (
    event: ItemParams<ContextMenuPropType<"function">>,
    addNext: boolean
  ) => {
    const functionId = event.props?.functionId;
    if (typeof functionId !== "string") {
      alert("This context menu was not set up correctly!");
      throw new Error("Unable to open function editor; missing function id!");
    }
    audioPlayer.queue.addFunction(functionId, addNext);
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
      <Item disabled>{(args) => <FunctionTitle {...args} />}</Item>
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
      <Item onClick={editFunction}>Edit Function</Item>
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

// eslint-disable-next-line react/no-multi-comp
function FunctionTitle(args: HandlerParams<ContextMenuPropType<"function">>) {
  const functionId = args.props?.functionId;
  if (typeof functionId !== "string") {
    alert("This context menu was not set up correctly!");
    throw new Error("Unable to open function editor; missing function id!");
  }
  const [functionData] = useDatabase(
    () => {
      return MusicLibrary.db.function.get({ id: functionId });
    },
    null,
    "Function",
    [functionId]
  );
  if (!functionData) {
    return null;
  }
  return functionData.title;
}
