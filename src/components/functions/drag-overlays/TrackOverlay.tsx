import { useContext } from "react";

import TrackLiteral from "@/src/components/functions/draggables/TrackLiteral";

import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { fadeOutAnimationConfig } from "@/src/music/functions/core/fade-out-animation";
import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { findActionDeep } from "@/src/music/functions/utils/find-action-deep";
import { parseActionId } from "@/src/music/functions/utils/parse-action-id";
import { Functions } from "@/src/types/functions";

import { DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
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
      ? findActionDeep(functionTree, activeId) ??
        createEmpty[parseActionId(activeId).type]()
      : null;
  return createPortal(
    <DragOverlay
      dropAnimation={fadeOutAnimationConfig}
      modifiers={[restrictToWindowEdges]}
    >
      {activeId &&
      activeGroup === "tracks" &&
      trackExpression &&
      trackExpression.type === "trackliteral" ? (
        <TrackLiteral
          id={trackExpression.id}
          trackId={(trackExpression as Functions.TrackLiteral).data.trackId}
          clone
          inToolBox={false}
          setTrackId={() => {}}
        />
      ) : null}
    </DragOverlay>,
    document.body
  );
}
