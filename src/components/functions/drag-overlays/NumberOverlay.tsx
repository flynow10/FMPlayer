import BinaryArithmetic from "@/src/components/functions/draggables/BinaryArithmetic";
import NumberLiteral from "@/src/components/functions/draggables/NumberLiteral";
import { fadeOutAnimationConfig } from "@/src/components/functions/utils/fade-out-animation";
import { FunctionEditor } from "@/src/contexts/FunctionEditor";
import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { findNumberExpressionDeep } from "@/src/music/functions/utils/find-number-expression-deep";
import { parseId } from "@/src/music/functions/utils/parse-id";
import { Functions } from "@/src/types/functions";
import { DragOverlay } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useContext } from "react";
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
      ? findNumberExpressionDeep(functionTree, activeId) ??
        createEmpty.numbers[
          parseId(activeId).type as Functions.NumberExpressionType
        ]()
      : null;
  return createPortal(
    <DragOverlay
      dropAnimation={fadeOutAnimationConfig}
      modifiers={[restrictToWindowEdges]}
    >
      {activeId && activeGroup === "numbers" && numberExpression ? (
        numberExpression.type === "literal" ? (
          <NumberLiteral
            id={numberExpression.id}
            clone
            inToolBox={false}
            setValue={() => {}}
            value={numberExpression.value}
          />
        ) : (
          <BinaryArithmetic
            id={numberExpression.id}
            clone
            inToolBox={false}
            left={numberExpression.left}
            op={numberExpression.op}
            right={numberExpression.right}
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
