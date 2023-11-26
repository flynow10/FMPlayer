import TrackShape from "@/src/components/functions/shapedContainers/TrackShape";
import { useDatabase } from "@/src/hooks/use-database";
import { MusicLibrary } from "@/src/music/library/music-library";
import { UniqueIdentifier, useDraggable } from "@dnd-kit/core";
import classNames from "classnames";
import { Menu } from "lucide-react";

type TrackLiteralProps = {
  id: UniqueIdentifier;
  trackId: string;
  setTrackId: (newTrackId: string) => void;
  inToolBox: boolean;
};

export default function TrackLiteral(props: TrackLiteralProps) {
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, isDragging } =
    useDraggable({
      id: props.id,
    });
  const [tracks] = useDatabase(() => MusicLibrary.db.track.list(), [], "Track");
  return (
    <TrackShape
      ref={setNodeRef}
      className={classNames(
        "bg-accent",
        "dark:bg-inverted-accent",
        "overflow-hidden",
        "flex",
        "gap-1",
        {
          "opacity-20": isDragging,
        }
      )}
    >
      <div ref={setActivatorNodeRef} {...attributes} {...listeners}>
        <Menu />
      </div>
      <span>
        {props.trackId.length > 0
          ? tracks.find(({ id }) => id === props.trackId)?.title ??
            "Unknown Track"
          : "Select a track"}
      </span>
    </TrackShape>
  );
}
