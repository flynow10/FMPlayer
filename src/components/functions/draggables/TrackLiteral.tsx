import TrackShape from "@/src/components/functions/shaped-containers/TrackShape";
import { useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";
import { UniqueIdentifier, useDraggable } from "@dnd-kit/core";
import classNames from "classnames";
import { Menu } from "lucide-react";
import { useMemo } from "react";
import Select from "react-select";

type TrackLiteralProps = {
  id: UniqueIdentifier;
  trackId: string;
  setTrackId: (newTrackId: string) => void;
  clone: boolean;
  inToolBox: boolean;
};

export default function TrackLiteral(props: TrackLiteralProps) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, isDragging } =
    useDraggable({
      id: props.id,
    });
  const [tracks] = useDatabase(() => MusicLibrary.db.track.list(), [], "Track");

  const valueLabelTracks = useMemo(
    () =>
      tracks.map((track) => ({
        ...track,
        value: track.id,
        label: track.title,
      })),
    [tracks]
  );
  return (
    <TrackShape
      ref={setNodeRef}
      className={classNames(
        "bg-accent",
        "dark:bg-inverted-accent",
        "overflow-hidden",
        "flex",
        "items-center",
        {
          "opacity-20": isDragging,
          "pointer-events-none": props.clone,
        }
      )}
    >
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="p-2"
      >
        <Menu />
      </div>
      <Select
        options={valueLabelTracks}
        isDisabled={props.inToolBox || props.clone}
        menuPortalTarget={document.body}
        isSearchable
        placeholder={"Select a Track"}
        value={valueLabelTracks.find(({ id }) => id === props.trackId) ?? null}
        onChange={(track) => {
          if (track) {
            props.setTrackId(track.id);
          }
        }}
        unstyled
        classNames={{
          container: (state) =>
            classNames(
              "mr-2",
              "rounded-md",
              "min-w-[200px]",
              "cursor-text",
              "box-border",
              {
                "text-gray-700": state.isDisabled,
              }
            ),
          valueContainer: () => "py-1 px-2",
          menu: () => "rounded-md p-1 bg-white drop-shadow-md",
          indicatorSeparator: () =>
            "self-stretch w-[1px] my-2 box-border bg-zinc-800",
          dropdownIndicator: () => "flex p-2",
          option: (state) =>
            classNames("p-2", {
              "bg-accent dark:bg-inverted-accent": state.isFocused,
            }),
        }}
      />
    </TrackShape>
  );
}
