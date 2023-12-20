import BinaryArithmetic from "@/src/components/functions/draggables/BinaryArithmetic";
import NumberLiteral from "@/src/components/functions/draggables/NumberLiteral";
import NumberShapeInsert from "@/src/components/functions/shaped-containers/NumberShapeInsert";

import { checkActionParams } from "@/src/music/functions/utils/check-action-params";
import { createEmpty } from "@/src/music/functions/utils/create-empty";
import { generateActionId } from "@/src/music/functions/utils/generate-action-id";
import { generateDropId } from "@/src/music/functions/utils/generate-drop-id";
import { Functions } from "@/src/types/functions";

import { useDroppable } from "@dnd-kit/core";

type NumberDroppableProps = {
  parentId: string;
  index?: number;
  inToolBox: boolean;
  clone: boolean;
  numberExpression: Functions.ActionState | null;
  setNumberExpression: Functions.SetAction;
};

export default function NumberDroppable({
  parentId,
  index = 0,
  clone,
  inToolBox,
  numberExpression,
  setNumberExpression,
}: NumberDroppableProps) {
  const id = generateDropId("numbers", index, parentId);
  const disabled = clone || inToolBox;
  const { setNodeRef, isOver } = useDroppable({
    id,
    disabled,
  });
  const tempId = generateActionId("numbers", "numberliteral");
  let contents = (
    <NumberLiteral
      id={numberExpression?.id ?? tempId}
      value={(numberExpression as Functions.NumberLiteral)?.data?.value ?? NaN}
      disabled={disabled}
      setValue={(value) => {
        setNumberExpression((prev) => {
          if (Number.isNaN(value)) {
            return null;
          }
          return prev && prev.type === "numberliteral"
            ? { ...prev, data: { value } }
            : { ...createEmpty.numberliteral(), id: tempId, data: { value } };
        });
      }}
    />
  );
  if (numberExpression !== null) {
    switch (numberExpression.type) {
      case "binaryarith": {
        checkActionParams(numberExpression, 0, 2, false);
        const setOperands =
          (side: 0 | 1) =>
          (value: React.SetStateAction<Functions.ActionState | null>) => {
            setNumberExpression((prevExpression) => {
              let newNumberExpression: Functions.ActionState | null;
              if (typeof value === "function") {
                newNumberExpression = value(
                  prevExpression?.numberExpressions[side] ?? null
                );
              } else {
                newNumberExpression = value;
              }
              let newNumberExpressionChildList: Functions.NullableTree = [];
              if (prevExpression && prevExpression.type === "binaryarith") {
                newNumberExpressionChildList = [
                  ...prevExpression.numberExpressions,
                ];
              }
              newNumberExpressionChildList[side] = newNumberExpression;
              if (prevExpression && prevExpression.type === "binaryarith") {
                return {
                  ...prevExpression,
                  numberExpressions: newNumberExpressionChildList,
                };
              } else {
                return {
                  ...createEmpty.binaryarith(),
                  numberExpressions: newNumberExpressionChildList,
                };
              }
            });
          };
        contents = (
          <BinaryArithmetic
            id={numberExpression.id}
            inToolBox={false}
            clone={false}
            left={numberExpression.numberExpressions[0] ?? null}
            right={numberExpression.numberExpressions[1] ?? null}
            op={(numberExpression as Functions.BinaryArithmetic).data.operator}
            setOp={(op) => {
              setNumberExpression((prev) => {
                if (prev !== null && prev.type === "binaryarith") {
                  return { ...prev, data: { operator: op } };
                } else {
                  return {
                    ...createEmpty.binaryarith(),
                    data: {
                      operator: op,
                    },
                  };
                }
              });
            }}
            setLeft={setOperands(0)}
            setRight={setOperands(1)}
          />
        );
      }
    }
  }
  return (
    <NumberShapeInsert ref={setNodeRef} over={isOver}>
      {contents}
    </NumberShapeInsert>
  );
}
