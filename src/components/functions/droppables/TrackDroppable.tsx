import TrackLiteral from "@/src/components/functions/draggables/TrackLiteral";
import TrackShapeInsert from "@/src/components/functions/shaped-containers/TrackShapeInsert";
import { generateGroupId } from "@/src/music/functions/utils/generate-group-id";
import { Functions } from "@/src/types/functions";
import { useDroppable } from "@dnd-kit/core";

type TrackDroppableProps = {
  parentId: string;
  index?: number;
  disabled?: boolean;
  trackExpression: Functions.TrackExpression | null;
  setTrackExpression: Functions.SetTrackExpression;
};

export default function TrackDroppable({
  parentId,
  index = 0,
  disabled,
  trackExpression,
  setTrackExpression,
}: TrackDroppableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: generateGroupId("tracks", "drop", parentId, index),
    disabled,
  });
  return (
    <TrackShapeInsert ref={setNodeRef} over={isOver}>
      {trackExpression !== null ? (
        <TrackLiteral
          id={trackExpression.id}
          trackId={trackExpression.trackId}
          inToolBox={false}
          clone={false}
          setTrackId={(trackId) => {
            setTrackExpression((prev) =>
              prev !== null
                ? { ...prev, trackId }
                : { id: trackExpression.id, trackId, type: "literal" }
            );
          }}
        />
      ) : (
        <span>Track Expression</span>
      )}
    </TrackShapeInsert>
  );
}
