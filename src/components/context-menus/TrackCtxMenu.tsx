import { useAudioPlayer } from "@/src/hooks/use-audio-player";
import { ContextMenuPropType } from "@/src/hooks/use-media-context";
import { Item, ItemParams, Menu, Separator } from "react-contexify";

type TrackCtxMenuProps = {
  pageSlug: string;
};

export default function TrackCtxMenu(props: TrackCtxMenuProps) {
  const audioPlayer = useAudioPlayer();

  const addToQueue = async (
    event: ItemParams<ContextMenuPropType<"track">>,
    addNext: boolean
  ) => {
    const trackId = event.props?.trackId;
    if (typeof trackId !== "string") {
      alert("This context menu was not set up correctly!");
      throw new Error("Unable to add track to queue; missing track id!");
    }
    if (!(await audioPlayer.queue.addTrack(trackId, addNext))) {
      alert("Unable to add track to queue; reason unknown!");
    }
  };

  const deleteTrack = async () =>
    // event: ItemParams<ContextMenuPropType<"track">>
    {
      throw new Error("Not implemented");
    };

  return (
    <Menu id={"track-" + props.pageSlug} theme="dark" className="dark:invert">
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
        onClick={() => {
          alert("This feature is not working quite yet!");
          return;
          if (!confirm("Are you sure you want to delete this track?")) {
            return;
          }
          deleteTrack();
        }}
      >
        <span className="text-red-600">Delete From Library</span>
      </Item>
    </Menu>
  );
}
