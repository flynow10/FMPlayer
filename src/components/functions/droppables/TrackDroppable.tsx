import TrackLiteral from "@/src/components/functions/draggables/TrackLiteral";
import TrackShapeInsert from "@/src/components/functions/shaped-containers/TrackShapeInsert";
import { generateDropId } from "@/src/music/functions/utils/generate-drop-id";
import { Functions } from "@/src/types/functions";
import { useDroppable } from "@dnd-kit/core";
import { createEmpty } from "@/src/music/functions/utils/create-empty";

type TrackDroppableProps = {
  parentId: string;
  index?: number;
  disabled?: boolean;
  trackExpression: Functions.ActionState | null;
  setTrackExpression: Functions.SetAction;
};

export default function TrackDroppable({
  parentId,
  index = 0,
  disabled,
  trackExpression,
  setTrackExpression,
}: TrackDroppableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: generateDropId("tracks", index, parentId),
    disabled,
  });
  return (
    <TrackShapeInsert ref={setNodeRef} over={isOver}>
      {trackExpression !== null && trackExpression.type === "trackliteral" ? (
        <TrackLiteral
          id={trackExpression.id}
          trackId={(trackExpression as Functions.TrackLiteral).data.trackId}
          inToolBox={false}
          clone={false}
          setTrackId={(trackId) => {
            setTrackExpression((prev) =>
              prev !== null
                ? { ...prev, data: { trackId } }
                : { ...createEmpty.trackliteral(), data: { trackId } }
            );
          }}
        />
      ) : (
        <span>Track Expression</span>
      )}
    </TrackShapeInsert>
  );
}
