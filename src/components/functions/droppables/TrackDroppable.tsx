import TrackLiteral from "@/src/components/functions/draggables/TrackLiteral";
import TrackShapeInsert from "@/src/components/functions/shapedContainers/TrackShapeInsert";
import { Functions } from "@/src/types/functions";
import { UniqueIdentifier, useDroppable } from "@dnd-kit/core";

type TrackDroppableProps = {
  actionId: UniqueIdentifier;
  trackExpression: Functions.TrackExpression | null;
};

export default function TrackDroppable({
  actionId,
  trackExpression,
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
          setTrackId={() => {}}
        />
      ) : null}
    </TrackShapeInsert>
  );
}
