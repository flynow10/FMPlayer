import TrackLiteral from "@/src/components/functions/draggables/TrackLiteral";
import { fadeOutAnimationConfig } from "@/src/components/functions/utils/fade-out-animation";
import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { findTrackExpressionDeep } from "@/src/music/functions/utils/find-track-expression-deep";
import { parseId } from "@/src/music/functions/utils/parse-id";
import { Functions } from "@/src/types/functions";
import { DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useContext } from "react";
import { createPortal } from "react-dom";

type TrackOverlayProps = {
  functionTree: Functions.FunctionTree;
};

export default function TrackOverlay({ functionTree }: TrackOverlayProps) {
  const functionCtx = useContext(FunctionEditor);
  if (functionCtx === null) {
    throw new Error("Track Overlay was used outside of a function context!");
  }
  const { activeId, activeGroup } = functionCtx;
  const trackExpression =
    activeGroup === "tracks" && activeId && typeof activeId === "string"
      ? findTrackExpressionDeep(functionTree, activeId) ??
        createEmpty.tracks[
          parseId(activeId).type as Functions.TrackExpressionType
        ]()
      : null;
  return createPortal(
    <DragOverlay
      dropAnimation={fadeOutAnimationConfig}
      modifiers={[restrictToWindowEdges]}
    >
      {activeId && activeGroup === "tracks" && trackExpression ? (
        <TrackLiteral
          id={trackExpression.id}
          trackId={trackExpression.trackId ?? ""}
          clone
          inToolBox={false}
          setTrackId={() => {}}
        />
      ) : null}
    </DragOverlay>,
    document.body
  );
}
