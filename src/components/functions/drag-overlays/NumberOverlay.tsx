import { useContext } from "react";

import BinaryArithmetic from "@/src/components/functions/draggables/BinaryArithmetic";
import NumberLiteral from "@/src/components/functions/draggables/NumberLiteral";

import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { fadeOutAnimationConfig } from "@/src/music/functions/core/fade-out-animation";
import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { findActionDeep } from "@/src/music/functions/utils/find-action-deep";
import { parseActionId } from "@/src/music/functions/utils/parse-action-id";
import { Functions } from "@/src/types/functions";

import { DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { createPortal } from "react-dom";

type NumberOverlayProps = {
  functionTree: Functions.FunctionTree;
};

export default function NumberOverlay({ functionTree }: NumberOverlayProps) {
  const functionCtx = useContext(FunctionEditor);
  if (functionCtx === null) {
    throw new Error("Number Overlay was used outside of a function context!");
  }
  const { activeId, activeGroup } = functionCtx;
  const numberExpression =
    activeGroup === "numbers" && activeId && typeof activeId === "string"
      ? findActionDeep(functionTree, activeId) ??
        createEmpty[parseActionId(activeId).type]()
      : null;
  return createPortal(
    <DragOverlay
      dropAnimation={fadeOutAnimationConfig}
      modifiers={[restrictToWindowEdges]}
    >
      {activeId && activeGroup === "numbers" && numberExpression ? (
        numberExpression.type === "numberliteral" ? (
          <NumberLiteral
            id={numberExpression.id}
            disabled
            setValue={() => {}}
            value={(numberExpression as Functions.NumberLiteral).data.value}
          />
        ) : (
          <BinaryArithmetic
            id={numberExpression.id}
            clone
            inToolBox={false}
            left={numberExpression.numberExpressions[0] ?? null}
            op={(numberExpression as Functions.BinaryArithmetic).data.operator}
            right={numberExpression.numberExpressions[1] ?? null}
            setLeft={() => {}}
            setOp={() => {}}
            setRight={() => {}}
          />
        )
      ) : null}
    </DragOverlay>,
    document.body
  );
}
