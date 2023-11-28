import TrackLiteral from "@/src/components/functions/draggables/TrackLiteral";
import TrackShapeInsert from "@/src/components/functions/shaped-containers/TrackShapeInsert";
import { Functions } from "@/src/types/functions";
import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";

type TrackDroppableProps = {
  actionId: UniqueIdentifier;
  trackExpression: Functions.TrackExpression | null;
  setTrackExpression: Functions.SetTrackExpression;
};

export default function TrackDroppable({
  actionId,
  trackExpression,
  setTrackExpression,
}: TrackDroppableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `tracks-${actionId}`,
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
                : { id: trackExpression.id, trackId }
            );
          }}
        />
      ) : (
        <span>Track Expression</span>
      )}
    </TrackShapeInsert>
  );
}
