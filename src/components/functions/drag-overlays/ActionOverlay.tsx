import { useContext } from "react";

import SortableAction from "@/src/components/functions/SortableAction";

import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { fadeOutAnimationConfig } from "@/src/music/functions/core/fade-out-animation";
import { findActionDeep } from "@/src/music/functions/utils/find-action-deep";
import { getChildCount } from "@/src/music/functions/utils/get-count";
import { Functions } from "@/src/types/functions";

import { DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { createPortal } from "react-dom";

type ActionOverlayProps = {
  functionTree: Functions.FunctionTree;
};

export default function ActionOverlay({ functionTree }: ActionOverlayProps) {
  const functionCtx = useContext(FunctionEditor);
  if (functionCtx === null) {
    throw new Error("Action Overlay was used outside of a function context!");
  }
  const { activeId, activeGroup } = functionCtx;
  const activeAction =
    activeGroup === "actions" && activeId
      ? findActionDeep(functionTree, activeId) ?? null
      : null;
  return createPortal(
    <DragOverlay
      modifiers={[restrictToWindowEdges]}
      dropAnimation={fadeOutAnimationConfig}
    >
      {activeId && activeAction && activeGroup === "actions" ? (
        <SortableAction
          id={activeAction.id}
          action={activeAction}
          setAction={() => {}}
          depth={0}
          childCount={getChildCount(functionTree, activeAction.id) + 1}
          clone
        />
      ) : null}
    </DragOverlay>,
    document.body
  );
}
